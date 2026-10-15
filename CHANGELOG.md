# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-10-15

### Changed

- Added the plugin logo and badges to the README. No code changes.

## [1.0.0] - 2026-10-15

### Added

- Audit log entries for content entries, media, media folders, admin users, roles,
  permissions, admin logins and logouts.
- Admin page with pagination, action and user filters, and a details view of the stored payload.
- `plugin::audit-logging.read` permission to control who can see the logs.
- Daily cleanup of entries older than `retentionDays`.
- Config options: `events`, `excludedEvents`, `excludedContentTypes`, `redactedFields`,
  `storePayload`, `cleanupCron`.
- Masking of passwords, tokens and secrets in stored payloads.
