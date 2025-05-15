"use client";

import React from "react";
import Image from "next/image";
import { Download, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SketchFile } from "@/types";
import { cn } from "@/lib/utils";

interface SketchResultsProps {
  files: SketchFile[];
  onRetry?: (fileId: string) => void;
  onDownload?: (file: SketchFile) => void;
  className?: string;
}

export function SketchResults({
  files,
  onRetry,
  onDownload,
  className,
}: SketchResultsProps) {
  if (files.length === 0) {
    return null;
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (file: SketchFile) => {
    if (onDownload) {
      onDownload(file);
    } else if (file.sketchUrl) {
      // Default download behavior
      const link = document.createElement("a");
      link.href = file.sketchUrl;
      link.download = `sketch_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Sketch Results</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              {file.status === "completed" && file.sketchUrl ? (
                <Image
                  src={file.sketchUrl}
                  alt={`Sketch of ${file.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : file.status === "processing" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
                </div>
              ) : file.status === "failed" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                  <p className="mt-2 text-sm text-destructive">Processing failed</p>
                  {file.error && (
                    <p className="mt-1 text-xs text-muted-foreground max-w-full px-4 text-center">
                      {file.error}
                    </p>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.method}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {file.status === "completed" && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDownload(file)}
                        title="Download sketch"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {file.status === "failed" && onRetry && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onRetry(file.id)}
                        title="Retry processing"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
