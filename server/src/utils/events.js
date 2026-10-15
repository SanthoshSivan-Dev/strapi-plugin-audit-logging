export const DEFAULT_EVENTS = [
  'entry.create',
  'entry.update',
  'entry.delete',
  'entry.publish',
  'entry.unpublish',
  'media.create',
  'media.update',
  'media.delete',
  'media-folder.create',
  'media-folder.update',
  'media-folder.delete',
  'user.create',
  'user.update',
  'user.delete',
  'role.create',
  'role.update',
  'role.delete',
  'permission.create',
  'permission.update',
  'permission.delete',
  'admin.auth.success',
  'admin.logout',
];

// admin.auth.success / admin.logout fire outside a fully authenticated request
// (there's no logged-in user yet at login time), so the acting user has to be
// read from the event payload instead of the request context.
export const AUTH_EVENTS = new Set(['admin.auth.success', 'admin.logout']);

export const DEFAULT_EXCLUDED_CONTENT_TYPES = ['plugin::upload.file', 'plugin::upload.folder'];

export const getEntitySummary = (payload = {}) => {
  if (payload.uid) {
    return { contentType: payload.uid, entryId: payload.entry?.id ?? null };
  }
  if (payload.role) {
    return { contentType: 'admin::role', entryId: payload.role.id ?? null };
  }
  if (payload.user) {
    return { contentType: 'admin::user', entryId: payload.user.id ?? null };
  }
  if (payload.users) {
    return { contentType: 'admin::user', entryId: null };
  }
  if (payload.permissions) {
    const permissions = Array.isArray(payload.permissions) ? payload.permissions : [payload.permissions];
    return { contentType: 'admin::permission', entryId: permissions[0]?.id ?? null };
  }
  return { contentType: null, entryId: null };
};

// Resolves the effective event list from the plugin config. Array options default
// to null rather than to the built-in lists because Strapi merges plugin config with
// defaultsDeep, which would merge a user-supplied array with the default index by index.
export const resolveTrackedEvents = (config = {}) => {
  const events = config.events ?? DEFAULT_EVENTS;
  const excluded = new Set(config.excludedEvents ?? []);
  return new Set(events.filter((event) => !excluded.has(event)));
};

export const resolveExcludedContentTypes = (config = {}) =>
  new Set(config.excludedContentTypes ?? DEFAULT_EXCLUDED_CONTENT_TYPES);
