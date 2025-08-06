import { ApiResponse } from '@/types';
import { api } from '@/lib/api/client';

export const wellKnownEndpoints = {
  getSamlCertificate: () =>
    api.get<ApiResponse<string>>('/well-known/saml.cer'),
};
