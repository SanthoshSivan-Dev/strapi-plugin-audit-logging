import { PLUGIN_ID } from '../pluginId';

const auditLogController = ({ strapi }) => ({
  async findMany(ctx) {
    const auditLogService = strapi.plugin(PLUGIN_ID).service('audit-log');
    const { results, pagination } = await auditLogService.findMany(ctx.request.query);
    ctx.body = { results, pagination };
  },

  async findOne(ctx) {
    const auditLogService = strapi.plugin(PLUGIN_ID).service('audit-log');
    const entry = await auditLogService.findOne(ctx.params.id);
    if (!entry) return ctx.notFound('Audit log entry not found');
    ctx.body = { data: entry };
  },
});

export default auditLogController;
