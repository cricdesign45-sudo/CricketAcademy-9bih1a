import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Player } from '@/types';

const supabase = getSupabaseClient();

export type AIAnalysisType =
  | 'performance'
  | 'training'
  | 'fitness'
  | 'attendance'
  | 'fee_prediction'
  | 'injury_risk'
  | 'weekly_summary';

export interface AIAnalysisResult {
  content: string;
  error: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Analyze a player with AI ─────────────────────────────────────────────────
export async function analyzePlayer(
  player: Player,
  analysisType: AIAnalysisType,
  allPlayers?: Player[]
): Promise<AIAnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-cricket', {
      body: { action: 'analyze', player, analysisType, allPlayers },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const txt = await error.context?.text();
          msg = txt || msg;
        } catch { /* */ }
      }
      return { content: '', error: msg };
    }

    return { content: data?.content ?? '', error: null };
  } catch (e: any) {
    return { content: '', error: e?.message ?? 'Unknown error' };
  }
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export async function sendChatMessage(
  messages: ChatMessage[],
  player: Player | null,
  sessionId: string
): Promise<{ reply: string; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-cricket', {
      body: { action: 'chat', messages, player, sessionId },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const txt = await error.context?.text();
          msg = txt || msg;
        } catch { /* */ }
      }
      return { reply: '', error: msg };
    }

    return { reply: data?.reply ?? '', error: null };
  } catch (e: any) {
    return { reply: '', error: e?.message ?? 'Unknown error' };
  }
}

// ─── Weekly Summary (all players) ────────────────────────────────────────────
export async function generateWeeklySummary(
  players: Player[],
  fees: any[]
): Promise<AIAnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-cricket', {
      body: { action: 'weekly_summary', players, fees },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const txt = await error.context?.text();
          msg = txt || msg;
        } catch { /* */ }
      }
      return { content: '', error: msg };
    }

    return { content: data?.content ?? '', error: null };
  } catch (e: any) {
    return { content: '', error: e?.message ?? 'Unknown error' };
  }
}
