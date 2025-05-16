import { api } from './axios';

interface PresignedUrlResponse {
  url: string;
  key: string;
  expires_at: string;
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (data: { key: string }) => void;
}

/**
 * Get a presigned URL for uploading a file to S3
 */
export const getPresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  prefix?: string,
  isPublic: boolean = false
): Promise<PresignedUrlResponse> => {
  try {
    const response = await api.post('/file/presigned-upload-url', {
      file_name: fileName,
      file_type: fileType,
      prefix,
      is_public: isPublic
    });
    return response.data;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
};

/**
 * Upload a file directly to S3 using a presigned URL
 */
export const uploadFileWithPresignedUrl = async (
  file: File,
  presignedUrl: string,
  options: UploadOptions = {}
): Promise<boolean> => {
  const { onProgress, onError, onSuccess } = options;
  
  try {
    // Create a new XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }
    
    // Create a promise to handle the upload
    return await new Promise((resolve, reject) => {
      xhr.open('PUT', presignedUrl);
      
      // Set the content type
      xhr.setRequestHeader('Content-Type', file.type);
      
      // Handle success
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onSuccess) {
            onSuccess({ key: presignedUrl.split('?')[0] });
          }
          resolve(true);
        } else {
          const error = new Error(`Upload failed with status ${xhr.status}`);
          if (onError) {
            onError(error);
          }
          reject(error);
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        const error = new Error('Network error occurred during upload');
        if (onError) {
          onError(error);
        }
        reject(error);
      };
      
      // Send the file
      xhr.send(file);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
};

/**
 * Complete file upload process - get presigned URL and upload file
 */
export const uploadFile = async (
  file: File,
  prefix?: string,
  isPublic: boolean = false,
  options: UploadOptions = {}
): Promise<string> => {
  try {
    // Get presigned URL
    const presignedData = await getPresignedUploadUrl(
      file.name,
      file.type,
      prefix,
      isPublic
    );
    
    // Upload file using presigned URL
    await uploadFileWithPresignedUrl(file, presignedData.url, options);
    
    // Confirm upload with backend (optional)
    await api.post('/file/confirm-upload', {
      key: presignedData.key
    });
    
    return presignedData.key;
  } catch (error) {
    console.error('Error in upload process:', error);
    throw error;
  }
};
