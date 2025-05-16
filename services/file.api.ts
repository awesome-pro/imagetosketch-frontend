import api from "@/lib/axios";

// Upload URL interfaces
export interface GetPresignedUploadUrlInput {
    file_name: string;
    prefix?: string;
    file_type?: string;
    is_public?: boolean;
    metadata?: Record<string, string>;
}
    
export interface ConfirmFileUploadInput {
    key: string;
    etag?: string;
}

export interface ConfirmFileUploadResponse {
    key: string;
    success: boolean;
    file_info: {
        key: string;
        size: number;
        etag: string;
    };
    error: string;
}

export interface GetPresignedUploadUrlResponse {
    presigned_url: string;
    key: string;
    file_url: string;
    expires_in: number;
}

// Sketch processing interfaces
export interface ProcessImageInput {
    input_key: string;
    method?: 'basic' | 'advanced' | 'artistic';
    config?: Record<string, any>;
}

export interface ProcessImageResponse {
    success: boolean;
    input_key?: string;
    output_key?: string;
    method?: string;
    download_url?: string;
    error?: string;
}

export interface BatchProcessInput {
    input_keys: string[];
    method?: 'basic' | 'advanced' | 'artistic';
    config?: Record<string, any>;
    max_concurrency?: number;
}

export interface BatchProcessResponse {
    success: boolean;
    total: number;
    successful: number;
    failed: number;
    results: ProcessImageResponse[];
}

export const fileApi = {
    // File upload endpoints
    getPresignedUploadUrl: async (input: GetPresignedUploadUrlInput) => {
        // Ensure content type is always provided
        const payload = {
            ...input,
            file_type: input.file_type || 'application/octet-stream'
        };
        return api.post<GetPresignedUploadUrlResponse>(`/file/presigned-upload-url`, payload);
    },

    confirmFileUpload: async (input: ConfirmFileUploadInput) => {
        return api.post<ConfirmFileUploadResponse>(`/file/confirm-upload`, input);
    },
    
    // Sketch processing endpoints
    processImage: async (input: ProcessImageInput) => {
        return api.post<ProcessImageResponse>(`/file/process`, input);
    },
    
    batchProcessImages: async (input: BatchProcessInput) => {
        return api.post<BatchProcessResponse>(`/file/batch-process`, input);
    },
    
    getDownloadUrl: async (key: string, expiresIn?: number) => {
        const params = expiresIn ? `?expires_in=${expiresIn}` : '';
        return api.get<{url: string, key: string}>(`/file/download-url/${key}${params}`);
    }
}