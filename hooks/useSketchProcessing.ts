import { useState, useCallback } from 'react';
import { fileApi } from '@/services/file.api';
import { SketchMethod, SketchConfig, SketchFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ProcessOptions {
  method?: SketchMethod;
  config?: SketchConfig;
  onProgress?: (progress: number) => void;
}

export const useSketchProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<SketchFile[]>([]);

  /**
   * Process a single image to convert it to a sketch
   */
  const processImage = useCallback(async (
    originalKey: string,
    fileName: string,
    fileSize: number,
    options: ProcessOptions = {}
  ): Promise<SketchFile> => {
    try {
      setProcessing(true);
      
      // Create a sketch file object
      const fileId = uuidv4();
      const sketchFile: SketchFile = {
        id: fileId,
        originalKey,
        name: fileName,
        size: fileSize,
        method: options.method || SketchMethod.ADVANCED,
        status: 'processing'
      };
      
      // Update files state
      setFiles(prevFiles => [...prevFiles, sketchFile]);
      
      // Process the image
      const { data } = await fileApi.processImage({
        input_key: originalKey,
        method: options.method,
        config: options.config
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      // Update the sketch file with the result
      const updatedFile: SketchFile = {
        ...sketchFile,
        sketchKey: data.output_key,
        sketchUrl: data.download_url,
        status: 'completed'
      };
      
      // Update files state
      setFiles(prevFiles => 
        prevFiles.map(file => file.id === fileId ? updatedFile : file)
      );
      
      return updatedFile;
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Update the sketch file with the error
      const errorFile: SketchFile = {
        id: uuidv4(),
        originalKey,
        name: fileName,
        size: fileSize,
        method: options.method || SketchMethod.ADVANCED,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      // Update files state
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.originalKey === originalKey ? errorFile : file
        )
      );
      
      return errorFile;
    } finally {
      setProcessing(false);
    }
  }, []);

  /**
   * Process multiple images in batch
   */
  const batchProcessImages = useCallback(async (
    uploadResults: Array<{key: string, size: number, name: string}>,
    options: ProcessOptions = {}
  ): Promise<SketchFile[]> => {
    try {
      if (!uploadResults.length) return [];
      
      setProcessing(true);
      setProgress(0);
      
      // Create sketch file objects for each image
      const pendingFiles: SketchFile[] = uploadResults.map(result => ({
        id: uuidv4(),
        originalKey: result.key,
        name: result.name,
        size: result.size,
        method: options.method || SketchMethod.ADVANCED,
        status: 'pending'
      }));
      
      // Update files state
      setFiles(prevFiles => [...prevFiles, ...pendingFiles]);
      
      // Extract input keys
      const inputKeys = uploadResults.map(result => result.key);
      
      // Process the images in batch
      const { data } = await fileApi.batchProcessImages({
        input_keys: inputKeys,
        method: options.method,
        config: options.config
      });
      
      if (!data.success) {
        throw new Error('Batch processing failed');
      }
      
      // Update progress
      setProgress(100);
      options.onProgress?.(100);
      
      // Map results to sketch files
      const processedFiles: SketchFile[] = data.results.map((result, index) => {
        const pendingFile = pendingFiles[index];
        
        if (result.success) {
          return {
            ...pendingFile,
            sketchKey: result.output_key,
            sketchUrl: result.download_url,
            status: 'completed'
          };
        } else {
          return {
            ...pendingFile,
            status: 'failed',
            error: result.error || 'Processing failed'
          };
        }
      });
      
      // Update files state
      setFiles(prevFiles => {
        const fileMap = new Map(prevFiles.map(file => [file.id, file]));
        
        // Update processed files
        processedFiles.forEach(file => {
          fileMap.set(file.id, file);
        });
        
        return Array.from(fileMap.values());
      });
      
      return processedFiles;
    } catch (error) {
      console.error('Error batch processing images:', error);
      
      // Mark all files as failed
      const failedFiles = uploadResults.map(result => ({
        id: uuidv4(),
        originalKey: result.key,
        name: result.name,
        size: result.size,
        method: options.method || SketchMethod.ADVANCED,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      
      // Update files state
      setFiles(prevFiles => {
        const nonFailedFiles = prevFiles.filter(file => 
          !uploadResults.some(result => result.key === file.originalKey)
        );
        return [...nonFailedFiles, ...failedFiles];
      });
      
      return failedFiles;
    } finally {
      setProcessing(false);
    }
  }, []);

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  /**
   * Remove a file by ID
   */
  const removeFile = useCallback((fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  }, []);

  return {
    processImage,
    batchProcessImages,
    clearFiles,
    removeFile,
    processing,
    progress,
    files
  };
};
