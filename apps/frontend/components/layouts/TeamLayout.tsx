import React from 'react';
import { TeamContextProvider } from '@/context/TeamContext';

export default function TeamSlugLayout({ children }) {
  return <TeamContextProvider>{children}</TeamContextProvider>;
}
