import React from 'react';
import { ProductContextProvider } from '@/context/ProductContext';

export default function ProductLayout({ children }) {
  return <ProductContextProvider>{children}</ProductContextProvider>;
}
