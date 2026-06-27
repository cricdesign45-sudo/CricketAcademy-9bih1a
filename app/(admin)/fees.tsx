import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Fee } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  paid:    { color: Colors.success, icon: 'check-circle',  label: 'Paid' },
  pending: { color: Colors.warning, icon: 'schedule',       label: 'Pending' },
  overdue: { color: Colors.error,   icon: 'error',          label: 'Overdue' },
  partial: { color: Colors.info,    icon: 'timelapse',      label: 'Partial' },
  waived:  { color: Colors.textMuted, icon: 'block',        label: 'Waived' },
};

const METHODS = [
  { key: 'cash',          label: 'Cash',          icon: 'payments' },
  { key: 'upi',           label: 'UPI',           icon: 'phone-android' },
  { key: 'online',        label: 'Online',        icon: 'language' },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: 'account-balance' },
] as const;

type Method = typeof METHODS[number]['key'];

function netDue(fee: Fee) {
  return fee.amount - fee.discountAmount + fee.lateFee - fee.paidAmount;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[st.statCard, { borderTopColor: color }]}>
      <Text style={[st.statVal, { color }]}>{value}</Text>
      <Text style={st.statLbl}>{label}</Text>
    </View>
  );
}

function FeeCard({
  fee, onCollect, onWaive, onDelete,
}: {
  fee: Fee;
  onCollect: () => void;
  onWaive: () => void;
  onDelete: () => void;
}) {
  const sc = STATUS_CONFIG[fee.status] ?? STATUS_CONFIG.pending;
  const due = netDue(fee);
  const isActionable = fee.status === 'pending' || fee.status === 'overdue' || fee.status === 'partial';

  return (
    <View style={[st.card, { borderLeftColor: sc.color, borderLeftWidth: 3 }]}>
      {/* Top row */}
      <View style={st.cardTop}>
        <View style={[st.avatarCircle, { backgroundColor: sc.color + '18' }]}>
          <Text style={[st.avatarText, { color: sc.color }]}>{fee.playerName[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.cardName}>{fee.playerName}</Text>
          <Text style={st.cardDesc} numberOfLines={1}>{fee.description}</Text>
          <Text style={st.cardDue}>Due: {fee.dueDate}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={[st.cardAmt, { color: sc.color }]}>
            ₹{(fee.amount + fee.lateFee - fee.discountAmount).toLocaleString()}
          </Text>
          {fee.status === 'partial' && (
            <Text style={[st.cardPartial, { color: Colors.success }]}>₹{fee.paidAmount} paid</Text>
          )}
          <View style={[st.badge, { backgroundColor: sc.color + '15' }]}>
            <MaterialIcons name={sc.icon} size={10} color={sc.color} />
            <Text style={[st.badgeTxt, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      {(fee.discountAmount > 0 || fee.lateFee > 0 || fee.isScholarship) ? (
        <View style={st.tagsRow}>
          {fee.isScholarship && <Tag label={`🎓 ${fee.scholarshipPercent}% scholarship`} color={Colors.gold} />}
          {!fee.isScholarship && fee.discountAmount > 0 && <Tag label={`-₹${fee.discountAmount} discount`} color={Colors.success} />}
          {fee.lateFee > 0 && <Tag label={`+₹${fee.lateFee} late`} color={Colors.error} />}
        </View>
      ) : null}

      {/* Actions */}
      {isActionable ? (
        <View style={st.actions}>
          <TouchableOpacity style={[st.collectBtn, { backgroundColor: Colors.success }]} onPress={onCollect}>
            <MaterialIcons name="payment" size={14} color="#fff" />
            <Text style={st.collectBtnTxt}>Collect ₹{due.toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.iconAction} onPress={onWaive}>
            <MaterialIcons name="block" size={16} color={Colors.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={st.iconAction} onPress={onDelete}>
            <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[st.actions, { justifyContent: 'flex-end' }]}>
          {fee.receiptNumber ? (
            <View style={[st.receiptTag, { backgroundColor: Colors.success + '12' }]}>
              <MaterialIcons name="receipt" size={12} color={Colors.success} />
              <Text style={[st.receiptTagTxt, { color: Colors.success }]}>{fee.receiptNumber}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={st.iconAction} onPress={onDelete}>
            <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[st.tag, { backgroundColor: color + '15', borderColor: color + '40' }]}>
      <Text style={[st.tagTxt, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = 'dues' | 'all' | 'generate';

export default function FeesScreen() {
  const insets = useSafeAreaInsets();
  const { players, fees, addFee, markFeePaid, markFeePartialPaid, waiveFee, deleteFee } = usePlayers();
  const { showAlert } = useAlert();

  const [tab, setTab] = useState<Tab>('dues');
  const [search, setSearch] = useState('');

  // ── Payment modal ──
  const [payFee, setPayFee] = useState<Fee | null>(null);
  const [method, setMethod] = useState<Method>('cash');
  const [partial, setPartial] = useState(false);
  const [partialAmt, setPartialAmt] = useState('');
  const [txnId, setTxnId] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // ── Add fee modal ──
  const [showAdd, setShowAdd] = useState(false);
  const [addPlayerId, setAddPlayerId] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addDue, setAddDue] = useState(new Date().toISOString().split('T')[0]);
  const [addType, setAddType] = useState<Fee['feeType']>('monthly');

  // ── Generate modal ──
  const [showGenerate, setShowGenerate] = useState(false);
  const [genAmount, setGenAmount] = useState('2000');
  const [genMonth, setGenMonth] = useState(new Date().getMonth());
  const [genYear] = useState(new Date().getFullYear());
  const [genDueDay, setGenDueDay] = useState('10');

  const activePlayers = players.filter(p => p.isActive);

  // ── Stats ──
  const collected = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.paidAmount, 0);
  const pendingAmt = fees.filter(f => ['pending', 'overdue', 'partial'].includes(f.status)).reduce((s, f) => s + netDue(f), 0);
  const overdueCount = fees.filter(f => f.status === 'overdue').length;
  const totalBilled = fees.reduce((s, f) => s + f.amount + f.lateFee - f.discountAmount, 0);
  const rate = totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 0;

  // ── Filtered lists ──
  const q = search.toLowerCase();
  const duesFees = useMemo(() => fees.filter(f =>
    ['pending', 'overdue', 'partial'].includes(f.status) &&
    (!q || f.playerName.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
  ).sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }), [fees, q]);

  const allFees = useMemo(() => fees.filter(f =>
    !q || f.playerName.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
  ).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()), [fees, q]);

  // ── Handlers ──
  const openPay = (fee: Fee) => {
    setPayFee(fee);
    setMethod('cash');
    setPartial(false);
    setPartialAmt(netDue(fee).toString());
    setTxnId('');
    setPayNotes('');
  };

  const handlePay = () => {
    if (!payFee) return;
    const due = netDue(payFee);
    if (partial) {
      const amt = parseFloat(partialAmt) || 0;
      if (amt <= 0 || amt >= due) {
        showAlert('Invalid Amount', `Must be between ₹1 and ₹${due - 1}`);
        return;
      }
      markFeePartialPaid(payFee.id, payFee.paidAmount + amt, method, payNotes);
      showAlert('Recorded', `₹${amt} partial payment recorded`);
    } else {
      markFeePaid(payFee.id, method, payNotes, txnId);
      showAlert('Payment Confirmed', `₹${due} collected from ${payFee.playerName}`);
    }
    setPayFee(null);
  };

  const handleAddFee = () => {
    if (!addPlayerId || !addAmount || !addDesc) {
      showAlert('Missing Fields', 'Player, amount and description are required');
      return;
    }
    const player = players.find(p => p.id === addPlayerId);
    if (!player) return;
    addFee({
      playerId: addPlayerId, playerName: player.name,
      amount: parseFloat(addAmount), feeType: addType, category: 'monthly',
      description: addDesc, dueDate: addDue,
      paidDate: null, status: 'pending', receivedBy: null, paidAmount: 0,
      paymentMethod: null, paymentNotes: '', discountAmount: 0,
      discountReason: '', lateFee: 0, isScholarship: false,
      scholarshipPercent: 0, receiptNumber: null, transactionId: null,
    });
    setShowAdd(false);
    setAddPlayerId(''); setAddAmount(''); setAddDesc('');
    setAddDue(new Date().toISOString().split('T')[0]);
    showAlert('Added', 'Fee record created');
  };

  const handleWaive = (fee: Fee) => {
    showAlert('Waive Fee?', `Waive ₹${netDue(fee)} for ${fee.playerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Waive', style: 'destructive', onPress: () => waiveFee(fee.id, 'Waived by admin') },
    ]);
  };

  const handleDelete = (fee: Fee) => {
    showAlert('Delete Record?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFee(fee.id) },
    ]);
  };

  const handleGenerate = () => {
    const amt = parseFloat(genAmount);
    if (!amt) { showAlert('Invalid Amount', 'Enter a valid fee amount'); return; }
    const day = Math.min(parseInt(genDueDay) || 10, 28);
    const mm = String(genMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dueDate = `${genYear}-${mm}-${dd}`;
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][genMonth];
    const desc = `Monthly Fee — ${monthName} ${genYear}`;
    const targets = activePlayers.filter(p => !fees.some(f =>
      f.playerId === p.id && f.feeType === 'monthly' &&
      f.dueDate.startsWith(`${genYear}-${mm}`)
    ));
    if (targets.length === 0) {
      showAlert('Already Generated', 'Monthly fees for this period already exist for all players');
      return;
    }
    targets.forEach(p => addFee({
      playerId: p.id, playerName: p.name,
      amount: amt, feeType: 'monthly', category: 'monthly',
      description: desc, dueDate, paidDate: null, status: 'pending',
      receivedBy: null, paidAmount: 0, paymentMethod: null, paymentNotes: '',
      discountAmount: 0, discountReason: '', lateFee: 0,
      isScholarship: false, scholarshipPercent: 0,
      receiptNumber: null, transactionId: null,
    }));
    setShowGenerate(false);
    showAlert('Generated', `${targets.length} fee records created`);
    setTab('dues');
  };

  const listData = tab === 'dues' ? duesFees : allFees;

  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={st.header}>
        <View>
          <Text style={st.title}>Fee Management</Text>
          <Text style={st.subtitle}>
            {overdueCount > 0 ? `⚠ ${overdueCount} overdue` : `${duesFees.length} pending`} · ₹{(pendingAmt / 1000).toFixed(1)}K due
          </Text>
        </View>
        <TouchableOpacity style={[st.addBtn, { backgroundColor: Colors.primary }]} onPress={() => setShowAdd(true)}>
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={st.addBtnTxt}>Add Fee</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats row ── */}
      <View style={st.statsRow}>
        <StatCard label="Collected" value={`₹${(collected / 1000).toFixed(1)}K`} color={Colors.success} />
        <StatCard label="Pending"   value={`₹${(pendingAmt / 1000).toFixed(1)}K`} color={Colors.warning} />
        <StatCard label="Rate"      value={`${rate}%`}                             color={Colors.info} />
        <StatCard label="Overdue"   value={`${overdueCount}`}                      color={Colors.error} />
      </View>

      {/* ── Tabs ── */}
      <View style={st.tabs}>
        {([
          { key: 'dues',     label: 'Dues',     icon: 'warning' },
          { key: 'all',      label: 'All',      icon: 'list' },
          { key: 'generate', label: 'Generate', icon: 'autorenew' },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[st.tab, tab === t.key && st.tabActive]}
            onPress={() => t.key === 'generate' ? setShowGenerate(true) : setTab(t.key)}
          >
            <MaterialIcons
              name={t.icon as any}
              size={14}
              color={tab === t.key ? Colors.textPrimary : Colors.textMuted}
            />
            <Text style={[st.tabTxt, tab === t.key && st.tabTxtActive]}>{t.label}</Text>
            {t.key === 'dues' && duesFees.length > 0 && (
              <View style={[st.tabBadge, { backgroundColor: Colors.warning }]}>
                <Text style={st.tabBadgeTxt}>{duesFees.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Search ── */}
      <View style={st.searchWrap}>
        <MaterialIcons name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={st.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search player..."
          placeholderTextColor={Colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Fee List ── */}
      <FlatList
        data={listData}
        keyExtractor={f => f.id}
        contentContainerStyle={st.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FeeCard
            fee={item}
            onCollect={() => openPay(item)}
            onWaive={() => handleWaive(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={st.empty}>
            <MaterialIcons name={tab === 'dues' ? 'check-circle' : 'receipt-long'} size={52} color={Colors.success} />
            <Text style={st.emptyTitle}>{tab === 'dues' ? 'All Clear!' : 'No Records'}</Text>
            <Text style={st.emptyDesc}>
              {tab === 'dues' ? 'No pending or overdue fees.' : 'No fee records yet. Tap Add Fee to get started.'}
            </Text>
          </View>
        }
      />

      {/* ══════════════════════════════════════════════════
          COLLECT PAYMENT MODAL
      ══════════════════════════════════════════════════ */}
      <Modal visible={!!payFee} animationType="slide" transparent onRequestClose={() => setPayFee(null)}>
        <View style={st.overlay}>
          <View style={st.sheet}>
            {/* Header */}
            <View style={st.sheetHeader}>
              <Text style={st.sheetTitle}>Collect Payment</Text>
              <TouchableOpacity onPress={() => setPayFee(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {payFee ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Player + amount card */}
                <View style={[st.payInfo, { backgroundColor: Colors.bgSurface }]}>
                  <View style={[st.avatarCircle, { backgroundColor: Colors.primary + '20', width: 48, height: 48, borderRadius: 24 }]}>
                    <Text style={[st.avatarText, { color: Colors.primary, fontSize: 20 }]}>{payFee.playerName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.payName}>{payFee.playerName}</Text>
                    <Text style={st.payDesc}>{payFee.description}</Text>
                  </View>
                  <Text style={[st.payDue, { color: Colors.warning }]}>₹{netDue(payFee).toLocaleString()}</Text>
                </View>

                {/* Partial toggle */}
                <View style={st.partialRow}>
                  <Text style={st.fieldLbl}>Partial payment?</Text>
                  <View style={st.partialBtns}>
                    <TouchableOpacity
                      style={[st.toggleBtn, !partial && { backgroundColor: Colors.primary }]}
                      onPress={() => setPartial(false)}
                    >
                      <Text style={[st.toggleTxt, !partial && { color: '#fff' }]}>Full</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[st.toggleBtn, partial && { backgroundColor: Colors.info }]}
                      onPress={() => setPartial(true)}
                    >
                      <Text style={[st.toggleTxt, partial && { color: '#fff' }]}>Partial</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {partial && (
                  <>
                    <Text style={st.fieldLbl}>Amount Collecting (₹)</Text>
                    <TextInput
                      style={st.input}
                      value={partialAmt}
                      onChangeText={setPartialAmt}
                      keyboardType="numeric"
                      placeholder="Enter amount"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </>
                )}

                {/* Method */}
                <Text style={st.fieldLbl}>Payment Method</Text>
                <View style={st.methodGrid}>
                  {METHODS.map(m => (
                    <TouchableOpacity
                      key={m.key}
                      style={[st.methodBtn, method === m.key && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }]}
                      onPress={() => setMethod(m.key)}
                    >
                      <MaterialIcons name={m.icon as any} size={20} color={method === m.key ? Colors.primary : Colors.textMuted} />
                      <Text style={[st.methodTxt, method === m.key && { color: Colors.primary, fontWeight: '600' }]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(method === 'upi' || method === 'online' || method === 'bank_transfer') && (
                  <>
                    <Text style={st.fieldLbl}>Transaction ID</Text>
                    <TextInput
                      style={st.input}
                      value={txnId}
                      onChangeText={setTxnId}
                      placeholder="UTR / Reference number"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </>
                )}

                <Text style={st.fieldLbl}>Notes (optional)</Text>
                <TextInput
                  style={st.input}
                  value={payNotes}
                  onChangeText={setPayNotes}
                  placeholder="Any notes..."
                  placeholderTextColor={Colors.textMuted}
                />

                <TouchableOpacity style={[st.confirmBtn, { backgroundColor: Colors.success }]} onPress={handlePay}>
                  <MaterialIcons name="check-circle" size={18} color="#fff" />
                  <Text style={st.confirmTxt}>
                    {partial ? `Confirm ₹${partialAmt || '0'} Payment` : `Confirm Full Payment ₹${netDue(payFee).toLocaleString()}`}
                  </Text>
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════
          ADD FEE MODAL
      ══════════════════════════════════════════════════ */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={st.overlay}>
          <View style={st.sheet}>
            <View style={st.sheetHeader}>
              <Text style={st.sheetTitle}>Add Fee</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Fee type */}
              <Text style={st.fieldLbl}>Fee Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {(['monthly', 'quarterly', 'annual', 'admission', 'equipment', 'tournament', 'custom'] as Fee['feeType'][]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[st.chipBtn, addType === t && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }]}
                    onPress={() => setAddType(t)}
                  >
                    <Text style={[st.chipTxt, addType === t && { color: Colors.primary, fontWeight: '600' }]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Player */}
              <Text style={st.fieldLbl}>Player *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {activePlayers.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[st.chipBtn, addPlayerId === p.id && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }]}
                    onPress={() => setAddPlayerId(p.id)}
                  >
                    <Text style={[st.chipTxt, addPlayerId === p.id && { color: Colors.primary, fontWeight: '600' }]}>
                      {p.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={st.fieldLbl}>Amount (₹) *</Text>
              <TextInput
                style={st.input}
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="numeric"
                placeholder="e.g. 2000"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={st.fieldLbl}>Description *</Text>
              <TextInput
                style={st.input}
                value={addDesc}
                onChangeText={setAddDesc}
                placeholder="e.g. Monthly training fee"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={st.fieldLbl}>Due Date</Text>
              <TextInput
                style={st.input}
                value={addDue}
                onChangeText={setAddDue}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />

              <TouchableOpacity style={[st.confirmBtn, { backgroundColor: Colors.primary }]} onPress={handleAddFee}>
                <MaterialIcons name="add-circle" size={18} color="#fff" />
                <Text style={st.confirmTxt}>Create Fee Record</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════
          GENERATE MONTHLY FEES MODAL
      ══════════════════════════════════════════════════ */}
      <Modal visible={showGenerate} animationType="slide" transparent onRequestClose={() => setShowGenerate(false)}>
        <View style={st.overlay}>
          <View style={st.sheet}>
            <View style={st.sheetHeader}>
              <Text style={st.sheetTitle}>Generate Monthly Fees</Text>
              <TouchableOpacity onPress={() => setShowGenerate(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[st.genInfo, { backgroundColor: Colors.info + '12', borderColor: Colors.info + '30' }]}>
                <MaterialIcons name="info-outline" size={16} color={Colors.info} />
                <Text style={[st.genInfoTxt, { color: Colors.info }]}>
                  Creates monthly fee records for all {activePlayers.length} active players. Existing records for the same month are skipped.
                </Text>
              </View>

              <Text style={st.fieldLbl}>Month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
                {MONTHS_SHORT.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    style={[st.monthChip, genMonth === i && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                    onPress={() => setGenMonth(i)}
                  >
                    <Text style={[st.monthChipTxt, genMonth === i && { color: '#fff', fontWeight: '700' }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={st.fieldLbl}>Amount per Player (₹)</Text>
              <TextInput
                style={st.input}
                value={genAmount}
                onChangeText={setGenAmount}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={st.fieldLbl}>Due Day of Month</Text>
              <TextInput
                style={st.input}
                value={genDueDay}
                onChangeText={setGenDueDay}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={Colors.textMuted}
              />

              {/* Summary card */}
              <View style={[st.summaryCard, { backgroundColor: Colors.gold + '10', borderColor: Colors.gold + '30' }]}>
                <Text style={[st.summaryTitle, { color: Colors.gold }]}>Summary</Text>
                <Text style={st.summaryLine}>Period: <Text style={st.summaryVal}>{MONTHS_SHORT[genMonth]} {genYear}</Text></Text>
                <Text style={st.summaryLine}>Players: <Text style={st.summaryVal}>{activePlayers.length} active</Text></Text>
                <Text style={st.summaryLine}>Per Player: <Text style={st.summaryVal}>₹{parseFloat(genAmount || '0').toLocaleString()}</Text></Text>
                <Text style={st.summaryLine}>Total Billed: <Text style={st.summaryVal}>₹{((parseFloat(genAmount || '0')) * activePlayers.length).toLocaleString()}</Text></Text>
              </View>

              <TouchableOpacity style={[st.confirmBtn, { backgroundColor: Colors.primary }]} onPress={handleGenerate}>
                <MaterialIcons name="autorenew" size={18} color="#fff" />
                <Text style={st.confirmTxt}>Generate for {activePlayers.length} Players</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgDark },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 9,
    borderRadius: Radius.md,
  },
  addBtnTxt: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#fff' },

  statsRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.bgDark, borderRadius: Radius.md,
    borderTopWidth: 2, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.sm, alignItems: 'center',
  },
  statVal: { fontSize: Typography.md, fontWeight: Typography.extrabold },
  statLbl: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },

  tabs: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 8, borderRadius: Radius.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabTxt: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  tabTxtActive: { color: '#fff', fontWeight: Typography.bold },
  tabBadge: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBadgeTxt: { fontSize: 9, color: '#fff', fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.base, marginVertical: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.sm, paddingVertical: 10 },

  list: { paddingHorizontal: Spacing.base, paddingBottom: 32 },

  // Fee card
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.md, fontWeight: Typography.extrabold },
  cardName: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  cardDesc: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  cardDue: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  cardAmt: { fontSize: Typography.md, fontWeight: Typography.extrabold },
  cardPartial: { fontSize: Typography.xs },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full,
  },
  badgeTxt: { fontSize: 10, fontWeight: Typography.semibold },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  tag: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
  },
  tagTxt: { fontSize: 10, fontWeight: Typography.semibold },

  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  collectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: Radius.md, paddingVertical: 9,
  },
  collectBtnTxt: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#fff' },
  iconAction: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.bgDark, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  receiptTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
  },
  receiptTagTxt: { fontSize: Typography.xs, fontWeight: Typography.semibold },

  // Empty
  empty: { alignItems: 'center', paddingTop: 64, gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260 },

  // Modal
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'],
    padding: Spacing.base, maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  sheetTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },

  // Pay modal
  payInfo: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md,
  },
  payName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  payDesc: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  payDue: { fontSize: Typography.xl, fontWeight: Typography.extrabold },

  partialRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  partialBtns: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.md,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
  },
  toggleTxt: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },

  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  methodBtn: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
  },
  methodTxt: { fontSize: Typography.sm, color: Colors.textSecondary },

  fieldLbl: {
    fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.4,
    marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: Typography.base,
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: Radius.xl, paddingVertical: 15, marginTop: Spacing.xl,
  },
  confirmTxt: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },

  // Chips
  chipBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
  },
  chipTxt: { fontSize: Typography.sm, color: Colors.textSecondary },

  // Generate modal
  genInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  genInfoTxt: { flex: 1, fontSize: Typography.xs, lineHeight: 18 },
  monthChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.bgSurface,
    borderWidth: 1, borderColor: Colors.border,
  },
  monthChipTxt: { fontSize: Typography.sm, color: Colors.textSecondary },
  summaryCard: {
    borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.base, marginTop: Spacing.md,
  },
  summaryTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, marginBottom: 8 },
  summaryLine: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 3 },
  summaryVal: { fontWeight: Typography.bold, color: Colors.textPrimary },
});
