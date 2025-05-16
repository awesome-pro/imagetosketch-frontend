import api from "@/lib/axios";

// src/services/fileUploadService.ts
interface PresignedUrlResponse {
    presigned_url: string;
    object_key: string;
    file_url: string;
  }
  
  interface UploadRequestParams {
    filename: string;
    contentType: string;
    folder?: string;
  }
  
  /**
   * Get a pre-signed URL from the backend API
   */
  export async function getPresignedUrl(params: UploadRequestParams): Promise<PresignedUrlResponse> {
    const response = await api.post<PresignedUrlResponse>(`/get-upload-url`, {
      filename: params.filename,
      content_type: params.contentType,
      folder: params.folder,
    });
  
    return response.data;
  }
  
  /**
 * Upload a file to S3 using a pre-signed URL
 */
export async function uploadFileToS3(
    file: File, 
    presignedUrl: string
  ): Promise<boolean> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
  
    return response.ok;
  }
  
  /**
   * Complete file upload process: get URL and upload file
   */
  export async function uploadFile(
    file: File, 
    folder?: string
  ): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
    try {
      // Get pre-signed URL
      const presignedData = await getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        folder,
      });
  
      debugger;
      // Upload to S3
      const uploadSuccess = await uploadFileToS3(file, presignedData.presigned_url);
  
      if (uploadSuccess) {
        return {
          success: true,
          fileUrl: presignedData.file_url,
        };
      } else {
        return {
          success: false,
          error: 'Failed to upload file to S3',
        };
      }
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }