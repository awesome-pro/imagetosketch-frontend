import { useState, useCallback } from 'react';
import { useFileUpload } from '@/contexts/file-upload-context';
import { fileApi } from '@/services/file.api';

interface UploadOptions {
  prefix?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  expiresIn?: number;
  onProgress?: (progress: number, fileName: string) => void;
  maxConcurrentUploads?: number;
  abortSignal?: AbortSignal;
}

interface UploadResult {
  key: string;
  size: number;
  etag: string;
  success: boolean;
  error?: string;
  url?: string;
}

export const useDirectUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [abortControllers, setAbortControllers] = useState<Record<string, AbortController>>({});
  
  // Use the file upload context
  const fileUploadContext = useFileUpload();

  /**
   * Cancel an in-progress upload
   */
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllers[fileId];
    if (controller) {
      controller.abort();
      const newControllers = { ...abortControllers };
      delete newControllers[fileId];
      setAbortControllers(newControllers);
    }
  }, [abortControllers]);

  /**
   * Cancel all in-progress uploads
   */
  const cancelAllUploads = useCallback(() => {
    Object.values(abortControllers).forEach(controller => {
      controller.abort();
    });
    setAbortControllers({});
  }, [abortControllers]);

  /**
   * Upload a single file directly to S3 using a presigned URL
   */
  const uploadSingleFile = async (
    file: File,
    fileId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      // Create abort controller for this upload
      const controller = new AbortController();
      setAbortControllers(prev => ({ ...prev, [fileId]: controller }));
      
      // Update status in context
      fileUploadContext.setUploadStatus(fileId, 'uploading');
      
      // Step 1: Get presigned URL from backend
      const { data } = await fileApi.getPresignedUploadUrl({
          fileName: file.name,
          prefix: options.prefix,
          isPublic: options.isPublic,
        });

      if (!data?.url || !data?.key) {
        throw new Error('Failed to get presigned URL');
      }

      const { url, key } = data;

      // Step 2: Upload file directly to S3 using the presigned URL
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress((prev) => ({ ...prev, [fileId]: percentComplete }));
          
          // Update progress in context
          fileUploadContext.setProgress(fileId, percentComplete);
          
          // Call the onProgress callback if provided
          options.onProgress?.(percentComplete, file.name);
        }
      });

      // Set up abort handling
      options.abortSignal?.addEventListener('abort', () => {
        xhr.abort();
      });

      controller.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      // Create a promise to track the XHR completion
      const uploadPromise = new Promise<{ success: boolean; etag?: string }>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const etag = xhr.getResponseHeader('ETag')?.replace(/"/g, '');
            resolve({ success: true, etag });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });
      });

      // Start the upload
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      // Add Origin header to help with CORS
      xhr.send(file);

      // Wait for upload to complete
      const { success, etag } = await uploadPromise;

      if (!success) {
        throw new Error('Upload failed');
      }

      // wait for some time to confirm the upload
      await new Promise(resolve => setTimeout(resolve, 1050));

      // Step 3: Confirm the upload with the backend
      const confirmation = await fileApi.confirmFileUpload({
          key,
          etag,
      });

      if (!confirmation.data?.success) {
        throw new Error(
          confirmation.data?.error || 'Failed to confirm upload'
        );
      }

      const fileInfo = confirmation.data.fileInfo;
      const fileUrl = `https://s3.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}/${fileInfo.key}`;
      
      // Update status in context
      fileUploadContext.setUploadStatus(fileId, 'success', key, undefined, etag);

      // Clean up abort controller
      const newControllers = { ...abortControllers };
      delete newControllers[fileId];
      setAbortControllers(newControllers);

      return {
        key: fileInfo.key,
        size: fileInfo.size,
        etag: fileInfo.etag,
        success: true,
        url: fileUrl,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Update status in context
      fileUploadContext.setUploadStatus(
        fileId, 
        'error', 
        undefined, 
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      
      // Clean up abort controller
      const newControllers = { ...abortControllers };
      delete newControllers[fileId];
      setAbortControllers(newControllers);
      
      return {
        key: '',
        size: 0,
        etag: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  };

  /**
   * Upload multiple files directly to S3 with concurrency control
   */
  const uploadFiles = async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> => {
    if (!files.length) return [];

    setUploading(true);
    fileUploadContext.setUploading(true);
    setProgress({});

    try {
      const maxConcurrent = options.maxConcurrentUploads || 3;
      const results: UploadResult[] = [];
      
      // Add files to context
      fileUploadContext.addFiles(files);
      
      // Get file IDs from context
      const fileIds = Array.from(fileUploadContext.files.entries())
        .filter(([_, file]) => files.some(f => f.name === file.name && f.size === file.size))
        .map(([id]) => id);
      
      // Process files in batches to control concurrency
      const processQueue = async (remainingFileIds: string[]) => {
        const batchFileIds = remainingFileIds.slice(0, maxConcurrent);
        if (batchFileIds.length === 0) return;

        const batchResults = await Promise.all(
          batchFileIds.map(fileId => {
            const file = fileUploadContext.getFileById(fileId);
            if (!file) return Promise.resolve({
              key: '',
              size: 0,
              etag: '',
              contentType: '',
              success: false,
              error: 'File not found in context',
            });
            
            return uploadSingleFile(file, fileId, {
              ...options,
              onProgress: (fileProgress, fileName) => {
                options.onProgress?.(
                  (Object.values(progress).reduce((sum, p) => sum + p, 0) + fileProgress) / 
                  (Object.keys(progress).length + 1),
                  fileName
                );
              }
            });
          })
        );

        results.push(...batchResults);
        
        const remainingIds = remainingFileIds.slice(maxConcurrent);
        if (remainingIds.length > 0) {
          await processQueue(remainingIds);
        }
      };

      await processQueue(fileIds);
      return results;
    } catch (error) {
      console.error('Error uploading files:', error);
      return [];
    } finally {
      setUploading(false);
      fileUploadContext.setUploading(false);
    }
  };

  return {
    uploadSingleFile,
    uploadFiles,
    cancelUpload,
    cancelAllUploads,
    uploading,
    progress,
  };
};
