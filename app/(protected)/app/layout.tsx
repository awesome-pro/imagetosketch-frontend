"use client";

import { FileUploadProvider } from "@/contexts/file-upload-context";


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FileUploadProvider>{children}</FileUploadProvider>;
}