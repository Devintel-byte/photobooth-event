'use client';
 
// import { type EdgeStoreRouter } from '../app/api/edgestore/[...edgestore]/route';
import { createEdgeStoreProvider } from '@edgestore/react';
 
const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  accessKey: process.env.NEXT_PUBLIC_EDGE_STORE_ACCESS_KEY,
  secretKey: process.env.NEXT_PUBLIC_EDGE_STORE_SECRET_KEY,
});

export { EdgeStoreProvider, useEdgeStore };