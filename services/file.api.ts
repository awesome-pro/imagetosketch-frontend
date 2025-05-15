import api from "@/lib/axios";


export interface GetPresignedUploadUrlInput {
    fileName: string;
    prefix?: string;
    fileType?: string;
    isPublic?: boolean;
}
    
export interface ConfirmFileUploadInput {
    key: string;
    etag?: string;
}

export interface ConfirmFileUploadResponse {
    key: string;
    success: boolean;
    fileInfo: {
        key: string;
        size: number;
        etag: string;
    };
    error: string;
}

export interface GetPresignedUploadUrlResponse {
    url: string;
    key: string;
    expiresAt: Date;
}

export const fileApi = {
    getPresignedUploadUrl: async (input: GetPresignedUploadUrlInput) => {
        return api.post<GetPresignedUploadUrlResponse>(`/file/presigned-upload-url`, input);
    },

    confirmFileUpload: async (input: ConfirmFileUploadInput) => {
        return api.post<ConfirmFileUploadResponse>(`/file/confirm-upload`, input);
    }
}