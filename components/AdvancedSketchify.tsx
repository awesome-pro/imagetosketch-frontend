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
  Sliders,
  CheckCircle,
  Eye
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
      "w-full transition-all duration-500 ease-out",
      fullscreen ? "fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4" : "relative"
    )}>
      {/* Fullscreen Controls */}
      {fullscreen && (
        <motion.div 
          className="absolute top-4 right-4 z-10 flex gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setFullscreen(false)}
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Minimize2 className="h-4 w-4 text-white" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedFile(null)}
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </motion.div>
      )}
      
      {/* Fullscreen Image View */}
      {fullscreen && selectedFile && (
        <motion.div 
          className="h-full w-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="relative max-w-full max-h-full">
            {showBeforeAfter && selectedFile.sketchUrl ? (
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
                {/* Original Image (if available) */}
                <motion.img 
                  src={selectedFile.sketchUrl} 
                  alt={`Sketch of ${selectedFile.name}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Slider Controls */}
                <motion.div 
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20">
                    <Slider
                      value={[beforeAfterPosition]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setBeforeAfterPosition(value[0])}
                      className="z-20"
                    />
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.img 
                src={selectedFile.sketchUrl} 
                alt={`Sketch of ${selectedFile.name}`}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
            
            {/* Image Controls */}
            <motion.div 
              className="absolute bottom-4 right-4 flex gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDownload(selectedFile)}
                className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
                disabled={!selectedFile.sketchUrl}
              >
                <Download className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleShare(selectedFile)}
                className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
                disabled={!selectedFile.sketchUrl}
              >
                <Share2 className="h-4 w-4 text-white" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Main Interface */}
      {!fullscreen && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            <CardContent className="w-full flex items-center justify-center p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <motion.div 
                  className="flex justify-center items-center p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TabsList className="grid grid-cols-3 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <TabsTrigger value="upload" className="rounded-xl py-3 px-6 font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="options" className="rounded-xl py-3 px-6 font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                      <Settings className="h-4 w-4 mr-2" />
                      Options
                    </TabsTrigger>
                    <TabsTrigger 
                      value="results" 
                      className="rounded-xl py-3 px-6 font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg disabled:opacity-50" 
                      disabled={sketchFiles.length === 0}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Results
                      {sketchFiles.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Badge variant="secondary" className="ml-2 bg-white/20 text-current border-0">
                            {sketchFiles.length}
                          </Badge>
                        </motion.div>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </motion.div>
                
                <TabsContent value="upload" className="p-8 focus:outline-none">
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="text-center space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                        Upload Your Images
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                        Upload your photos and watch our AI transform them into stunning pencil sketches, charcoal drawings, and artistic renderings.
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
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
                        description="Drag & drop your images or click to browse. Maximum file size: 10MB. Accepted formats: JPG, PNG, WEBP"
                      />
                    </motion.div>
                    
                    {isProcessing && (
                      <motion.div 
                        className="space-y-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Processing Images</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary">{processingProgress}%</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Complete</p>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={processingProgress} className="h-3 bg-white/50 dark:bg-slate-800/50" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="options" className="p-8 focus:outline-none">
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="text-center space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center">
                          <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                        Customize Your Art
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                        Fine-tune the artistic style and parameters to create the perfect sketch that matches your vision.
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Sketch Method */}
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center space-x-2">
                          <Palette className="w-5 h-5 text-primary" />
                          <Label className="text-lg font-semibold">Artistic Style</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { 
                              value: SketchMethod.BASIC, 
                              label: 'Basic Sketch', 
                              description: 'Clean line art with minimal shading',
                              gradient: 'from-blue-500/20 to-blue-500/5'
                            },
                            { 
                              value: SketchMethod.ADVANCED, 
                              label: 'Advanced Sketch', 
                              description: 'Detailed pencil work with rich textures',
                              gradient: 'from-purple-500/20 to-purple-500/5'
                            },
                            { 
                              value: SketchMethod.ARTISTIC, 
                              label: 'Artistic Drawing', 
                              description: 'Professional-grade charcoal style',
                              gradient: 'from-amber-500/20 to-amber-500/5'
                            }
                          ].map((method, index) => (
                            <motion.div
                              key={method.value}
                              className={cn(
                                "relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                `bg-gradient-to-br ${method.gradient}`,
                                sketchOptions.method === method.value
                                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                                  : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
                              )}
                              onClick={() => handleOptionsChange({ method: method.value as SketchMethod })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={cn(
                                  "w-4 h-4 rounded-full",
                                  sketchOptions.method === method.value ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                                )} />
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{method.label}</h4>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {method.description}
                              </p>
                              {sketchOptions.method === method.value && (
                                <motion.div
                                  className="absolute top-2 right-2"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <CheckCircle className="w-5 h-5 text-primary" />
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                      
                      {/* Advanced Options */}
                      <motion.div 
                        className="space-y-6 p-6 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600/20 to-slate-600/10 rounded-xl flex items-center justify-center">
                              <Sliders className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Fine-Tune Settings</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Adjust parameters for perfect results</p>
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <Info className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adjust these settings to fine-tune your sketch appearance</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Contrast */}
                          <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="flex justify-between items-center">
                              <Label className="font-medium">Contrast</Label>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {sketchOptions.config?.contrast?.toFixed(1)}
                              </Badge>
                            </div>
                            <Slider
                              value={[sketchOptions.config?.contrast || 1.5]}
                              min={0.5}
                              max={3}
                              step={0.1}
                              onValueChange={(values) => 
                                handleOptionsChange({ config: { contrast: values[0] } })
                              }
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Adjust the contrast between light and dark areas
                            </p>
                          </motion.div>
                          
                          {/* Shade Factor */}
                          <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 }}
                          >
                            <div className="flex justify-between items-center">
                              <Label className="font-medium">Shade Intensity</Label>
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                {sketchOptions.config?.shade_factor?.toFixed(2)}
                              </Badge>
                            </div>
                            <Slider
                              value={[sketchOptions.config?.shade_factor || 0.05]}
                              min={0.01}
                              max={0.5}
                              step={0.01}
                              onValueChange={(values) => 
                                handleOptionsChange({ config: { shade_factor: values[0] } })
                              }
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Control the intensity of shadowing effects
                            </p>
                          </motion.div>
                          
                          {/* Smoothing Factor */}
                          <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <div className="flex justify-between items-center">
                              <Label className="font-medium">Smoothing</Label>
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                                {sketchOptions.config?.smoothing_factor?.toFixed(1)}
                              </Badge>
                            </div>
                            <Slider
                              value={[sketchOptions.config?.smoothing_factor || 0.9]}
                              min={0}
                              max={1}
                              step={0.1}
                              onValueChange={(values) => 
                                handleOptionsChange({ config: { smoothing_factor: values[0] } })
                              }
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Smooth out rough edges and noise
                            </p>
                          </motion.div>

                          {/* Brightness */}
                          <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 }}
                          >
                            <div className="flex justify-between items-center">
                              <Label className="font-medium">Brightness</Label>
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                {sketchOptions.config?.brightness?.toFixed(1) || '0.0'}
                              </Badge>
                            </div>
                            <Slider
                              value={[sketchOptions.config?.brightness || 0]}
                              min={-1}
                              max={1}
                              step={0.1}
                              onValueChange={(values) => 
                                handleOptionsChange({ config: { brightness: values[0] } })
                              }
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Adjust overall brightness of the sketch
                            </p>
                          </motion.div>
                        </div>
                        
                        {/* Toggle Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <motion.div 
                            className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <Label className="font-medium">Edge Preservation</Label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Keep sharp edges intact
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={sketchOptions.config?.edge_preserve}
                              onCheckedChange={(checked) => 
                                handleOptionsChange({ config: { edge_preserve: checked } })
                              }
                            />
                          </motion.div>
                          
                          <motion.div 
                            className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div>
                                <Label className="font-medium">Texture Enhancement</Label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Enhance fine details
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={sketchOptions.config?.texture_enhance}
                              onCheckedChange={(checked) => 
                                handleOptionsChange({ config: { texture_enhance: checked } })
                              }
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="results" className="focus:outline-none">
                  {sketchFiles.length > 0 ? (
                    <motion.div 
                      className="p-8 space-y-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className="flex flex-col space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                                Your Masterpieces
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300">
                                {sketchFiles.filter(f => f.status === 'completed').length} of {sketchFiles.length} sketches completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const completedFiles = sketchFiles.filter(f => f.status === 'completed');
                                completedFiles.forEach(file => handleDownload(file));
                              }}
                              disabled={isProcessing || sketchFiles.filter(f => f.status === 'completed').length === 0}
                              className="rounded-xl"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFiles}
                              disabled={isProcessing}
                              className="rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Clear All
                            </Button>
                          </div>
                        </div>
                        
                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/30">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {sketchFiles.filter(f => f.status === 'completed').length}
                            </div>
                            <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Completed</div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl p-3 border border-yellow-200/50 dark:border-yellow-700/30">
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              {sketchFiles.filter(f => f.status === 'processing').length}
                            </div>
                            <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Processing</div>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl p-3 border border-red-200/50 dark:border-red-700/30">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {sketchFiles.filter(f => f.status === 'failed').length}
                            </div>
                            <div className="text-xs text-red-600/70 dark:text-red-400/70">Failed</div>
                          </div>
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl p-3 border border-slate-200/50 dark:border-slate-600/30">
                            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                              {sketchFiles.length}
                            </div>
                            <div className="text-xs text-slate-600/70 dark:text-slate-400/70">Total</div>
                          </div>
                        </div>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                          {sketchFiles.map((file, index) => (
                            <motion.div
                              key={file.id}
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, y: -20 }}
                              transition={{ 
                                duration: 0.4, 
                                delay: index * 0.1,
                                layout: { duration: 0.3 }
                              }}
                              whileHover={{ y: -8 }}
                              className="group"
                            >
                              <Card className="overflow-hidden h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ring-1 ring-slate-200/50 dark:ring-slate-700/50 group-hover:ring-primary/30">
                                <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 cursor-pointer overflow-hidden" onClick={() => handleViewImage(file)}>
                                  {file.status === "completed" && file.sketchUrl ? (
                                    <>
                                      <motion.img
                                        src={file.sketchUrl}
                                        alt={`Sketch of ${file.name}`}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6 }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          whileHover={{ scale: 1 }}
                                          className="bg-white/20 backdrop-blur-md rounded-full p-3"
                                        >
                                          <Maximize2 className="h-6 w-6 text-white" />
                                        </motion.div>
                                      </div>
                                      <div className="absolute top-3 right-3">
                                        <Badge className="bg-green-500/90 text-white border-0 shadow-lg">
                                          Ready
                                        </Badge>
                                      </div>
                                    </>
                                  ) : file.status === "processing" ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
                                      />
                                      <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Creating Art...</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">Please wait</p>
                                    </div>
                                  ) : file.status === "failed" ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                      <motion.div 
                                        className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-3"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                      >
                                        <X className="h-8 w-8 text-red-500" />
                                      </motion.div>
                                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Processing Failed</p>
                                      {file.error && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                                          {file.error}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
                                          <ImageIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <CardContent className="p-5 flex-grow flex flex-col justify-between bg-white/50 dark:bg-slate-800/50">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1 flex-1">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2" title={file.name}>
                                          {file.name}
                                        </h4>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                          <span>{formatFileSize(file.size)}</span>
                                          <span>•</span>
                                          <Badge variant="outline" className="text-xs px-2 py-0">
                                            {file.method}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <Badge 
                                      variant={
                                        file.status === "completed" ? "default" :
                                        file.status === "processing" ? "secondary" :
                                        file.status === "failed" ? "destructive" : "outline"
                                      }
                                      className="capitalize"
                                    >
                                      {file.status === "completed" ? "✓ Completed" :
                                       file.status === "processing" ? "⏳ Processing" :
                                       file.status === "failed" ? "✗ Failed" : "⏸ Pending"}
                                    </Badge>
                                    
                                    <div className="flex gap-1">
                                      {file.status === "completed" && (
                                        <>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownload(file);
                                            }}
                                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                                            title="Download sketch"
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShare(file);
                                            }}
                                            className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-600"
                                            title="Share sketch"
                                          >
                                            <Share2 className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                      {file.status === "failed" && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRetry(file.id);
                                          }}
                                          className="h-8 w-8 rounded-lg hover:bg-green-500/10 hover:text-green-600"
                                          title="Retry processing"
                                        >
                                          <RefreshCw className="h-4 w-4" />
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
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex flex-col items-center justify-center p-16"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div 
                        className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                      >
                        <ImageIcon className="w-12 h-12 text-primary" />
                      </motion.div>
                      
                      <motion.div
                        className="text-center space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          Ready to Create Art?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                          Upload your favorite photos and watch our AI transform them into stunning sketches. 
                          Your artistic journey starts here.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                          <Button 
                            size="lg"
                            onClick={() => setActiveTab("upload")}
                            className="gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <ImageIcon className="w-5 h-5" />
                            Upload Images
                          </Button>
                          <Button 
                            size="lg"
                            variant="outline"
                            onClick={() => setActiveTab("options")}
                            className="gap-2 px-8 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                          >
                            <Settings className="w-5 h-5" />
                            Customize Settings
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          {!isProcessing && sketchFiles.length > 0 && activeTab !== "results" && (
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                size="lg"
                onClick={() => setActiveTab("results")}
                className="gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                View Your Sketches
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
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
