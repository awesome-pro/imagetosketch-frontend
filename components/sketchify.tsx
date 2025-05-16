"use client";

import React, { useState, useCallback, useRef } from "react";
import { useSketchProcessing } from "@/hooks/useSketchProcessing";
import { SketchOptions } from "@/components/ui/sketch-options";
import { SketchResults } from "@/components/ui/sketch-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SketchMethod, SketchConfig } from "@/types";
import { toast } from "sonner";
import { FileUpload } from "./ui/file-upload";

export function Sketchify() {
  // State for sketch options
  const [sketchOptions, setSketchOptions] = useState<{
    method: SketchMethod;
    config?: SketchConfig;
  }>({
    method: SketchMethod.ADVANCED,
  });
  
  // State to track processing state
  const [processing, setProcessing] = useState(false);
  
  // Hook for sketch processing
  const { 
    batchProcessImages, 
    processImage, 
    files: sketchFiles, 
    processing: isProcessing, 
    clearFiles 
  } = useSketchProcessing();
  
  // Handle sketch options change
  const handleOptionsChange = useCallback((options: {
    method: SketchMethod;
    config?: SketchConfig;
  }) => {
    setSketchOptions(options);
  }, []);
  
  // Handle upload complete and process images
  const handleUploadComplete = useCallback(async (fileKeys: string[]) => {
    if (fileKeys.length === 0) {
      toast.error("No files uploaded");
      return;
    }
    
    try {
      setProcessing(true);
      
      // Prepare upload results for batch processing
      const uploadResults = fileKeys.map((key) => {
        const fileName = key.split("/").pop() || "Unknown";
        
        return {
          key,
          size: 0, // Size isn't critical for processing
          name: fileName,
        };
      });
      
      // Process images
      await batchProcessImages(uploadResults, {
        method: sketchOptions.method,
        config: sketchOptions.config,
        onProgress: (progress: number) => {
          toast.loading(`Processing ${progress}%`, { duration: Infinity, id: "processing" });
        },
      });

      toast.dismiss("processing");
      
      toast.success(`Successfully processed ${fileKeys.length} images`);
    } catch (error: any) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files", error.detail);
    } finally {
      setProcessing(false);
    }
  }, [batchProcessImages, sketchOptions]);
  
  // Handle retry for failed processing
  const handleRetry = useCallback(async (fileId: string) => {
    const file = sketchFiles.find((f) => f.id === fileId);
    
    if (!file) {
      toast.error("File not found");
      return;
    }
    
    try {
      setProcessing(true);
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
    } finally {
      setProcessing(false);
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
              <FileUpload
                onUploadComplete={handleUploadComplete}
                maxFiles={10}
                maxSize={5 * 1024 * 1024} // 5MB
                disabled={processing}
                prefix="sketches"
                isPublic={true}
                metadata={{
                  purpose: "sketch-processing",
                  uploadedAt: new Date().toISOString(),
                }}
                showFileList={true}
                autoUpload={false}
                description="Upload images to convert to sketches. Maximum file size: 5MB. Accepted formats: JPG, PNG, WEBP"
              />
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
                disabled={processing || isProcessing}
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
