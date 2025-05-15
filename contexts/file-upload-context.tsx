"use client";

import React, { createContext, useContext, useState, useReducer, useCallback } from 'react';

// Types
export interface FileUploadState {
  files: Map<string, File>;
  progress: Map<string, number>;
  uploads: Map<string, {
    key: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    etag?: string;
    url?: string;
  }>;
  isUploading: boolean;
}

type FileUploadAction = 
  | { type: 'ADD_FILES'; files: File[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'CLEAR_FILES' }
  | { type: 'SET_PROGRESS'; fileId: string; progress: number }
  | { type: 'SET_UPLOAD_STATUS'; fileId: string; status: 'pending' | 'uploading' | 'success' | 'error'; key?: string; error?: string; etag?: string }
  | { type: 'SET_UPLOADING'; isUploading: boolean }
  | { type: 'SET_FILE_URL'; fileId: string; url: string };

interface FileUploadContextType extends FileUploadState {
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  setProgress: (fileId: string, progress: number) => void;
  setUploadStatus: (fileId: string, status: 'pending' | 'uploading' | 'success' | 'error', key?: string, error?: string, etag?: string) => void;
  setUploading: (isUploading: boolean) => void;
  setFileUrl: (fileId: string, url: string) => void;
  getFileById: (fileId: string) => File | undefined;
  getUploadById: (fileId: string) => { key: string; status: string; error?: string; etag?: string; url?: string } | undefined;
}

// Initial state
const initialState: FileUploadState = {
  files: new Map(),
  progress: new Map(),
  uploads: new Map(),
  isUploading: false,
};

// Reducer
function fileUploadReducer(state: FileUploadState, action: FileUploadAction): FileUploadState {
  switch (action.type) {
    case 'ADD_FILES': {
      const newFiles = new Map(state.files);
      const newProgress = new Map(state.progress);
      const newUploads = new Map(state.uploads);
      
      action.files.forEach(file => {
        // Check if this file already exists in the map (by name and size)
        const existingFileId = Array.from(newFiles.entries()).find(
          ([_, existingFile]) => 
            existingFile.name === file.name && 
            existingFile.size === file.size
        )?.[0];
        
        // If file already exists, don't add it again
        if (existingFileId) {
          return;
        }
        
        // Add new file with unique ID
        const fileId = `${file.name}-${file.size}-${Date.now()}`;
        newFiles.set(fileId, file);
        newProgress.set(fileId, 0);
        newUploads.set(fileId, { key: '', status: 'pending' });
      });
      
      return {
        ...state,
        files: newFiles,
        progress: newProgress,
        uploads: newUploads,
      };
    }
    
    case 'REMOVE_FILE': {
      const newFiles = new Map(state.files);
      const newProgress = new Map(state.progress);
      const newUploads = new Map(state.uploads);
      
      newFiles.delete(action.fileId);
      newProgress.delete(action.fileId);
      newUploads.delete(action.fileId);
      
      return {
        ...state,
        files: newFiles,
        progress: newProgress,
        uploads: newUploads,
      };
    }
    
    case 'CLEAR_FILES':
      return {
        ...state,
        files: new Map(),
        progress: new Map(),
        uploads: new Map(),
        isUploading: false,
      };
    
    case 'SET_PROGRESS': {
      const newProgress = new Map(state.progress);
      newProgress.set(action.fileId, action.progress);
      
      return {
        ...state,
        progress: newProgress,
      };
    }
    
    case 'SET_UPLOAD_STATUS': {
      const newUploads = new Map(state.uploads);
      const currentUpload = newUploads.get(action.fileId) || { key: '', status: 'pending' };
      
      newUploads.set(action.fileId, {
        ...currentUpload,
        status: action.status,
        key: action.key || currentUpload.key,
        error: action.error,
        etag: action.etag,
      });
      
      return {
        ...state,
        uploads: newUploads,
      };
    }
    
    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.isUploading,
      };
    
    case 'SET_FILE_URL': {
      const newUploads = new Map(state.uploads);
      const currentUpload = newUploads.get(action.fileId);
      
      if (currentUpload) {
        newUploads.set(action.fileId, {
          ...currentUpload,
          url: action.url,
        });
      }
      
      return {
        ...state,
        uploads: newUploads,
      };
    }
    
    default:
      return state;
  }
}

// Create context
const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

// Provider component
export function FileUploadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(fileUploadReducer, initialState);
  
  const addFiles = useCallback((files: File[]) => {
    dispatch({ type: 'ADD_FILES', files });
  }, []);
  
  const removeFile = useCallback((fileId: string) => {
    dispatch({ type: 'REMOVE_FILE', fileId });
  }, []);
  
  const clearFiles = useCallback(() => {
    dispatch({ type: 'CLEAR_FILES' });
  }, []);
  
  const setProgress = useCallback((fileId: string, progress: number) => {
    dispatch({ type: 'SET_PROGRESS', fileId, progress });
  }, []);
  
  const setUploadStatus = useCallback((fileId: string, status: 'pending' | 'uploading' | 'success' | 'error', key?: string, error?: string, etag?: string) => {
    dispatch({ type: 'SET_UPLOAD_STATUS', fileId, status, key, error, etag });
  }, []);
  
  const setUploading = useCallback((isUploading: boolean) => {
    dispatch({ type: 'SET_UPLOADING', isUploading });
  }, []);
  
  const setFileUrl = useCallback((fileId: string, url: string) => {
    dispatch({ type: 'SET_FILE_URL', fileId, url });
  }, []);
  
  const getFileById = useCallback((fileId: string) => {
    return state.files.get(fileId);
  }, [state.files]);
  
  const getUploadById = useCallback((fileId: string) => {
    return state.uploads.get(fileId);
  }, [state.uploads]);
  
  const value = {
    ...state,
    addFiles,
    removeFile,
    clearFiles,
    setProgress,
    setUploadStatus,
    setUploading,
    setFileUrl,
    getFileById,
    getUploadById,
  };
  
  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
}

// Hook for using the context
export function useFileUpload() {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
}
