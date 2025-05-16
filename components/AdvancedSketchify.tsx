"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSketchProcessing } from "@/hooks/useSketchProcessing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SketchMethod, SketchConfig, SketchFile } from "@/types";
import { toast } from "sonner";
import { FileUpload } from "./ui/file-upload";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Image as ImageIcon, 
  Sparkles, 
  Settings, 
  Loader2, 
  RefreshCw, 
  X, 
  ChevronRight,
  ChevronLeft,
  Share2,
  Maximize2,
  Minimize2,
  Info,
  Palette,
  Sliders
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AdvancedSketchify() {
  // State for sketch options
  const [sketchOptions, setSketchOptions] = useState<{
    method: SketchMethod;
    config?: SketchConfig;
  }>({
    method: SketchMethod.ADVANCED,
    config: {
      sigma_s: 60,
      sigma_r: 0.07,
      shade_factor: 0.05,
      kernel_size: 21,
      blur_type: "gaussian",
      edge_preserve: true,
      texture_enhance: true,
      contrast: 1.5,
      brightness: 0,
      smoothing_factor: 0.9,
    }
  });
  
  // State for UI
  const [activeTab, setActiveTab] = useState("upload");
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SketchFile | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [beforeAfterPosition, setBeforeAfterPosition] = useState(50);
  
  // Hook for sketch processing
  const { 
    batchProcessImages, 
    processImage, 
    files: sketchFiles, 
    processing: isProcessing, 
    progress: processingProgress,
    clearFiles 
  } = useSketchProcessing();
  
  // Handle sketch options change
  const handleOptionsChange = useCallback((options: Partial<{
    method: SketchMethod;
    config?: Partial<SketchConfig>;
  }>) => {
    setSketchOptions(prev => ({
      method: options.method ?? prev.method,
      config: options.config ? { ...prev.config, ...options.config } : prev.config
    }));
  }, []);
  
  // Handle upload complete and process images
  const handleUploadComplete = useCallback(async (fileKeys: string[]) => {
    if (fileKeys.length === 0) {
      toast.error("No files uploaded");
      return;
    }
    
    try {
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
          // Progress is handled by the hook
        },
      });
      
      toast.success(`Successfully processed ${fileKeys.length} images`);
      
      // Switch to results tab
      setActiveTab("results");
    } catch (error: any) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files", error.detail);
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
  
  // Handle download
  const handleDownload = useCallback((file: SketchFile) => {
    if (!file.sketchUrl) {
      toast.error("No sketch URL available");
      return;
    }
    
    const link = document.createElement("a");
    link.href = file.sketchUrl;
    link.download = `sketch_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download started");
  }, []);
  
  // Handle share
  const handleShare = useCallback(async (file: SketchFile) => {
    if (!file.sketchUrl) {
      toast.error("No sketch URL available");
      return;
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Sketch of ${file.name}`,
          text: "Check out this amazing sketch created with ImageToSketch!",
          url: file.sketchUrl,
        });
      } else {
        await navigator.clipboard.writeText(file.sketchUrl);
        toast.success("URL copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    }
  }, []);
  
  // Handle view image in fullscreen
  const handleViewImage = useCallback((file: SketchFile) => {
    setSelectedFile(file);
    setFullscreen(true);
  }, []);
  
  // Calculate overall progress
  const overallProgress = isProcessing ? 
    processingProgress : 
    sketchFiles.length > 0 ? 100 : 0;
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  return (
    <div className={cn(
      "w-full transition-all duration-300",
      fullscreen ? "fixed inset-0 z-50 bg-background p-4" : "relative"
    )}>
      {/* Fullscreen Controls */}
      {fullscreen && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setFullscreen(false)}
            className="rounded-full bg-background/80 backdrop-blur-sm"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedFile(null)}
            className="rounded-full bg-background/80 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Fullscreen Image View */}
      {fullscreen && selectedFile && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            {showBeforeAfter && selectedFile.sketchUrl ? (
              <div className="relative w-full h-full overflow-hidden">
                {/* Original Image (if available) */}
                <img 
                  src={selectedFile.sketchUrl} 
                  alt={`Sketch of ${selectedFile.name}`}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                
                {/* Slider Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64">
                  <Slider
                    value={[beforeAfterPosition]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setBeforeAfterPosition(value[0])}
                    className="z-20"
                  />
                </div>
              </div>
            ) : (
              <img 
                src={selectedFile.sketchUrl} 
                alt={`Sketch of ${selectedFile.name}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
            
            {/* Image Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDownload(selectedFile)}
                className="rounded-full bg-background/80 backdrop-blur-sm"
                disabled={!selectedFile.sketchUrl}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleShare(selectedFile)}
                className="rounded-full bg-background/80 backdrop-blur-sm"
                disabled={!selectedFile.sketchUrl}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Interface */}
      {!fullscreen && (
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 shadow-xl bg-background/70 backdrop-blur-sm">
            <CardContent className="w-full flex items-center justify-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center items-center p-4 border-b">
                  <TabsList className="grid grid-cols-3 px-4 py-2">
                    <TabsTrigger value="upload" className="rounded-full py-2 px-4">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="options" className="rounded-full py-2 px-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Options
                    </TabsTrigger>
                    <TabsTrigger value="results" className="rounded-full py-2 px-4" disabled={sketchFiles.length === 0}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Results
                      {sketchFiles.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {sketchFiles.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="upload" className="p-6 focus:outline-none">
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-xl font-semibold">Upload Images</h3>
                      <p className="text-muted-foreground">
                        Upload your photos to transform them into beautiful sketches
                      </p>
                    </div>
                    
                    <FileUpload
                      onUploadComplete={handleUploadComplete}
                      maxFiles={10}
                      maxSize={10 * 1024 * 1024} // 10MB
                      accept={{
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png'],
                        'image/webp': ['.webp'],
                      }}
                      prefix="sketches"
                      isPublic={true}
                      metadata={{
                        purpose: "sketch-processing",
                        uploadedAt: new Date().toISOString(),
                      }}
                      showFileList={true}
                      autoUpload={false}
                      description="Upload images to convert to sketches. Maximum file size: 10MB. Accepted formats: JPG, PNG, WEBP"
                    />
                    
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Processing Images</span>
                          <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                        </div>
                        <Progress value={processingProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="options" className="p-6 focus:outline-none">
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-xl font-semibold">Sketch Options</h3>
                      <p className="text-muted-foreground">
                        Customize how your sketches will look
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Sketch Method */}
                      <div className="space-y-2">
                        <Label>Sketch Method</Label>
                        <Select
                          value={sketchOptions.method}
                          onValueChange={(value) => handleOptionsChange({ method: value as SketchMethod })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a sketch method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SketchMethod.BASIC}>
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                                Basic
                              </div>
                            </SelectItem>
                            <SelectItem value={SketchMethod.ADVANCED}>
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-primary/50 mr-2"></div>
                                Advanced
                              </div>
                            </SelectItem>
                            <SelectItem value={SketchMethod.ARTISTIC}>
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-primary/80 mr-2"></div>
                                Artistic
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose the sketch style you prefer. Advanced and Artistic methods provide more realistic results.
                        </p>
                      </div>
                      
                      {/* Advanced Options */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium flex items-center">
                            <Sliders className="h-4 w-4 mr-2" />
                            Advanced Settings
                          </h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Fine-tune your sketch appearance</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        {/* Contrast */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Contrast</Label>
                            <span className="text-xs text-muted-foreground">
                              {sketchOptions.config?.contrast?.toFixed(1)}
                            </span>
                          </div>
                          <Slider
                            value={[sketchOptions.config?.contrast || 1.5]}
                            min={0.5}
                            max={3}
                            step={0.1}
                            onValueChange={(values) => 
                              handleOptionsChange({ config: { contrast: values[0] } })
                            }
                          />
                        </div>
                        
                        {/* Shade Factor */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Shade Intensity</Label>
                            <span className="text-xs text-muted-foreground">
                              {sketchOptions.config?.shade_factor?.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[sketchOptions.config?.shade_factor || 0.05]}
                            min={0.01}
                            max={0.5}
                            step={0.01}
                            onValueChange={(values) => 
                              handleOptionsChange({ config: { shade_factor: values[0] } })
                            }
                          />
                        </div>
                        
                        {/* Smoothing Factor */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Smoothing</Label>
                            <span className="text-xs text-muted-foreground">
                              {sketchOptions.config?.smoothing_factor?.toFixed(1)}
                            </span>
                          </div>
                          <Slider
                            value={[sketchOptions.config?.smoothing_factor || 0.9]}
                            min={0}
                            max={1}
                            step={0.1}
                            onValueChange={(values) => 
                              handleOptionsChange({ config: { smoothing_factor: values[0] } })
                            }
                          />
                        </div>
                        
                        {/* Edge Preservation */}
                        <div className="flex items-center justify-between space-x-2">
                          <div>
                            <Label>Edge Preservation</Label>
                            <p className="text-xs text-muted-foreground">
                              Preserve edges for more natural-looking sketches
                            </p>
                          </div>
                          <Switch
                            checked={sketchOptions.config?.edge_preserve}
                            onCheckedChange={(checked) => 
                              handleOptionsChange({ config: { edge_preserve: checked } })
                            }
                          />
                        </div>
                        
                        {/* Texture Enhancement */}
                        <div className="flex items-center justify-between space-x-2">
                          <div>
                            <Label>Texture Enhancement</Label>
                            <p className="text-xs text-muted-foreground">
                              Enhance texture details in the sketch
                            </p>
                          </div>
                          <Switch
                            checked={sketchOptions.config?.texture_enhance}
                            onCheckedChange={(checked) => 
                              handleOptionsChange({ config: { texture_enhance: checked } })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="results" className="focus:outline-none">
                  {sketchFiles.length > 0 ? (
                    <div className="p-6 space-y-6">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold">Results</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFiles}
                            disabled={isProcessing}
                          >
                            Clear All
                          </Button>
                        </div>
                        <p className="text-muted-foreground">
                          Your processed sketch images
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                          {sketchFiles.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Card className="overflow-hidden h-full flex flex-col">
                                <div className="aspect-square relative bg-muted cursor-pointer" onClick={() => handleViewImage(file)}>
                                  {file.status === "completed" && file.sketchUrl ? (
                                    <>
                                      <img
                                        src={file.sketchUrl}
                                        alt={`Sketch of ${file.name}`}
                                        className="object-cover w-full h-full"
                                      />
                                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                        <Maximize2 className="h-6 w-6 text-white" />
                                      </div>
                                    </>
                                  ) : file.status === "processing" ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                      <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
                                    </div>
                                  ) : file.status === "failed" ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <div className="rounded-full bg-red-100 p-3">
                                        <X className="h-6 w-6 text-red-500" />
                                      </div>
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
                                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <h4 className="font-medium truncate" title={file.name}>
                                          {file.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          {formatFileSize(file.size)} • {file.method}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-4">
                                    <Badge variant={
                                      file.status === "completed" ? "default" :
                                      file.status === "processing" ? "secondary" :
                                      file.status === "failed" ? "destructive" : "outline"
                                    }>
                                      {file.status === "completed" ? "Completed" :
                                       file.status === "processing" ? "Processing" :
                                       file.status === "failed" ? "Failed" : "Pending"}
                                    </Badge>
                                    
                                    <div className="flex gap-2">
                                      {file.status === "completed" && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleDownload(file)}
                                          title="Download sketch"
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {file.status === "failed" && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleRetry(file.id)}
                                          title="Retry processing"
                                        >
                                          <RefreshCw className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {file.status === "completed" && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleShare(file)}
                                          title="Share sketch"
                                        >
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12">
                      <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <ImageIcon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No results yet</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Upload and process some images to see your sketches here
                      </p>
                      <Button onClick={() => setActiveTab("upload")}>
                        Upload Images
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          {!isProcessing && sketchFiles.length > 0 && activeTab !== "results" && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab("results")}
                className="gap-2"
              >
                View Results
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Badge variants
declare module "@/components/ui/badge" {
  interface BadgeVariants {
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
  }
}
