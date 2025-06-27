import { ChartConfig } from '../chart';

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === undefined) {
    return;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof (payload as Record<string, unknown>).payload === 'object' &&
    (payload as Record<string, unknown>).payload !== null
      ? (payload as Record<string, unknown>).payload
      : undefined;

  let configLabelKey: string = key;

  if (key in (payload as Record<string, unknown>) && typeof (payload as Record<string, unknown>)[key] === 'string') {
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
