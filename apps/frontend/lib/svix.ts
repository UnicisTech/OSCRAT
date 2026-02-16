import { EndpointIn, Svix } from 'svix';

import env from './env';
import type { AppEvent } from 'types';

// Check if Svix is properly configured (not empty, not "undefined" string)
const isSvixEnabled = (): boolean => {
  const apiKey = env.svix.apiKey;
  return Boolean(apiKey && apiKey !== 'undefined' && apiKey.trim() !== '');
};

// Lazy initialization of Svix client - only create when actually needed
let svixClient: Svix | null = null;

const getSvixClient = (): Svix | null => {
  if (!isSvixEnabled()) {
    return null;
  }
  if (!svixClient) {
    svixClient = new Svix(env.svix.apiKey);
  }
  return svixClient;
};

export const findOrCreateApp = async (name: string, uid: string) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.application.getOrCreate({ name, uid });
};

export const createWebhook = async (appId: string, data: EndpointIn) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.endpoint.create(appId, data);
};

export const updateWebhook = async (
  appId: string,
  endpointId: string,
  data: EndpointIn
) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.endpoint.update(appId, endpointId, data);
};

export const findWebhook = async (appId: string, endpointId: string) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.endpoint.get(appId, endpointId);
};

export const listWebhooks = async (appId: string) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.endpoint.list(appId);
};

export const deleteWebhook = async (appId: string, endpointId: string) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.endpoint.delete(appId, endpointId);
};

export const sendEvent = async (
  appId: string,
  eventType: AppEvent,
  payload: Record<string, unknown>
) => {
  const svix = getSvixClient();
  if (!svix) {
    return;
  }

  return await svix.message.create(appId, {
    eventType,
    payload: {
      event: eventType,
      data: payload,
    },
  });
};
