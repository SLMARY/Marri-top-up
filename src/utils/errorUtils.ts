/**
 * Universal error and text normalization utilities to prevent React Error #31
 * ("Objects are not valid as a React child. The object contains keys {code, message}").
 */

export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (error === null || error === undefined) {
    return fallback;
  }

  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (!trimmed) return fallback;

    // If the string itself is a serialized JSON error payload, parse it safely
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractErrorMessage(parsed, fallback);
      } catch {
        // Not valid JSON, continue with raw string
      }
    }

    if (trimmed === '[object Object]') {
      return fallback;
    }

    return trimmed;
  }

  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error);
  }

  if (Array.isArray(error)) {
    const messages = error
      .map((item) => extractErrorMessage(item, ''))
      .filter((msg) => msg.length > 0);
    return messages.length > 0 ? messages.join(', ') : fallback;
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    // 1. Check nested `error` property first (e.g. { error: { code, message } } or { error: "string" })
    if (obj.error !== undefined && obj.error !== null && obj.error !== error) {
      const nested = extractErrorMessage(obj.error, '');
      if (nested) return nested;
    }

    // 2. Check direct `message` property (e.g. Error instance or { code, message })
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      const msg = obj.message.trim();
      if (msg !== '[object Object]') {
        return msg;
      }
    }

    // 3. Check `details` or `status_message` or `reason`
    for (const key of ['details', 'reason', 'status_message', 'statusText', 'description']) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim().length > 0 && val.trim() !== '[object Object]') {
        return val.trim();
      }
    }

    // 4. If only `code` is present as a string/number
    if (typeof obj.code === 'string' || typeof obj.code === 'number') {
      const codeStr = String(obj.code).trim();
      if (codeStr === '500' || codeStr === 'FUNCTION_INVOCATION_FAILED') {
        return 'Server is temporarily busy or unavailable. Please try again in a moment.';
      }
      return `Request failed (Error code: ${codeStr}). Please try again.`;
    }
  }

  return fallback;
}

/**
 * Guarantees that any value interpolated inside JSX is a safe primitive string,
 * preventing React Error #31 even if unexpected objects exist in state or API responses.
 */
export function safeRenderText(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return extractErrorMessage(value, fallback);
}
