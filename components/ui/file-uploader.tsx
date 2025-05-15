"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onClearFiles: () => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  uploadedFiles?: Array<{
    name: string;
    size: number;
    status?: "success" | "error";
    error?: string;
  }>;
  className?: string;
}

export function FileUploader({
  onFilesSelected,
  onClearFiles,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"],
  },
  disabled = false,
  uploading = false,
  progress = 0,
  uploadedFiles = [],
  className,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      
      // Check if the number of files exceeds the maximum
      if (acceptedFiles.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files at once.`);
        return;
      }
      
      // Check if any file exceeds the maximum size
      const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the maximum size of ${(maxSize / (1024 * 1024)).toFixed(1)}MB.`);
        return;
      }
      
      onFilesSelected(acceptedFiles);
    },
    [maxFiles, maxSize, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled: disabled || uploading,
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isDragReject ? "border-destructive bg-destructive/5" : "",
          disabled || uploading ? "opacity-50 cursor-not-allowed" : "",
          "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Drag and drop your images here</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse your files
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFiles}
              disabled={uploading}
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <ImageIcon className="h-5 w-5 flex-shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {file.status === "error" && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">{file.error || "Error"}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
