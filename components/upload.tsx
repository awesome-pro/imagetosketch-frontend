'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { uploadFile } from '@/services';

interface FileUploadProps {
  onUploadSuccess?: (fileUrl: string) => void;
  onUploadError?: (error: string) => void;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  folder?: string;
  buttonText?: string;
  className?: string;
}

export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSizeMB = 10,
  folder,
  buttonText = 'Choose File',
  className = '',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploadedFile(null);
    
    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      const error = `File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}`;
      setError(error);
      if (onUploadError) onUploadError(error);
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      const error = `File size exceeds the limit of ${maxSizeMB}MB`;
      setError(error);
      if (onUploadError) onUploadError(error);
      return;
    }

    // Start upload
    setIsUploading(true);
    setUploadProgress(10); // Initial progress indicator

    try {
      // Simulate progress (since we can't track actual progress with presigned URLs)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      const result = await uploadFile(file, folder);
      
      // Clear progress interval
      clearInterval(progressInterval);

      if (result.success && result.fileUrl) {
        setUploadProgress(100);
        setUploadedFile(result.fileUrl);
        if (onUploadSuccess) onUploadSuccess(result.fileUrl);
      } else {
        setError(result.error || 'Upload failed');
        if (onUploadError) onUploadError(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`file-upload-component ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedFileTypes.join(',')}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : buttonText}
      </button>
      
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
          </p>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
      
      {uploadedFile && (
        <div className="mt-3">
          <p className="text-green-600 text-sm">File uploaded successfully!</p>
          <p className="text-sm text-gray-600 break-all mt-1">
            <a 
              href={uploadedFile} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {uploadedFile}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}