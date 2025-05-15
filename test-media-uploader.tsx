"use client";

import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { MediaType, MediaPurpose } from "@/types";
import { DocumentFormat } from "@/constants";
import { QuickPropertyFormValues } from "./quick-property-form";

interface MediaUploaderProps {
  form: UseFormReturn<QuickPropertyFormValues>;
}

export function MediaUploader({ form }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileUploadRef = useRef<HTMLDivElement>(null);

  // Helper function to determine media type and format from file name
  const getMediaTypeAndFormat = (fileName: string) => {
    // Get file extension
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Determine media type based on extension
    if (/^(jpg|jpeg|png|gif|webp)$/i.test(extension)) {
      return {
        type: MediaType.IMAGE,
        format: extension.toUpperCase() as DocumentFormat,
        purpose: MediaPurpose.GALLERY
      };
    } else if (/^(mp4|webm|mov|avi|mkv|ogv|wmv)$/i.test(extension)) {
      return {
        type: MediaType.VIDEO,
        format: extension.toUpperCase() as DocumentFormat,
        purpose: MediaPurpose.WALKTHROUGH
      };
    } else if (/^(pdf|doc|docx|xls|xlsx)$/i.test(extension)) {
      return {
        type: MediaType.DOCUMENT,
        format: extension.toUpperCase() as DocumentFormat,
        purpose: MediaPurpose.DOCUMENT
      };
    } else {
      return {
        type: MediaType.DOCUMENT,
        format: DocumentFormat.OTHER,
        purpose: MediaPurpose.DOCUMENT
      };
    }
  };

  // Handle upload completion
  const handleUploadComplete = (uploadedFiles: string[]) => {
    setIsUploading(false);
    
    // The FileUpload component returns an array of file keys
    // We need to transform these into media items
    // Important: Don't use existing media items to prevent duplicates
    const mediaItems: any[] = form.getValues("mediaItems") || [];
    
    const newMediaItems = uploadedFiles.map((key, index) => {
      // Extract the file name from the key
      const fileName = key.split('/').pop() || `file-${index}`;
      
      // Get media type and format
      const { type, format, purpose } = getMediaTypeAndFormat(fileName);
      
      // Determine if thumbnail is needed
      const needsThumbnail = type === MediaType.IMAGE;
      
      return {
        type,
        format,
        url: `${process.env.NEXT_PUBLIC_STORAGE_URL}/${key}`,
        thumbnailUrl: needsThumbnail ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${key}` : null,
        title: fileName,
        description: `Property ${type.toLowerCase()} ${index + 1}`,
        purpose,
        featured: index === 0 && mediaItems.length === 0,
        sorting: mediaItems.length + index
      };
    });
    
    // Update form with new media items
    form.setValue("mediaItems", [...mediaItems, ...newMediaItems]);
    
    toast.success(`${uploadedFiles.length} files uploaded successfully`);
  };

  // Get the current media items from the form
  const mediaItems = form.watch("mediaItems") || [];

  return (
    <div className="space-y-2">
      <FormLabel className="text-base font-medium">Property Media</FormLabel>
      <FormItem>
        <FormControl>
          <div ref={fileUploadRef}>
            <FileUpload
              onUploadStart={() => setIsUploading(true)}
              onUploadProgress={setUploadProgress}
              onUploadComplete={handleUploadComplete}
              prefix="properties"
              maxSize={1024 * 1024 * 1024} // 100MB
              description="Upload property images and videos. Maximum file size: 1GB"
              disabled={isUploading}
              metadata={{
                propertyId: 'new-property',
                uploadedAt: new Date().toISOString(),
              }}
            />
          </div>
        </FormControl>
        <FormDescription className="text-xs">
          Upload images and videos for the property. Supported formats: JPG, PNG, GIF, MP4, WEBM, MOV.
        </FormDescription>
      </FormItem>
      
      {mediaItems.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">{mediaItems.length} media item(s) uploaded</p>
          <div className="grid grid-cols-3 gap-2">
            {mediaItems.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                {item.type === MediaType.IMAGE && (
                  <img 
                    src={item.url|| item.url} 
                    alt={item.title || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.type === MediaType.VIDEO && (
                  <div className="relative w-full h-full flex items-center justify-center bg-black/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                          <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                      </div>
                    </div>
                    <video 
                      src={item.url}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                )}
                {item.type === MediaType.DOCUMENT && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary mb-1">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-xs truncate w-full text-center">{item.format}</span>
                  </div>
                )}
              </div>
            ))}
            {mediaItems.length > 3 && (
              <div className="relative aspect-square rounded-md overflow-hidden bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">+{mediaItems.length - 3} more</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
