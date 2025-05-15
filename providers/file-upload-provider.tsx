"use client";

import React from 'react';
import { FileUploadProvider } from '@/contexts/file-upload-context';

export function FileUploadProviders({ children }: { children: React.ReactNode }) {
  return (
    <FileUploadProvider>
      {children}
    </FileUploadProvider>
  );
}
