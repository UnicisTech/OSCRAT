import { api } from '@/lib/api/client';

export interface ScimUser {
  id: string;
  userName: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: { value: string; primary?: boolean }[];
  active: boolean;
}

export interface ScimGroup {
  id: string;
  displayName: string;
  members: { value: string }[];
}

export interface ScimListResponse<T> {
  Resources: T[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  schemas: string[];
}

export const scimEndpoints = {
  v2: {
    users: {
      list: (
        directoryId: string,
        params?: { startIndex?: number; count?: number; filter?: string }
      ) =>
        api.get<ScimListResponse<ScimUser>>(`/scim/v2.0/${directoryId}/Users`, {
          params,
        }),

      get: (directoryId: string, userId: string) =>
        api.get<ScimUser>(`/scim/v2.0/${directoryId}/Users/${userId}`),

      create: (directoryId: string, user: Partial<ScimUser>) =>
        api.post<ScimUser>(`/scim/v2.0/${directoryId}/Users`, user),

      update: (directoryId: string, userId: string, user: Partial<ScimUser>) =>
        api.put<ScimUser>(`/scim/v2.0/${directoryId}/Users/${userId}`, user),

      patch: (
        directoryId: string,
        userId: string,
        operations: { op: string; path?: string; value?: any }[]
      ) =>
        api.patch<ScimUser>(`/scim/v2.0/${directoryId}/Users/${userId}`, {
          Operations: operations,
        }),

      delete: (directoryId: string, userId: string) =>
        api.delete<void>(`/scim/v2.0/${directoryId}/Users/${userId}`),
    },

    groups: {
      list: (
        directoryId: string,
        params?: { startIndex?: number; count?: number; filter?: string }
      ) =>
        api.get<ScimListResponse<ScimGroup>>(
          `/scim/v2.0/${directoryId}/Groups`,
          { params }
        ),

      get: (directoryId: string, groupId: string) =>
        api.get<ScimGroup>(`/scim/v2.0/${directoryId}/Groups/${groupId}`),

      create: (directoryId: string, group: Partial<ScimGroup>) =>
        api.post<ScimGroup>(`/scim/v2.0/${directoryId}/Groups`, group),

      update: (
        directoryId: string,
        groupId: string,
        group: Partial<ScimGroup>
      ) =>
        api.put<ScimGroup>(
          `/scim/v2.0/${directoryId}/Groups/${groupId}`,
          group
        ),

      patch: (
        directoryId: string,
        groupId: string,
        operations: { op: string; path?: string; value?: any }[]
      ) =>
        api.patch<ScimGroup>(`/scim/v2.0/${directoryId}/Groups/${groupId}`, {
          Operations: operations,
        }),

      delete: (directoryId: string, groupId: string) =>
        api.delete<void>(`/scim/v2.0/${directoryId}/Groups/${groupId}`),
    },
  },
};
