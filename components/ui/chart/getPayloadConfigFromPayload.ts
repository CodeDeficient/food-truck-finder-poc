import type { ChartConfig } from '../chart';

// Helper to extract item config from a payload.
/**
 * Extracts a configuration value from the payload based on a specified key.
 * @example
 * getPayloadConfigFromPayload(chartConfig, dataPayload, 'dataKey')
 * some sample return value
 * @param {ChartConfig} config - A configuration object containing chart settings.
 * @param {unknown} payload - The data object from which to extract configuration information.
 * @param {string} key - The key used to lookup configuration in the payload or config.
 * @returns {unknown} Returns the configuration value from either the payload or chart config.
 * @description
 *   - The function checks if the payload or an internal payload object contains the key and is of type string.
 *   - If the key is found in the payload, it overrides the original key for the lookup in the config.
 *   - If the key is not found or is invalid, the function defaults to using the original key.
 */
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof (payload as Record<string, unknown>).payload === 'object' &&
    (payload as Record<string, unknown>).payload !== null
      ? (payload as Record<string, unknown>).payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in (payload as Record<string, unknown>) &&
    typeof (payload as Record<string, unknown>)[key] === 'string'
  ) {
    configLabelKey = (payload as Record<string, unknown>)[key] as string;
  } else if (
    payloadPayload !== undefined &&
    key in (payloadPayload as Record<string, unknown>) &&
    typeof (payloadPayload as Record<string, unknown>)[key] === 'string'
  ) {
    configLabelKey = (payloadPayload as Record<string, unknown>)[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export { getPayloadConfigFromPayload };
