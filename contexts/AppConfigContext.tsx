import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getSupabaseClient } from '@/template';

export interface AppConfig {
  // Maintenance
  maintenanceMode: boolean;
  allowAdminDuringMaintenance: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceImageUri: string;

  // App Identity
  appName: string;
  shortAppName: string;
  appTagline: string;
  appDescription: string;
  academyName: string;
  organizationName: string;
  copyrightText: string;
  versionDisplayName: string;

  // Logos
  appLogoUri: string;
  loginLogoUri: string;
  dashboardLogoUri: string;
  splashLogoUri: string;
  profilePlaceholderUri: string;
}

const DEFAULT_CONFIG: AppConfig = {
  maintenanceMode: false,
  allowAdminDuringMaintenance: true,
  maintenanceTitle: 'Under Maintenance',
  maintenanceMessage: 'We are performing scheduled maintenance. Please check back shortly.',
  maintenanceImageUri: '',

  appName: 'Young Warriors',
  shortAppName: 'YWCC',
  appTagline: 'Academy Management System',
  appDescription: 'A comprehensive cricket academy management platform for players, coaches and administrators.',
  academyName: 'Young Warriors Cricket Club',
  organizationName: 'Young Warriors Cricket Academy',
  copyrightText: 'Young Warriors Cricket Club © 2024',
  versionDisplayName: 'v1.0.0',

  appLogoUri: '',
  loginLogoUri: '',
  dashboardLogoUri: '',
  splashLogoUri: '',
  profilePlaceholderUri: '',
};

// Map DB row → AppConfig
function rowToConfig(row: any): AppConfig {
  return {
    maintenanceMode: row.maintenance_mode ?? false,
    allowAdminDuringMaintenance: row.allow_admin_during_maintenance ?? true,
    maintenanceTitle: row.maintenance_title ?? DEFAULT_CONFIG.maintenanceTitle,
    maintenanceMessage: row.maintenance_message ?? DEFAULT_CONFIG.maintenanceMessage,
    maintenanceImageUri: row.maintenance_image_uri ?? '',
    appName: row.app_name ?? DEFAULT_CONFIG.appName,
    shortAppName: row.short_app_name ?? DEFAULT_CONFIG.shortAppName,
    appTagline: row.app_tagline ?? DEFAULT_CONFIG.appTagline,
    appDescription: row.app_description ?? DEFAULT_CONFIG.appDescription,
    academyName: row.academy_name ?? DEFAULT_CONFIG.academyName,
    organizationName: row.organization_name ?? DEFAULT_CONFIG.organizationName,
    copyrightText: row.copyright_text ?? DEFAULT_CONFIG.copyrightText,
    versionDisplayName: row.version_display_name ?? DEFAULT_CONFIG.versionDisplayName,
    appLogoUri: row.app_logo_uri ?? '',
    loginLogoUri: row.login_logo_uri ?? '',
    dashboardLogoUri: row.dashboard_logo_uri ?? '',
    splashLogoUri: row.splash_logo_uri ?? '',
    profilePlaceholderUri: row.profile_placeholder_uri ?? '',
  };
}

// Map AppConfig → DB row
function configToRow(config: AppConfig) {
  return {
    maintenance_mode: config.maintenanceMode,
    allow_admin_during_maintenance: config.allowAdminDuringMaintenance,
    maintenance_title: config.maintenanceTitle,
    maintenance_message: config.maintenanceMessage,
    maintenance_image_uri: config.maintenanceImageUri,
    app_name: config.appName,
    short_app_name: config.shortAppName,
    app_tagline: config.appTagline,
    app_description: config.appDescription,
    academy_name: config.academyName,
    organization_name: config.organizationName,
    copyright_text: config.copyrightText,
    version_display_name: config.versionDisplayName,
    app_logo_uri: config.appLogoUri,
    login_logo_uri: config.loginLogoUri,
    dashboard_logo_uri: config.dashboardLogoUri,
    splash_logo_uri: config.splashLogoUri,
    profile_placeholder_uri: config.profilePlaceholderUri,
    updated_at: new Date().toISOString(),
  };
}

interface AppConfigContextType {
  config: AppConfig;
  configLoaded: boolean;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Load config from DB on mount
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('app_config')
          .select('*')
          .eq('id', 'global')
          .single();

        if (!error && data) {
          setConfig(rowToConfig(data));
        }
      } catch (_) {
        // Fallback to defaults silently
      } finally {
        setConfigLoaded(true);
      }
    };
    load();
  }, []);

  // Poll every 30s so maintenance mode stays in sync across devices
  useEffect(() => {
    if (!configLoaded) return;
    const interval = setInterval(async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('app_config')
          .select('maintenance_mode, allow_admin_during_maintenance')
          .eq('id', 'global')
          .single();
        if (!error && data) {
          setConfig(prev => ({
            ...prev,
            maintenanceMode: data.maintenance_mode,
            allowAdminDuringMaintenance: data.allow_admin_during_maintenance,
          }));
        }
      } catch (_) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [configLoaded]);

  const updateConfig = useCallback(async (partial: Partial<AppConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('app_config')
        .upsert({ id: 'global', ...configToRow(updated) });
    } catch (_) {}
  }, [config]);

  const resetConfig = useCallback(async () => {
    setConfig(DEFAULT_CONFIG);
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('app_config')
        .upsert({ id: 'global', ...configToRow(DEFAULT_CONFIG) });
    } catch (_) {}
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, configLoaded, updateConfig, resetConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) throw new Error('useAppConfig must be used within AppConfigProvider');
  return context;
}
