import { prisma } from '@/lib/prisma';
import * as ApiKeyOps from '@oscrat/model/operations';

interface CreateApiKeyParams {
  name: string;
  teamId: string;
}

export const hashApiKey = (apiKey: string) => {
  return ApiKeyOps.hashApiKey(apiKey);
};

export const generateUniqueApiKey = () => {
  return ApiKeyOps.generateUniqueApiKey();
};

export const createApiKey = async (params: CreateApiKeyParams) => {
  return await ApiKeyOps.createApiKey(prisma, params);
};

export const fetchApiKeys = async (teamId: string) => {
  return await ApiKeyOps.fetchApiKeys(prisma, teamId);
};

export const deleteApiKey = async (id: string) => {
  return await ApiKeyOps.deleteApiKey(prisma, id);
};
