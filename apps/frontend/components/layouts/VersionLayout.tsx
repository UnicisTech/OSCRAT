import React from 'react';
import { VersionContextProvider } from '@/context/VersionContext';

export default function VersionLayout({ children }) {
  return <VersionContextProvider>{children}</VersionContextProvider>;
}
