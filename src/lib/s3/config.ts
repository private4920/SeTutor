import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3Client: S3Client | undefined;

/**
 * Get or create the S3 client singleton
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

/**
 * Get the S3 bucket name from environment
 */
export function getS3BucketName(): string {
  return process.env.S3_BUCKET_NAME || "setutor-documents";
}

/**
 * Generate a unique S3 key for a file
 * Format: userId/folderId/timestamp-originalFilename
 */
export function generateS3Key(
  userId: string,
  folderId: string,
  originalFilename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${folderId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Upload a file to S3
 * @param buffer - File content as Buffer
 * @param s3Key - The S3 key (path) for the file
 * @param contentType - MIME type of the file
 * @returns The S3 URL of the uploaded file
 */
export async function uploadFileToS3(
  buffer: Buffer,
  s3Key: string,
  contentType: string
): Promise<{ s3Key: string; s3Url: string }> {
  const client = getS3Client();
  const bucket = getS3BucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  // Construct the S3 URL
  const endpoint = process.env.S3_ENDPOINT || "";
  const s3Url = `${endpoint}/${bucket}/${s3Key}`;

  return { s3Key, s3Url };
}

/**
 * Generate a presigned URL for secure file access
 * @param s3Key - The S3 key of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL for secure access
 */
export async function generatePresignedUrl(
  s3Key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getS3Client();
  const bucket = getS3BucketName();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: s3Key,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn });
  return presignedUrl;
}

/**
 * Generate a presigned URL for file upload
 * @param s3Key - The S3 key where the file will be uploaded
 * @param contentType - MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 15 minutes)
 * @returns Presigned URL for upload
 */
export async function generateUploadPresignedUrl(
  s3Key: string,
  contentType: string,
  expiresIn: number = 900
): Promise<string> {
  const client = getS3Client();
  const bucket = getS3BucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn });
  return presignedUrl;
}

/**
 * Delete a file from S3
 * @param s3Key - The S3 key of the file to delete
 */
export async function deleteFileFromS3(s3Key: string): Promise<void> {
  const client = getS3Client();
  const bucket = getS3BucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: s3Key,
  });

  await client.send(command);
}

/**
 * Check if a file exists in S3
 * @param s3Key - The S3 key to check
 * @returns true if file exists, false otherwise
 */
export async function fileExistsInS3(s3Key: string): Promise<boolean> {
  const client = getS3Client();
  const bucket = getS3BucketName();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });
    await client.send(command);
    return true;
  } catch {
    // File doesn't exist or access denied
    return false;
  }
}

/**
 * Validate file for upload
 * @param file - File object with size and type
 * @returns Validation result with success flag and optional error message
 */
export function validateFileForUpload(file: {
  size: number;
  type: string;
  name: string;
}): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_MIME_TYPES = ["application/pdf"];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 50MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only PDF files are allowed. Received: ${file.type}`,
    };
  }

  // Check file extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf") {
    return {
      valid: false,
      error: `Invalid file extension. Only .pdf files are allowed.`,
    };
  }

  return { valid: true };
}

// Export constants for use in other modules
export const S3_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: ["application/pdf"],
  DEFAULT_PRESIGNED_URL_EXPIRY: 3600, // 1 hour
  DEFAULT_UPLOAD_URL_EXPIRY: 900, // 15 minutes
} as const;
