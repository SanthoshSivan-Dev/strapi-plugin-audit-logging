import { PLUGIN_ID } from '../pluginId';

const UID = `plugin::${PLUGIN_ID}.audit-log`;

// The list view only needs the summary columns; the payload can be large and is
// fetched per entry through findOne.
const LIST_FIELDS = ['id', 'action', 'date', 'userEmail', 'userDisplayName', 'contentType', 'entryId'];

const getUserSnapshot = (user) => {
  if (!user) return { userEmail: null, userDisplayName: null };

  const displayName = user.firstname
    ? [user.firstname, user.lastname].filter(Boolean).join(' ')
    : user.username || user.email;

  return { userEmail: user.email || null, userDisplayName: displayName || null };
};

const asString = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

const asDate = (value) => {
  const str = asString(value);
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const buildWhere = (query) => {
  const where = {};
  const action = asString(query.action);
  const contentType = asString(query.contentType);
  const user = asString(query.user);
  const from = asDate(query.from);
  const to = asDate(query.to);

  if (action) where.action = action;
  if (contentType) where.contentType = contentType;
  if (user) {
    where.$or = [{ userEmail: { $containsi: user } }, { userDisplayName: { $containsi: user } }];
  }
  if (from || to) {
    where.date = {};
    if (from) where.date.$gte = from;
    if (to) where.date.$lte = to;
  }
  return where;
};

const auditLogService = ({ strapi }) => ({
  async record({ action, date, user, contentType, entryId, payload }) {
    const { userEmail, userDisplayName } = getUserSnapshot(user);

    await strapi.db.query(UID).create({
      data: {
        action,
        date: date || new Date().toISOString(),
        userEmail,
        userDisplayName,
        contentType: contentType || null,
        entryId: entryId != null ? String(entryId) : null,
        payload: payload || null,
      },
    });
  },

  async findMany(query = {}) {
    const { page = 1, pageSize = 20 } = query;

    return strapi.db.query(UID).findPage({
      select: LIST_FIELDS,
      where: buildWhere(query),
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      page: Math.max(Number(page) || 1, 1),
      pageSize: Math.min(Math.max(Number(pageSize) || 20, 1), 100),
    });
  },

  async findOne(id) {
    return strapi.db.query(UID).findOne({ where: { id } });
  },

  async deleteExpired(retentionDays) {
    const expirationDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    return strapi.db.query(UID).deleteMany({
      where: { date: { $lt: expirationDate.toISOString() } },
    });
  },
});

export default auditLogService;
