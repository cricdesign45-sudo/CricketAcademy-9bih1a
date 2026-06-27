import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, KeyboardAvoidingView, Platform, TextInput,
  Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme, PRESET_ACCENTS } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useAppConfig } from '@/contexts/AppConfigContext';

/* ─── Accordion Section ─────────────────────────────────────── */
function Section({ title, icon, children, C, defaultOpen = false }: {
  title: string; icon: string; children: React.ReactNode; C: any; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[st.section, { backgroundColor: C.bgCard, borderColor: C.border }]}>
      <TouchableOpacity style={st.sectionHead} onPress={() => setOpen(v => !v)} activeOpacity={0.7}>
        <MaterialIcons name={icon as any} size={16} color={C.textSecondary} />
        <Text style={[st.sectionTitle, { color: C.textPrimary }]}>{title}</Text>
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={18} color={C.textMuted} />
      </TouchableOpacity>
      {open && <View style={[st.body, { borderTopColor: C.border }]}>{children}</View>}
    </View>
  );
}

/* ─── Row helpers ────────────────────────────────────────────── */
function ToggleRow({ label, sub, value, onChange, C }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; C: any;
}) {
  return (
    <View style={[st.row, { borderBottomColor: C.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[st.rowLabel, { color: C.textPrimary }]}>{label}</Text>
        {sub ? <Text style={[st.rowSub, { color: C.textMuted }]}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.bgSurface, true: C.primary + '50' }}
        thumbColor={value ? C.primary : C.textMuted}
      />
    </View>
  );
}

function InfoRow({ label, value, C }: { label: string; value: string; C: any }) {
  return (
    <View style={[st.row, { borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
      <Text style={[st.rowLabel, { color: C.textSecondary }]}>{label}</Text>
      <Text style={[st.infoVal, { color: C.textPrimary }]}>{value}</Text>
    </View>
  );
}

function ActionRow({ label, sub, icon, color, onPress, C }: {
  label: string; sub?: string; icon: string; color?: string; onPress: () => void; C: any;
}) {
  return (
    <TouchableOpacity style={[st.row, { borderBottomColor: C.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={[st.rowLabel, { color: color || C.textPrimary }]}>{label}</Text>
        {sub ? <Text style={[st.rowSub, { color: C.textMuted }]}>{sub}</Text> : null}
      </View>
      <MaterialIcons name={icon as any} size={15} color={color || C.textMuted} />
    </TouchableOpacity>
  );
}

function EditableRow({ label, value, placeholder, onSave, C, multiline = false }: {
  label: string; value: string; placeholder?: string;
  onSave: (v: string) => void; C: any; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    onSave(draft.trim() || value);
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <View style={[st.editRow, { borderBottomColor: C.border }]}>
      <Text style={[st.editLabel, { color: C.textSecondary }]}>{label}</Text>
      {editing ? (
        <View style={st.editInputWrap}>
          <TextInput
            style={[st.editInput, { color: C.textPrimary, backgroundColor: C.bgDark, borderColor: C.primary }]}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={C.textMuted}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            autoFocus
          />
          <View style={st.editActions}>
            <TouchableOpacity style={[st.editSaveBtn, { backgroundColor: C.primary }]} onPress={save}>
              <MaterialIcons name="check" size={14} color="#fff" />
              <Text style={st.editSaveTxt}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.editCancelBtn, { borderColor: C.border }]} onPress={cancel}>
              <Text style={[st.editCancelTxt, { color: C.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={st.editValueRow} onPress={() => { setDraft(value); setEditing(true); }} activeOpacity={0.7}>
          <Text style={[st.editValue, { color: C.textPrimary }]} numberOfLines={2}>{value}</Text>
          <MaterialIcons name="edit" size={14} color={C.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function LogoUploadRow({ label, uri, onUpload, onRemove, C }: {
  label: string; uri: string; onUpload: (u: string) => void; onRemove: () => void; C: any;
}) {
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Allow photo library access to upload a logo.');
      return;
    }
    setUploading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    setUploading(false);
    if (!result.canceled && result.assets[0]?.uri) {
      onUpload(result.assets[0].uri);
    }
  };

  return (
    <View style={[st.logoRow, { borderBottomColor: C.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[st.rowLabel, { color: C.textPrimary }]}>{label}</Text>
        {uri ? (
          <Text style={[st.rowSub, { color: C.success }]}>Custom image set</Text>
        ) : (
          <Text style={[st.rowSub, { color: C.textMuted }]}>Using default</Text>
        )}
      </View>
      <View style={st.logoActions}>
        {uri ? (
          <>
            <Image source={{ uri }} style={[st.logoPreview, { borderColor: C.border }]} contentFit="cover" />
            <TouchableOpacity
              style={[st.logoBtn, { backgroundColor: C.error + '15', borderColor: C.error + '44' }]}
              onPress={onRemove}
            >
              <MaterialIcons name="close" size={14} color={C.error} />
            </TouchableOpacity>
          </>
        ) : null}
        <TouchableOpacity
          style={[st.logoBtn, { backgroundColor: C.primary + '15', borderColor: C.primary + '44' }]}
          onPress={pick}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size={14} color={C.primary} />
          ) : (
            <MaterialIcons name="upload" size={14} color={C.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Main Settings Screen ──────────────────────────────────── */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const { players, fees } = usePlayers();
  const { isDark, setTheme, accentPreset, setAccentPreset, Colors: C } = useTheme();
  const { hasPermission, requestPermissions, sendInstantNotification } = useNotifications();
  const { config, updateConfig, resetConfig } = useAppConfig();

  const [notifOn, setNotifOn] = useState(true);
  const [autoPoints, setAutoPoints] = useState(true);
  const [autoOverdue, setAutoOverdue] = useState(true);
  const [showPerf, setShowPerf] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [dataBackup, setDataBackup] = useState(true);

  const activePlayers = players.filter(p => p.isActive).length;
  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue').length;
  const collectedFees = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.paidAmount, 0);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[{ flex: 1, backgroundColor: C.bgDark, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[st.header, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
          <Text style={[st.title, { color: C.textPrimary }]}>Settings</Text>
          <Text style={[st.subtitle, { color: C.textMuted }]}>Preferences & configuration</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.content}>
          {/* Admin card */}
          <View style={[st.adminCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <View style={[st.adminAvatar, { backgroundColor: C.primary }]}>
              <Text style={st.adminInitial}>{(user?.name || 'A')[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.adminName, { color: C.textPrimary }]}>{user?.name}</Text>
              <Text style={[st.adminEmail, { color: C.textMuted }]}>{user?.email}</Text>
            </View>
            <View style={[st.adminBadge, { backgroundColor: C.primary + '10', borderColor: C.primary + '25' }]}>
              <Text style={[st.adminBadgeText, { color: C.primary }]}>Admin</Text>
            </View>
          </View>

          {/* ── MAINTENANCE MODE ── */}
          <Section title="Maintenance Mode" icon="build" C={C} defaultOpen={config.maintenanceMode}>
            {/* Status banner */}
            <View style={[st.maintBanner, {
              backgroundColor: config.maintenanceMode ? C.warning + '12' : C.success + '0A',
              borderColor: config.maintenanceMode ? C.warning + '44' : C.success + '33',
            }]}>
              <View style={[st.maintDot, { backgroundColor: config.maintenanceMode ? C.warning : C.success }]} />
              <Text style={[st.maintBannerTxt, { color: config.maintenanceMode ? C.warning : C.success }]}>
                {config.maintenanceMode ? 'MAINTENANCE ACTIVE — App is offline for players' : 'App is LIVE — All users have access'}
              </Text>
            </View>

            <ToggleRow
              label="Enable Maintenance Mode"
              sub="Blocks player access and shows maintenance screen"
              value={config.maintenanceMode}
              onChange={v => {
                if (v) {
                  showAlert(
                    'Enable Maintenance Mode?',
                    'Players will be blocked from accessing the app immediately.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Enable', style: 'destructive', onPress: () => { updateConfig({ maintenanceMode: true }); } },
                    ]
                  );
                } else {
                  updateConfig({ maintenanceMode: false });
                }
              }}
              C={C}
            />

            <ToggleRow
              label="Allow Admin Login During Maintenance"
              sub="Admins can still sign in and manage the app"
              value={config.allowAdminDuringMaintenance}
              onChange={v => updateConfig({ allowAdminDuringMaintenance: v })}
              C={C}
            />

            <EditableRow
              label="Maintenance Title"
              value={config.maintenanceTitle}
              placeholder="e.g. Under Maintenance"
              onSave={v => updateConfig({ maintenanceTitle: v })}
              C={C}
            />

            <EditableRow
              label="Maintenance Message"
              value={config.maintenanceMessage}
              placeholder="Message shown to players..."
              onSave={v => updateConfig({ maintenanceMessage: v })}
              C={C}
              multiline
            />

            <LogoUploadRow
              label="Maintenance Image"
              uri={config.maintenanceImageUri}
              onUpload={v => updateConfig({ maintenanceImageUri: v })}
              onRemove={() => updateConfig({ maintenanceImageUri: '' })}
              C={C}
            />
          </Section>

          {/* ── APP IDENTITY ── */}
          <Section title="App Identity" icon="label" C={C}>
            <EditableRow label="App Name" value={config.appName} onSave={v => updateConfig({ appName: v })} C={C} />
            <EditableRow label="Short App Name" value={config.shortAppName} onSave={v => updateConfig({ shortAppName: v })} C={C} />
            <EditableRow label="App Tagline" value={config.appTagline} onSave={v => updateConfig({ appTagline: v })} C={C} />
            <EditableRow label="App Description" value={config.appDescription} onSave={v => updateConfig({ appDescription: v })} C={C} multiline />
            <EditableRow label="Academy Name" value={config.academyName} onSave={v => updateConfig({ academyName: v })} C={C} />
            <EditableRow label="Organization Name" value={config.organizationName} onSave={v => updateConfig({ organizationName: v })} C={C} />
            <EditableRow label="Copyright Text" value={config.copyrightText} onSave={v => updateConfig({ copyrightText: v })} C={C} />
            <EditableRow label="Version Display Name" value={config.versionDisplayName} onSave={v => updateConfig({ versionDisplayName: v })} C={C} />
          </Section>

          {/* ── LOGOS & IMAGES ── */}
          <Section title="Logos & Images" icon="image" C={C}>
            <View style={[st.logoHelp, { backgroundColor: C.info + '0A', borderColor: C.info + '22' }]}>
              <MaterialIcons name="info-outline" size={14} color={C.info} />
              <Text style={[st.logoHelpTxt, { color: C.textSecondary }]}>
                Upload custom logos to replace the default cricket ball icon throughout the app.
              </Text>
            </View>
            <LogoUploadRow
              label="App Logo"
              uri={config.appLogoUri}
              onUpload={v => updateConfig({ appLogoUri: v })}
              onRemove={() => updateConfig({ appLogoUri: '' })}
              C={C}
            />
            <LogoUploadRow
              label="Login Page Logo"
              uri={config.loginLogoUri}
              onUpload={v => updateConfig({ loginLogoUri: v })}
              onRemove={() => updateConfig({ loginLogoUri: '' })}
              C={C}
            />
            <LogoUploadRow
              label="Dashboard Logo"
              uri={config.dashboardLogoUri}
              onUpload={v => updateConfig({ dashboardLogoUri: v })}
              onRemove={() => updateConfig({ dashboardLogoUri: '' })}
              C={C}
            />
            <LogoUploadRow
              label="Splash Screen Logo"
              uri={config.splashLogoUri}
              onUpload={v => updateConfig({ splashLogoUri: v })}
              onRemove={() => updateConfig({ splashLogoUri: '' })}
              C={C}
            />
            <LogoUploadRow
              label="Profile Placeholder Image"
              uri={config.profilePlaceholderUri}
              onUpload={v => updateConfig({ profilePlaceholderUri: v })}
              onRemove={() => updateConfig({ profilePlaceholderUri: '' })}
              C={C}
            />
          </Section>

          {/* ── ACCOUNT ── */}
          <Section title="Account" icon="person-outline" C={C}>
            <InfoRow label="Name" value={user?.name || 'Admin'} C={C} />
            <InfoRow label="Email" value={user?.email || ''} C={C} />
            <InfoRow label="Role" value="Administrator" C={C} />
            <ToggleRow label="Two-Factor Auth" value={twoFa} onChange={setTwoFa} C={C} />
            <ActionRow label="Change Password" icon="lock-outline" C={C} onPress={() => showAlert('Change Password', 'Password reset link sent to your email')} />
          </Section>

          {/* ── ACADEMY ── */}
          <Section title="Academy Stats" icon="school" C={C}>
            <InfoRow label="Active Players" value={`${activePlayers} of ${players.length}`} C={C} />
            <InfoRow label="Pending Fees" value={`${pendingFees} payments`} C={C} />
            <InfoRow label="Collected" value={`₹${(collectedFees / 1000).toFixed(1)}K`} C={C} />
            <ActionRow
              label="Edit Academy Details"
              sub="Name, ground, fee structure"
              icon="edit"
              C={C}
              onPress={() => showAlert('Edit Academy', 'Update academy name and details in App Identity section above')}
            />
          </Section>

          {/* ── NOTIFICATIONS ── */}
          <Section title="Notifications" icon="notifications-none" C={C}>
            <ToggleRow label="In-App Notifications" sub="Attendance, fees, matches" value={notifOn} onChange={setNotifOn} C={C} />
            <InfoRow label="Push Permission" value={hasPermission ? 'Enabled' : 'Disabled'} C={C} />
            {!hasPermission && (
              <ActionRow
                label="Enable Push Notifications"
                icon="notifications-active"
                color={C.primary}
                C={C}
                onPress={async () => {
                  const ok = await requestPermissions();
                  showAlert(ok ? 'Enabled' : 'Blocked', ok ? 'Push notifications active' : 'Please enable in device Settings');
                }}
              />
            )}
            <ActionRow
              label="Send Test Notification"
              sub="Verify delivery"
              icon="send"
              C={C}
              onPress={async () => {
                if (!hasPermission) { showAlert('Permission Required', 'Enable push notifications first'); return; }
                await sendInstantNotification('Test', 'Push working!', {});
                showAlert('Sent', 'Check your notification tray');
              }}
            />
          </Section>

          {/* ── ATTENDANCE & POINTS ── */}
          <Section title="Attendance & Points" icon="event-available" C={C}>
            <ToggleRow label="Auto-Award Attendance Points" value={autoPoints} onChange={setAutoPoints} C={C} />
            <ActionRow label="Configure Point Rules" icon="tune" C={C} onPress={() => showAlert('Point Rules', 'Configure from Points Manager')} />
          </Section>

          {/* ── FEES ── */}
          <Section title="Fees" icon="payments" C={C}>
            <ToggleRow label="Auto-Mark Overdue" sub="After due date" value={autoOverdue} onChange={setAutoOverdue} C={C} />
            <ActionRow label="Edit Fee Plans" sub="Monthly, quarterly, scholarship" icon="edit" C={C} onPress={() => showAlert('Fee Plans', 'Manage from Fees screen')} />
          </Section>

          {/* ── PLAYER VISIBILITY ── */}
          <Section title="Player Visibility" icon="visibility" C={C}>
            <ToggleRow label="Show Stats to Players" value={showPerf} onChange={setShowPerf} C={C} />
          </Section>

          {/* ── APPEARANCE ── */}
          <Section title="Appearance" icon="palette" C={C}>
            <ToggleRow
              label="Dark Mode"
              sub={isDark ? 'Currently dark' : 'Currently light'}
              value={isDark}
              onChange={v => setTheme(v ? 'dark' : 'light')}
              C={C}
            />
            {/* Accent color presets */}
            <View style={st.presetsWrap}>
              <Text style={[st.presetsLabel, { color: C.textSecondary }]}>Accent Color</Text>
              <View style={st.presetsGrid}>
                {PRESET_ACCENTS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      st.presetBtn,
                      { borderColor: accentPreset === idx ? preset.primary : C.border },
                      accentPreset === idx && { backgroundColor: preset.primary + '08' },
                    ]}
                    onPress={() => setAccentPreset(idx)}
                  >
                    <View style={[st.presetDot, { backgroundColor: preset.primary }]} />
                    <Text style={[st.presetName, { color: accentPreset === idx ? preset.primary : C.textSecondary }]}>
                      {preset.preview} {preset.name}
                    </Text>
                    {accentPreset === idx && <MaterialIcons name="check" size={12} color={preset.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Section>

          {/* ── DATA ── */}
          <Section title="Data & Backup" icon="storage" C={C}>
            <ToggleRow label="Auto Backup" value={dataBackup} onChange={setDataBackup} C={C} />
            <ActionRow label="Export Player Data" sub="Download as CSV" icon="file-download" C={C} onPress={() => showAlert('Export', 'Player data export will be generated')} />
            <ActionRow
              label="Clear Cache"
              icon="cleaning-services"
              C={C}
              onPress={() => showAlert('Clear Cache', 'Temporary data cleared', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => showAlert('Done', 'Cache cleared') },
              ])}
            />
            <ActionRow
              label="Reset All Settings"
              sub="Restore defaults (cannot be undone)"
              icon="restart-alt"
              color={C.error}
              C={C}
              onPress={() => showAlert('Reset Settings', 'All customizations will be lost.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => { resetConfig(); showAlert('Done', 'Settings have been reset to defaults'); } },
              ])}
            />
          </Section>

          {/* ── SUPPORT ── */}
          <Section title="Support" icon="help-outline" C={C}>
            <InfoRow label="App Version" value={config.versionDisplayName} C={C} />
            <ActionRow label="Contact Support" icon="mail-outline" C={C} onPress={() => showAlert('Support', 'Email: admin@ywcc.com')} />
            <ActionRow label="Privacy Policy" icon="privacy-tip" C={C} onPress={() => showAlert('Privacy', 'Your data is stored securely.')} />
          </Section>

          {/* Sign Out */}
          <TouchableOpacity
            style={[st.logoutBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
            onPress={() => showAlert('Sign Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout },
            ])}
          >
            <MaterialIcons name="logout" size={16} color={C.error} />
            <Text style={[st.logoutText, { color: C.error }]}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.xs, marginTop: 1 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },

  adminCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  adminAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  adminInitial: { fontSize: Typography.xl, fontWeight: Typography.bold, color: '#fff' },
  adminName: { fontSize: Typography.base, fontWeight: Typography.semibold },
  adminEmail: { fontSize: Typography.xs, marginTop: 1 },
  adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  adminBadgeText: { fontSize: Typography.xs, fontWeight: Typography.semibold },

  section: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden' },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  sectionTitle: { flex: 1, fontSize: Typography.sm, fontWeight: Typography.semibold },
  body: { borderTopWidth: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: Typography.sm, fontWeight: Typography.medium },
  rowSub: { fontSize: Typography.xs, marginTop: 1 },
  infoVal: { fontSize: Typography.sm },

  // Maintenance banner
  maintBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: Spacing.md, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.sm,
  },
  maintDot: { width: 8, height: 8, borderRadius: 4 },
  maintBannerTxt: { flex: 1, fontSize: Typography.xs, fontWeight: Typography.semibold },

  // Editable row
  editRow: {
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  editValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editValue: { flex: 1, fontSize: Typography.sm },
  editInputWrap: { gap: 8 },
  editInput: {
    borderRadius: Radius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: Typography.sm, minHeight: 42,
  },
  editActions: { flexDirection: 'row', gap: 8 },
  editSaveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.md,
  },
  editSaveTxt: { fontSize: Typography.xs, fontWeight: Typography.bold, color: '#fff' },
  editCancelBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1,
  },
  editCancelTxt: { fontSize: Typography.xs, fontWeight: Typography.medium },

  // Logo row
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoPreview: { width: 36, height: 36, borderRadius: 8, borderWidth: 1 },
  logoBtn: {
    width: 34, height: 34, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  logoHelp: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    margin: Spacing.md, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.sm,
  },
  logoHelpTxt: { flex: 1, fontSize: Typography.xs, lineHeight: 18 },

  // Presets inside appearance
  presetsWrap: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
  presetsLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, minWidth: '46%',
  },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetName: { flex: 1, fontSize: Typography.xs, fontWeight: Typography.medium },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, marginTop: Spacing.sm,
  },
  logoutText: { fontSize: Typography.base, fontWeight: Typography.semibold },
});
