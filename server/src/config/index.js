const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');

export default {
  default: {
    // Days to keep log entries. Set to 0 or null to keep them forever.
    retentionDays: 90,
    cleanupCron: '0 3 * * *',
    // null means "use the built-in list"; see utils/events.js.
    events: null,
    excludedEvents: null,
    excludedContentTypes: null,
    // Added on top of the built-in sensitive field names; see utils/redact.js.
    redactedFields: null,
    storePayload: true,
  },
  validator(config) {
    const { retentionDays } = config;
    if (retentionDays != null && retentionDays !== 0 && (!Number.isInteger(retentionDays) || retentionDays < 0)) {
      throw new Error('audit-logging plugin: "retentionDays" must be a positive integer, 0 or null');
    }
    if (config.cleanupCron != null && typeof config.cleanupCron !== 'string') {
      throw new Error('audit-logging plugin: "cleanupCron" must be a cron expression string');
    }
    for (const key of ['events', 'excludedEvents', 'excludedContentTypes', 'redactedFields']) {
      if (config[key] != null && !isStringArray(config[key])) {
        throw new Error(`audit-logging plugin: "${key}" must be an array of strings`);
      }
    }
    if (typeof config.storePayload !== 'boolean') {
      throw new Error('audit-logging plugin: "storePayload" must be a boolean');
    }
  },
};
