// Client-safe CSC utilities - NO Prisma imports allowed in this file
import type {
  ISO,
  CscStatusesProp,
  CscControlsProp,
  TaskProperties,
} from 'types';

export const getCscControlsProp = (ISO: ISO): CscControlsProp => {
  const cscStatusesProp = `csc_controls${
    ISO !== 'default' ? `_${ISO}` : ''
  }` as CscControlsProp;
  return cscStatusesProp;
};

export const getCscStatusesProp = (ISO: ISO): CscStatusesProp => {
  const cscStatusesProp = `csc_statuses${
    ISO !== 'default' ? `_${ISO}` : ''
  }` as CscStatusesProp;
  return cscStatusesProp;
};

// NOTE: All database operations have been moved to:
// - /pages/api/teams/[slug]/tasks/[taskNumber]/csc.ts (for existing API endpoint)
// - /models/team.ts (for server-side functions)
//
// This file now ONLY contains client-safe utilities.
// Components should use API calls via React Query hooks for data operations.
