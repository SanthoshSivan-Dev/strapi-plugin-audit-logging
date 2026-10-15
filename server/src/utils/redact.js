export const DEFAULT_REDACTED_FIELDS = [
  'password',
  'resetPasswordToken',
  'registrationToken',
  'confirmationToken',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
];

export const REDACTED = '[REDACTED]';

// Returns a JSON-safe deep copy of `value` with sensitive keys masked. Key matching
// is case-insensitive. Circular references are replaced instead of throwing, since
// event payloads can carry ORM objects that point back at themselves.
export const redact = (value, fields = DEFAULT_REDACTED_FIELDS) => {
  const keys = new Set(fields.map((field) => field.toLowerCase()));
  const seen = new WeakSet();

  const walk = (current) => {
    if (current === null || typeof current !== 'object') {
      if (typeof current === 'bigint') return current.toString();
      if (typeof current === 'function' || typeof current === 'symbol') return undefined;
      return current;
    }
    if (current instanceof Date) return current.toISOString();
    if (seen.has(current)) return '[Circular]';
    seen.add(current);

    let result;
    if (Array.isArray(current)) {
      result = current.map((item) => {
        const walked = walk(item);
        return walked === undefined ? null : walked;
      });
    } else {
      result = {};
      for (const [key, item] of Object.entries(current)) {
        if (keys.has(key.toLowerCase())) {
          result[key] = REDACTED;
          continue;
        }
        const walked = walk(item);
        if (walked !== undefined) result[key] = walked;
      }
    }

    seen.delete(current);
    return result;
  };

  return walk(value);
};
