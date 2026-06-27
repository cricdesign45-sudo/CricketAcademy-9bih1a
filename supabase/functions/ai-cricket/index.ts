// ai-cricket Edge Function
// Handles: player analysis, AI chat, weekly summary for Cricket Academy
// AI Provider: OpenRouter

import { corsHeaders } from '../_shared/cors.ts';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = `You are an expert cricket coach and sports analyst AI assistant for a Cricket Academy Management System.
You provide detailed, actionable insights in a professional yet encouraging tone.
All recommendations should be specific, measurable, and cricket-specific.
Format your responses clearly with sections and bullet points where appropriate.
Keep responses concise but comprehensive (200-400 words max per analysis).`;

function buildPlayerContext(player: any): string {
  return `
Player Profile:
- Name: ${player.name}, Age: ${player.age}, Role: ${player.playingRole}
- Batting: ${player.batting.matches} matches, ${player.batting.runs} runs, avg ${player.batting.average?.toFixed(1)}, SR ${player.batting.strikeRate?.toFixed(1)}, HS ${player.batting.highestScore}
- Bowling: ${player.bowling.overs} overs, ${player.bowling.wickets} wickets, economy ${player.bowling.economyRate?.toFixed(1)}, best ${player.bowling.bestFigures}
- Fielding: ${player.fielding.catches} catches, ${player.fielding.runOuts} run-outs, ${player.fielding.stumpings} stumpings
- Fitness: Speed ${player.fitness.speed}/100, Strength ${player.fitness.strength}/100, Stamina ${player.fitness.stamina}/100, Overall ${player.fitness.fitnessScore}/100
- Attendance: ${player.attendancePercentage}%
- Points: ${player.points} total, Rank #${player.rank}, Level ${player.level}
- Coach: ${player.coachName}
- Coach Overall Rating: ${player.coachEvaluation?.overallRating}/10
- Coach Remarks: ${player.coachEvaluation?.remarks}
- Discipline Points: ${player.disciplinePoints}
- Experience: ${player.experience}
- Batting Skill Avg: ${calcAvg(player.skillScores?.batting)}/10
- Bowling Skill Avg: ${calcAvg(player.skillScores?.bowling)}/10
`.trim();
}

function calcAvg(skills: Record<string, number> | undefined): string {
  if (!skills) return 'N/A';
  const vals = Object.values(skills).filter(v => typeof v === 'number');
  if (!vals.length) return 'N/A';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

const ANALYSIS_PROMPTS: Record<string, (ctx: string) => string> = {
  performance: (ctx) => `${ctx}\n\nProvide a comprehensive performance analysis for this cricket player. Include:
1. **Batting Analysis** – strengths, weaknesses, key metrics assessment
2. **Bowling Analysis** – effectiveness, areas to watch
3. **Overall Assessment** – current form, potential, ranking context
4. **Key Metrics** – highlight 3-4 standout numbers (good or concerning)`,

  training: (ctx) => `${ctx}\n\nCreate a personalized training plan for this player. Include:
1. **Priority Focus Areas** – top 3 skills needing immediate work
2. **Weekly Training Schedule** – specific drills for each day
3. **Batting Drills** – tailored to their role and weaknesses
4. **Bowling Drills** – based on their bowling style and stats
5. **Fitness Goals** – specific targets based on current scores`,

  fitness: (ctx) => `${ctx}\n\nProvide a fitness assessment and recommendations:
1. **Current Fitness Status** – evaluate speed, strength, stamina scores
2. **Fitness Grade** – Bronze/Silver/Gold/Platinum based on scores
3. **Weakest Area** – identify and address the lowest fitness metric
4. **Recommended Exercises** – sport-specific cricket fitness routines
5. **Target Milestones** – 4-week and 8-week fitness goals
6. **Recovery & Nutrition** – brief advice for cricket players`,

  attendance: (ctx) => `${ctx}\n\nAnalyze this player's attendance and provide insights:
1. **Attendance Assessment** – current % vs academy standards (85%+ target)
2. **Impact on Performance** – how attendance correlates with their stats
3. **Risk Level** – Low/Medium/High based on attendance pattern
4. **Improvement Plan** – specific steps to improve consistency
5. **Points Impact** – calculate approximate points lost/gained from attendance`,

  fee_prediction: (ctx) => `${ctx}\n\nProvide fee payment behavior analysis:
1. **Payment Pattern** – predicted reliability based on discipline/attendance
2. **Risk Classification** – Low/Medium/High default risk
3. **Recommended Fee Plan** – best payment schedule for this player
4. **Fee Waiver Eligibility** – based on academic/performance merit
5. **Scholarship Potential** – assess if player qualifies for fee discount based on performance`,

  injury_risk: (ctx) => `${ctx}\n\nConduct an injury risk assessment:
1. **Overall Risk Level** – Low/Medium/High with explanation
2. **High-Risk Areas** – specific body parts to watch based on role
3. **Fitness Vulnerabilities** – which low-fitness scores increase injury risk
4. **Prevention Protocol** – specific warm-up and injury prevention routines
5. **Load Management** – recommended training intensity adjustments
6. **Red Flags** – any immediate concerns to address`,
};

async function callOpenRouter(apiKey: string, messages: any[], maxTokens = 800): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://onspace.ai',
      'X-Title': 'Cricket Academy AI',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action } = body;

    // ─── Player Analysis ─────────────────────────────────────────────────────
    if (action === 'analyze') {
      const { player, analysisType } = body;
      const ctx = buildPlayerContext(player);
      const promptFn = ANALYSIS_PROMPTS[analysisType];

      if (!promptFn) {
        return new Response(JSON.stringify({ error: 'Unknown analysis type' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const content = await callOpenRouter(apiKey, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptFn(ctx) },
      ], 800);

      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Weekly Summary ───────────────────────────────────────────────────────
    if (action === 'weekly_summary') {
      const { players, fees } = body;

      const activePlayers = players?.filter((p: any) => p.isActive) ?? [];
      const avgAttendance = activePlayers.length
        ? Math.round(activePlayers.reduce((s: number, p: any) => s + p.attendancePercentage, 0) / activePlayers.length)
        : 0;
      const topPlayer = [...activePlayers].sort((a: any, b: any) => b.points - a.points)[0];
      const overdueFees = fees?.filter((f: any) => f.status === 'overdue').length ?? 0;
      const collectedFees = fees?.filter((f: any) => f.status === 'paid').reduce((s: number, f: any) => s + f.amount, 0) ?? 0;

      const summaryPrompt = `
Academy Weekly Summary Data:
- Total Players: ${players?.length ?? 0} (${activePlayers.length} active)
- Average Attendance: ${avgAttendance}%
- Top Player: ${topPlayer?.name ?? 'N/A'} (${topPlayer?.points?.toLocaleString() ?? 0} points, Rank #${topPlayer?.rank ?? 'N/A'})
- Fee Collection: Rs.${collectedFees.toLocaleString()} collected, ${overdueFees} overdue
- Player Roles: ${[...new Set(activePlayers.map((p: any) => p.playingRole))].join(', ')}
- Top 3 by Points: ${activePlayers.slice(0, 3).map((p: any) => `${p.name} (${p.points}pts)`).join(', ')}
- Players with <80% Attendance: ${activePlayers.filter((p: any) => p.attendancePercentage < 80).length}
- Total Academy Points: ${activePlayers.reduce((s: number, p: any) => s + p.points, 0).toLocaleString()}

Generate a comprehensive weekly academy summary report with:
1. **Performance Highlights** - standout players and achievements
2. **Attendance Overview** - patterns, concerns, top attendees
3. **Fee Status** - collection summary, action needed
4. **This Week's Focus** - top 3 priorities for coaches
5. **Academy Health Score** - overall assessment (Excellent/Good/Needs Attention)
6. **Action Items** - specific tasks for admin this week`;

      const content = await callOpenRouter(apiKey, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: summaryPrompt },
      ], 1000);

      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Chat ─────────────────────────────────────────────────────────────────
    if (action === 'chat') {
      const { messages, player } = body;

      const chatSystemPrompt = player
        ? `${SYSTEM_PROMPT}

You are currently assisting player: ${player.name} (${player.playingRole}, ${player.attendancePercentage}% attendance, ${player.points} points, Rank #${player.rank}).
Be personal, encouraging, and specific to cricket. Address the player by first name.
You can answer questions about their stats, training, cricket rules, mental tips, nutrition, and academy matters.`
        : `${SYSTEM_PROMPT}
You are assisting an academy admin. Provide management insights, cricket analytics, and operational guidance.`;

      const reply = await callOpenRouter(apiKey, [
        { role: 'system', content: chatSystemPrompt },
        ...(messages ?? []),
      ], 600);

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
