function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isReactNativeRuntime() {
  return typeof navigator !== "undefined" && navigator.product === "ReactNative";
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function normalizeHost(host) {
  return host.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function resolveHostForTarget(host, target, env) {
  const normalizedTarget = toTrimmedString(target).toLowerCase();
  const isLoopback = host === "localhost" || host === "127.0.0.1";

  if (!isLoopback) {
    return host;
  }

  if (normalizedTarget === "android-emulator") {
    return toTrimmedString(env.NEXT_PUBLIC_RN_ANDROID_EMULATOR_HOST) || "10.0.2.2";
  }

  if (normalizedTarget === "ios-simulator") {
    return toTrimmedString(env.NEXT_PUBLIC_RN_IOS_SIMULATOR_HOST) || "localhost";
  }

  if (normalizedTarget === "device") {
    return toTrimmedString(env.NEXT_PUBLIC_RN_DEVICE_HOST) || host;
  }

  return host;
}

/**
 * Resolve the API base URL for RN from env vars with sensible defaults.
 * Priority:
 * 1) NEXT_PUBLIC_API_BASE_URL
 * 2) NEXT_PUBLIC_RN_API_BASE_URL
 * 3) Compose from NEXT_PUBLIC_RN_API_* values
 */
export function resolveReactNativeApiBaseUrl(env = process.env) {
  const explicitBaseUrl =
    toTrimmedString(env.NEXT_PUBLIC_API_BASE_URL) ||
    toTrimmedString(env.NEXT_PUBLIC_RN_API_BASE_URL);

  if (explicitBaseUrl) {
    return stripTrailingSlash(explicitBaseUrl);
  }

  if (!isReactNativeRuntime()) {
    return undefined;
  }

  const scheme = toTrimmedString(env.NEXT_PUBLIC_RN_API_SCHEME) || "http";
  const target = toTrimmedString(env.NEXT_PUBLIC_RN_TARGET) || "android-emulator";
  const configuredHost = toTrimmedString(env.NEXT_PUBLIC_RN_API_HOST) || "localhost";
  const host = resolveHostForTarget(normalizeHost(configuredHost), target, env);
  const port = toTrimmedString(env.NEXT_PUBLIC_RN_API_PORT) || "3000";

  return `${scheme}://${host}:${port}`;
}

/**
 * Auto-initialize base URL for RN clients using env-driven host mapping.
 */
export function autoInitReactNativeApiBaseUrl(setter, env = process.env) {
  if (typeof setter !== "function") {
    return undefined;
  }

  const resolvedBaseUrl = resolveReactNativeApiBaseUrl(env);
  if (!resolvedBaseUrl) {
    return undefined;
  }

  setter(resolvedBaseUrl);
  return resolvedBaseUrl;
}
