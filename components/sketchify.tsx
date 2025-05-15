"use client";

import React, { useState, useCallback } from "react";
import { useDirectUpload } from "@/hooks/useDirectUpload";
import { useSketchProcessing } from "@/hooks/useSketchProcessing";
import { FileUploader } from "@/components/ui/file-uploader";
import { SketchOptions } from "@/components/ui/sketch-options";
import { SketchResults } from "@/components/ui/sketch-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SketchMethod, SketchConfig } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function Sketchify() {
  // State for selected files and upload progress
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    key: string;
    status?: "success" | "error";
    error?: string;
  }>>([]);
  
  // State for sketch options
  const [sketchOptions, setSketchOptions] = useState<{
    method: SketchMethod;
    config?: SketchConfig;
  }>({
    method: SketchMethod.ADVANCED,
  });
  
  // Hooks for file upload and sketch processing
  const { uploadFiles, uploading, progress } = useDirectUpload();
  const { 
    batchProcessImages, 
    processImage, 
    files: sketchFiles, 
    processing, 
    clearFiles 
  } = useSketchProcessing();
  
  // Handle file selection
  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);
  
  // Handle clearing files
  const handleClearFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadedFiles([]);
  }, []);
  
  // Handle sketch options change
  const handleOptionsChange = useCallback((options: {
    method: SketchMethod;
    config?: SketchConfig;
  }) => {
    setSketchOptions(options);
  }, []);
  
  // Handle upload and processing
  const handleUploadAndProcess = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    
    try {
      // Upload files
      const results = await uploadFiles(selectedFiles, {
        prefix: "sketches",
        isPublic: true,
        onProgress: (progress) => {
          // Progress is handled by the hook
        },
      });
      
      // Update uploaded files state
      const uploadedFilesList = results.map((result) => ({
        name: selectedFiles.find((f) => 
          f.name === result.key.split("/").pop()?.replace(/^[^-]+-/, "") || ""
        )?.name || result.key.split("/").pop() || "Unknown",
        size: result.size,
        key: result.key,
        status: result.success ? "success" as const : "error" as const,
        error: result.error,
      }));
      
      setUploadedFiles(uploadedFilesList);
      
      // Process successful uploads
      const successfulUploads = results.filter((r) => r.success);
      
      if (successfulUploads.length > 0) {
        // Prepare upload results for batch processing
        const uploadResults = successfulUploads.map((result) => {
          const fileName = selectedFiles.find((f) => 
            f.name === result.key.split("/").pop()?.replace(/^[^-]+-/, "") || ""
          )?.name || result.key.split("/").pop() || "Unknown";
          
          return {
            key: result.key,
            size: result.size,
            name: fileName,
          };
        });
        
        // Process images
        await batchProcessImages(uploadResults, {
          method: sketchOptions.method,
          config: sketchOptions.config,
          onProgress: (progress) => {
            // Progress is handled by the hook
          },
        });
        
        toast.success(`Successfully processed ${successfulUploads.length} images`);
      } else {
        toast.error("No files were uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading and processing files:", error);
      toast.error("Failed to upload and process files");
    }
  }, [selectedFiles, uploadFiles, batchProcessImages, sketchOptions]);
  
  // Handle retry for failed processing
  const handleRetry = useCallback(async (fileId: string) => {
    const file = sketchFiles.find((f) => f.id === fileId);
    
    if (!file) {
      toast.error("File not found");
      return;
    }
    
    try {
      await processImage(
        file.originalKey,
        file.name,
        file.size,
        {
          method: sketchOptions.method,
          config: sketchOptions.config,
        }
      );
      
      toast.success("Successfully reprocessed image");
    } catch (error) {
      console.error("Error reprocessing image:", error);
      toast.error("Failed to reprocess image");
    }
  }, [sketchFiles, processImage, sketchOptions]);
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Sketchify</CardTitle>
          <CardDescription>
            Convert your images to beautiful pencil sketches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Images</TabsTrigger>
              <TabsTrigger value="options">Sketch Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <FileUploader
                onFilesSelected={handleFilesSelected}
                onClearFiles={handleClearFiles}
                maxFiles={10}
                maxSize={5 * 1024 * 1024} // 5MB
                disabled={uploading || processing}
                uploading={uploading}
                progress={0}
                uploadedFiles={uploadedFiles.map((file) => ({
                  name: file.name,
                  size: file.size,
                  status: file.status,
                  error: file.error,
                }))}
              />
              
              <div className="flex justify-end">
                <Button
                  onClick={handleUploadAndProcess}
                  disabled={
                    selectedFiles.length === 0 || 
                    uploading || 
                    processing
                  }
                >
                  {(uploading || processing) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {uploading
                    ? "Uploading..."
                    : processing
                    ? "Processing..."
                    : "Upload & Process"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="options">
              <SketchOptions
                onOptionsChange={handleOptionsChange}
                defaultMethod={sketchOptions.method}
                defaultConfig={sketchOptions.config}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {sketchFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Your processed sketch images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SketchResults
              files={sketchFiles}
              onRetry={handleRetry}
            />
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={clearFiles}
                disabled={processing}
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
