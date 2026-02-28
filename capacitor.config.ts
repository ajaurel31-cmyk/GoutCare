import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goutcare.app',
  appName: 'GoutCare',
  webDir: 'out',
  ios: {
    scheme: 'GoutCare',
    contentInset: 'always',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1a56db',
    },
  },
};

export default config;
