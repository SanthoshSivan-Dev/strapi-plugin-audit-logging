import { PLUGIN_ID } from '../pluginId';

const policies = [
  'admin::isAuthenticatedAdmin',
  { name: 'admin::hasPermissions', config: { actions: [`plugin::${PLUGIN_ID}.read`] } },
];

export default {
  'admin-api': {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/logs',
        handler: 'audit-log.findMany',
        config: { policies },
      },
      {
        method: 'GET',
        path: '/logs/:id',
        handler: 'audit-log.findOne',
        config: { policies },
      },
    ],
  },
};
