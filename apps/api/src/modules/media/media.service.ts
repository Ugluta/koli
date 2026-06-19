import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}

@Injectable()
export class MediaService {
  private readonly endpoint: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private config: ConfigService) {
    this.endpoint = config.get('S3_ENDPOINT', 'http://localhost:9000');
    this.accessKey = config.get('S3_ACCESS_KEY', 'minioadmin');
    this.secretKey = config.get('S3_SECRET_KEY', 'minioadmin');
    this.bucket = config.get('S3_BUCKET', 'koli-media');
    this.region = config.get('S3_REGION', 'us-east-1');
  }

  async generatePresignedUpload(
    businessId: string,
    folder: string,
    originalFilename: string,
    mimeType: string,
  ): Promise<PresignedUploadResult> {
    const ext = originalFilename.split('.').pop() ?? 'bin';
    const fileKey = `${folder}/${businessId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const expiresIn = 300; // 5 minutes

    // Build presigned PUT URL (AWS Signature V4 compatible with MinIO/S3)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:-]/g, '').slice(0, 15) + 'Z';

    const host = new URL(this.endpoint).host;
    const credentialScope = `${dateStr}/${this.region}/s3/aws4_request`;
    const credential = `${this.accessKey}/${credentialScope}`;

    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': credential,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresIn),
      'X-Amz-SignedHeaders': 'host',
    });

    const canonicalRequest = [
      'PUT',
      `/${this.bucket}/${fileKey}`,
      queryParams.toString(),
      `host:${host}\n`,
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const signingKey = this.getSigningKey(dateStr);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    queryParams.append('X-Amz-Signature', signature);

    const uploadUrl = `${this.endpoint}/${this.bucket}/${fileKey}?${queryParams.toString()}`;
    const publicUrl = `${this.endpoint}/${this.bucket}/${fileKey}`;

    return { uploadUrl, fileKey, publicUrl, expiresIn };
  }

  private getSigningKey(dateStr: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(dateStr).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }
}
