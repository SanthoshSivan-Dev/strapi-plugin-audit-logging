<p align="center">
  <img src="https://raw.githubusercontent.com/SanthoshSivan-Dev/strapi-plugin-audit-logging/main/assets/logo.png" alt="Audit Logging logo" width="120" height="120">
</p>

# strapi-plugin-audit-logging

[![npm version](https://img.shields.io/npm/v/strapi-plugin-audit-logging.svg)](https://www.npmjs.com/package/strapi-plugin-audit-logging)
[![license](https://img.shields.io/npm/l/strapi-plugin-audit-logging.svg)](https://github.com/SanthoshSivan-Dev/strapi-plugin-audit-logging/blob/main/LICENSE)

Audit logs for **Strapi 5 Community Edition**. See who created, updated, published or
deleted content, who changed users, roles and permissions, and who logged in and out of
the admin panel.

Strapi's built-in audit logs require a paid plan. This plugin gives you the essentials
for free: install it, enable it, and every admin action is recorded.

> This is an independent community plugin. It is not affiliated with, endorsed by or
> supported by Strapi Solutions SAS.

## Features

- Records content entries (create, update, delete, publish, unpublish), media and media
  folders, admin users, roles, permissions, and admin logins and logouts.
- An **Audit Logs** page in the admin panel, with filters by action and user and a
  details view of each event's payload.
- A `Read` permission under **Settings → Roles → Plugins → Audit-logging**, so you choose
  which roles can see the logs.
- Automatic cleanup of old entries (90 days by default).
- Passwords, tokens and secrets are masked before payloads are stored.
- Only actions taken through the admin panel by a logged-in admin are recorded. Public
  REST and GraphQL API traffic is ignored.

## Requirements

- Strapi `5.x`
- Node.js `18` or later

## Installation

```bash
npm install strapi-plugin-audit-logging
# or
yarn add strapi-plugin-audit-logging
# or
pnpm add strapi-plugin-audit-logging
```

Enable the plugin in `config/plugins.js` (or `config/plugins.ts`):

```js
module.exports = () => ({
  'audit-logging': {
    enabled: true,
  },
});
```

Rebuild the admin panel and restart Strapi:

```bash
npm run build
npm run develop
```

**Audit Logs** now appears in the admin sidebar. Super Admins can see it straight away. To
give other roles access, go to **Settings → Administration panel → Roles**, open the role,
and tick **Read** under **Plugins → Audit-logging**.

## Configuration

All options are optional:

```js
module.exports = ({ env }) => ({
  'audit-logging': {
    enabled: true,
    config: {
      retentionDays: env.int('AUDIT_LOG_RETENTION_DAYS', 90),
      cleanupCron: '0 3 * * *',
      excludedContentTypes: ['plugin::upload.file', 'plugin::upload.folder', 'api::page-view.page-view'],
      excludedEvents: ['media-folder.create', 'media-folder.update', 'media-folder.delete'],
      redactedFields: ['iban', 'phoneNumber'],
      storePayload: true,
    },
  },
});
```

| Option | Default | Description |
| --- | --- | --- |
| `retentionDays` | `90` | Entries older than this many days are deleted. Set to `0` or `null` to keep entries forever. |
| `cleanupCron` | `'0 3 * * *'` | When the cleanup job runs (daily at 03:00 server time by default). |
| `events` | all events below | The events to record. Setting it **replaces** the default list. |
| `excludedEvents` | `[]` | Events to skip. Use this to drop a few events without listing all the others. |
| `excludedContentTypes` | `['plugin::upload.file', 'plugin::upload.folder']` | Content type UIDs whose events are ignored. Setting it **replaces** the default list, so include the upload types if you still want them excluded. |
| `redactedFields` | `[]` | Extra field names to mask in stored payloads. They are **added to** the built-in list: `password`, `resetPasswordToken`, `registrationToken`, `confirmationToken`, `token`, `accessToken`, `refreshToken`, `secret`, `apiKey`. Matching ignores case and applies at any depth. |
| `storePayload` | `true` | Set to `false` to store only the summary (action, user, content type, entry id) and no payload. |

The cleanup job uses Strapi's built-in cron, which is enabled unless you set
`server.cron.enabled: false` in `config/server.js`.

### Recorded events

| Event | Recorded when |
| --- | --- |
| `entry.create`, `entry.update`, `entry.delete` | A content entry is changed in the Content Manager |
| `entry.publish`, `entry.unpublish` | An entry is published or unpublished |
| `media.create`, `media.update`, `media.delete` | A file in the Media Library is changed |
| `media-folder.create`, `media-folder.update`, `media-folder.delete` | A Media Library folder is changed |
| `user.create`, `user.update`, `user.delete` | An admin user is changed |
| `role.create`, `role.update`, `role.delete` | An admin role is changed |
| `permission.create`, `permission.update`, `permission.delete` | Admin permissions are changed |
| `admin.auth.success` | An admin logs in |
| `admin.logout` | An admin logs out |

## Admin API

The admin panel reads logs through these routes. They require an authenticated admin
with the `plugin::audit-logging.read` permission.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/audit-logging/logs` | Paginated list, newest first |
| `GET` | `/audit-logging/logs/:id` | One entry, including its payload |

The list route accepts these query parameters:

| Parameter | Description |
| --- | --- |
| `page`, `pageSize` | Pagination. `pageSize` is capped at 100. |
| `action` | Exact event name, for example `entry.publish` |
| `contentType` | Exact content type UID, for example `api::article.article` |
| `user` | Matches part of the user's email or display name, ignoring case |
| `from`, `to` | ISO 8601 dates bounding the event date |

## Using the service from your own code

You can record custom events from your own code:

```js
await strapi.plugin('audit-logging').service('audit-log').record({
  action: 'order.refund',
  user: ctx.state.user,
  contentType: 'api::order.order',
  entryId: order.id,
  payload: { amount: order.total },
});
```

`record` stores the payload exactly as you pass it. It is not redacted, so leave
secrets out.

## Storage

Entries are stored in the `audit_logging_logs` table. The content type is hidden from
the Content Manager and the Content-Type Builder. Each entry keeps a snapshot of the
user's email and display name, so the log still reads correctly after a user is renamed
or deleted.

## Development

```bash
git clone https://github.com/SanthoshSivan-Dev/strapi-plugin-audit-logging.git
cd strapi-plugin-audit-logging
npm install
npm test
npm run build
```

To try your changes in a Strapi app, run `npm run watch:link` here and follow the
instructions it prints, or run `npm pack` and install the generated `.tgz` file in your
app.

## Contributing

Issues and pull requests are welcome. Please run `npm test` and `npm run build` before
opening a pull request.

## License

[MIT](./LICENSE)

Strapi is a trademark of Strapi Solutions SAS. This project is not affiliated with Strapi.
