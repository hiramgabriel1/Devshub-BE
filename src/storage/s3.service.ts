import { Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client = new S3Client({
    region: process.env.AWS_REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  private get bucket() {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error('AWS_S3_BUCKET is required');
    return bucket;
  }

  /**
   * Create a photo upload URL
   * @param params - The parameters for the photo upload URL
   * @returns The photo upload URL
   */
  async createPhotoUploadUrl(params: { key: string; contentType: string; expiresInSec?: number }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn: params.expiresInSec ?? 300 });
  }

  /**
   * Create a photo read URL
   * @param params - The parameters for the photo read URL
   * @returns The photo read URL
   */
  async createPhotoReadUrl(params: { key: string; expiresInSec?: number }) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
    });

    return getSignedUrl(this.client, command, { expiresIn: params.expiresInSec ?? 300 });
  }
}

