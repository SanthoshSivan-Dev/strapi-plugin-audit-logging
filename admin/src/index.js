import ClockIcon from './components/ClockIcon';
import { PLUGIN_ID } from './pluginId';

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: ClockIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Audit Logs',
      },
      Component: () => import('./pages/AuditLogListPage'),
      permissions: [{ action: `plugin::${PLUGIN_ID}.read`, subject: null }],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'Audit Logging',
    });
  },

  bootstrap() {},
};
