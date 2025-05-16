"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDirectUpload } from '@/hooks/useDirectUpload';
import { useFileUpload } from '@/contexts/file-upload-context';
import { 
  Loader2, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw,
  File as FileIcon,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText as FileTextIcon,
  File as FilePdf,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

declare global {
  interface Window {
    resetFileUpload?: () => void;
  }
}

export interface FileUploadProps {
  onUploadComplete?: (fileKeys: string[]) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  prefix?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  showFileList?: boolean;
  autoUpload?: boolean;
  description?: string;
  initialFileKeys?: string[];
}

// Helper function to get appropriate icon for file type
const getFileIcon = (file: File) => {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4" />;
  } else if (type.startsWith('video/')) {
    return <FileIcon className="h-4 w-4 text-blue-500" />;
  } else if (type === 'application/pdf') {
    return <FilePdf className="h-4 w-4" />;
  } else if (type.includes('spreadsheet') || type.includes('excel')) {
    return <FileSpreadsheet className="h-4 w-4" />;
  } else if (type.includes('document') || type.includes('word')) {
    return <FileTextIcon className="h-4 w-4" />;
  } else {
    return <FileIcon className="h-4 w-4" />;
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

export function FileUpload({
  onUploadComplete,
  onUploadStart,
  onUploadProgress,
  maxFiles = 10,
  maxSize = 1024 * 1024 * 1024, // 100MB default
  accept = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/avif': ['.avif'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    // Added video formats
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/ogg': ['.ogv'],
    'video/quicktime': ['.mov'],
    'video/x-msvideo': ['.avi'],
    'video/x-ms-wmv': ['.wmv'],
    'video/x-matroska': ['.mkv'],
    'video/3gpp': ['.3gp'],
    'video/3gpp2': ['.3g2'],
    'video/x-flv': ['.flv'],
    'video/mpeg': ['.mpeg', '.mpg'],
    'video/mp2t': ['.ts'],
    'video/x-m4v': ['.m4v']
  },
  prefix = 'uploads',
  isPublic = false,
  metadata,
  className,
  disabled = false,
  showFileList = true,
  autoUpload = false,
  description = 'Maximum file size: 100MB. Accepted formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX',
  initialFileKeys = []
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileKeys, setUploadedFileKeys] = useState<string[]>(initialFileKeys || []);
  const [overallProgress, setOverallProgress] = useState(0);
  
  const { uploadFiles, cancelUpload, cancelAllUploads } = useDirectUpload();
  
  // Use the file upload context
  const fileUploadContext = useFileUpload();
  
  // Extract files and progress from context
  const files = Array.from(fileUploadContext.files.entries());
  const fileProgress = fileUploadContext.progress;
  const fileUploads = fileUploadContext.uploads;
  
  // Clear the context when component mounts to prevent stale data
  useEffect(() => {
    fileUploadContext.clearFiles();
    // Only set initialFileKeys if they exist and we're mounting with them
    if (initialFileKeys && initialFileKeys.length > 0) {
      setUploadedFileKeys(initialFileKeys);
    }
    
    // Clean up when component unmounts
    return () => {
      cancelAllUploads();
    };
  }, []);
  
  // Calculate overall progress whenever individual file progress changes
  useEffect(() => {
    if (files.length === 0) {
      setOverallProgress(0);
      return;
    }
    
    const totalProgress = Array.from(fileProgress.values()).reduce((sum, p) => sum + p, 0);
    const avgProgress = Math.round(totalProgress / Math.max(files.length, 1));
    
    setOverallProgress(avgProgress);
    onUploadProgress?.(avgProgress);
  }, [fileProgress, files.length, onUploadProgress]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file size
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds ${formatFileSize(maxSize)}`);
        return false;
      }
      return true;
    });

    // Add files to context (which now checks for duplicates internally)
    fileUploadContext.addFiles(validFiles);
    
    // Auto upload if enabled
    if (autoUpload && validFiles.length > 0) {
      handleUpload();
    }
  }, [maxSize, autoUpload, toast, fileUploadContext]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled: disabled || isUploading,
  });

  const removeFile = useCallback((fileId: string) => {
    // Cancel upload if in progress
    if (fileUploadContext.uploads.get(fileId)?.status === 'uploading') {
      cancelUpload(fileId);
    }
    
    // Remove from context
    fileUploadContext.removeFile(fileId);
  }, [fileUploadContext, cancelUpload]);

  // Function to reset the component state
  const resetFileUpload = useCallback(() => {
    fileUploadContext.clearFiles();
    setUploadedFileKeys([]);
    setOverallProgress(0);
    setIsUploading(false);
  }, [fileUploadContext]);

  const handleUpload = async () => {
    const filesToUpload = Array.from(fileUploadContext.files.values()).filter(file => {
      const fileEntries = Array.from(fileUploadContext.files.entries());
      const fileId = fileEntries.find(([_, f]) => f.name === file.name && f.size === file.size)?.[0];
      if (!fileId) return false;
      
      const upload = fileUploadContext.uploads.get(fileId);
      return !upload || upload.status !== 'success';
    });
    
    if (filesToUpload.length === 0) {
      toast.error('No files to upload');
      return [];
    }
    
    setIsUploading(true);
    onUploadStart?.();
    
    try {
      // Upload files directly to S3
      const results = await uploadFiles(filesToUpload, {
        prefix,
        isPublic,
        metadata,
        onProgress: (progress: number, fileName: string) => {
          // The individual file progress is handled by the useDirectUpload hook
          // which updates the context
        },
        maxConcurrentUploads: 3, // Limit concurrent uploads
      });
      
      // Filter successful uploads and get their keys
      const successfulUploads = results.filter(result => result.success);
      const fileKeys = successfulUploads.map(result => result.key);
      
      // Use only the new keys, not combining with existing keys to prevent duplicates
      setUploadedFileKeys(fileKeys);
      
      // Check if any uploads failed
      const failedCount = results.length - successfulUploads.length;
      if (failedCount > 0) {
        toast.error(`${failedCount} file(s) failed to upload. Please try again.`);
      } else if (successfulUploads.length > 0) {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      }
      
      onUploadComplete?.(fileKeys);
      return fileKeys;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const retryUpload = useCallback((fileId: string) => {
    const file = fileUploadContext.getFileById(fileId);
    if (!file) return;
    
    // Reset status
    fileUploadContext.setUploadStatus(fileId, 'pending');
    fileUploadContext.setProgress(fileId, 0);
    
    // Trigger upload
    if (!isUploading) {
      handleUpload();
    }
  }, [fileUploadContext, isUploading]);

  const clearFiles = () => {
    // Cancel any in-progress uploads
    cancelAllUploads();
    
    // Clear context and reset state
    fileUploadContext.clearFiles();
    setUploadedFileKeys([]);
    setOverallProgress(0);
  };

  // Expose the reset function to parent components
  useEffect(() => {
    // Add resetFileUpload to the component instance
    if (typeof window !== 'undefined') {
      window.resetFileUpload = resetFileUpload;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.resetFileUpload;
      }
    };
  }, [resetFileUpload]);

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed border-primary hover:border-primary rounded-md cursor-pointer p-6 transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-muted hover:border-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center space-x-2">
            <UploadCloud className="h-10 w-10 text-primary/80 mb-2" />
            <File className="h-10 w-10 text-primary/80 mb-2" />
          </div>
          <p className="text-sm text-primary/80">
            {isDragActive 
              ? 'Drop the files here' 
              : 'Drag and drop files here, or click to select'}
          </p>
          <p className="text-xs text-primary/80 mt-1">
            {description}
          </p>
        </div>
      </div>

      {showFileList && files.length > 0 && (
        <div className="border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
            </div>
            <div className="flex space-x-2">
              {!autoUpload && (
                <Button 
                  size="sm" 
                  onClick={() => handleUpload()}
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : 'Upload'}
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearFiles}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map(([fileId, file]) => {
              const progress = fileProgress.get(fileId) || 0;
              const upload = fileUploads.get(fileId);
              const status = upload?.status || 'pending';
              
              // Determine background color based on status
              const bgColorClass = 
                status === 'success' ? "bg-green-50" : 
                status === 'error' ? "bg-red-50" : 
                status === 'uploading' ? "bg-blue-50" : 
                "bg-muted/20";
              
              return (
                <div 
                  key={fileId} 
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-md",
                    bgColorClass
                  )}
                >
                  <div className="flex items-center space-x-2 flex-grow mr-2 overflow-hidden">
                    {getFileIcon(file)}
                    <div className="flex flex-col flex-grow min-w-0">
                      <div className="flex items-center">
                        <span className="text-sm truncate mr-2">{file.name}</span>
                        {status === 'success' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload successful</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {status === 'error' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{upload?.error || 'Upload failed'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        {status === 'uploading' && (
                          <span className="text-xs text-blue-500">{progress}%</span>
                        )}
                      </div>
                      {status === 'uploading' && (
                        <Progress 
                          value={progress} 
                          className="h-1 mt-1" 
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {status === 'error' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => retryUpload(fileId)}
                        className="h-6 w-6"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileId)}
                      disabled={isUploading && status === 'uploading'}
                      className="h-6 w-6"
                    >
                      {status === 'uploading' ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
