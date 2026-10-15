import { PLUGIN_ID } from './pluginId';
import {
  AUTH_EVENTS,
  getEntitySummary,
  resolveExcludedContentTypes,
  resolveTrackedEvents,
} from './utils/events';
import { DEFAULT_REDACTED_FIELDS, redact } from './utils/redact';

const bootstrap = async ({ strapi }) => {
  await strapi.service('admin::permission').actionProvider.registerMany([
    { section: 'plugins', displayName: 'Read', uid: 'read', pluginName: PLUGIN_ID },
  ]);

  const config = strapi.config.get(`plugin::${PLUGIN_ID}`);
  const auditLogService = strapi.plugin(PLUGIN_ID).service('audit-log');

  const trackedEvents = resolveTrackedEvents(config);
  const excludedContentTypes = resolveExcludedContentTypes(config);
  const redactedFields = [...DEFAULT_REDACTED_FIELDS, ...(config.redactedFields ?? [])];

  strapi.eventHub.subscribe(async (eventName, payload = {}) => {
    if (!trackedEvents.has(eventName)) return;
    if (payload.uid && excludedContentTypes.has(payload.uid)) return;

    let user;
    if (AUTH_EVENTS.has(eventName)) {
      user = payload.user;
    } else {
      const requestState = strapi.requestContext.get()?.state;
      const isAdminRequest = requestState?.route?.info?.type === 'admin';
      if (!isAdminRequest || !requestState?.user) return;
      user = requestState.user;
    }

    const { contentType, entryId } = getEntitySummary(payload);

    try {
      await auditLogService.record({
        action: eventName,
        user,
        contentType,
        entryId,
        payload: config.storePayload ? redact(payload, redactedFields) : null,
      });
    } catch (err) {
      strapi.log.error(`${PLUGIN_ID}: failed to record audit event`, err);
    }
  });

  if (config.retentionDays) {
    strapi.cron.add({
      auditLoggingCleanup: {
        task: async () => {
          try {
            await auditLogService.deleteExpired(config.retentionDays);
          } catch (err) {
            strapi.log.error(`${PLUGIN_ID}: failed to delete expired audit logs`, err);
          }
        },
        options: config.cleanupCron,
      },
    });
  }

  strapi.log.info(
    `${PLUGIN_ID}: tracking ${trackedEvents.size} event types, ` +
      (config.retentionDays ? `retention ${config.retentionDays} days` : 'retention disabled')
  );
};

export default bootstrap;
