import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  private readonly s3: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET as string;

  constructor(private readonly prisma: PrismaService) {
    this.s3 = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: 'us-east-1', // required by the SDK, meaningless for MinIO — any value works
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY as string,
        secretAccessKey: process.env.MINIO_SECRET_KEY as string,
      },
      forcePathStyle: true, // required for MinIO — S3 uses subdomains, MinIO uses path-style URLs
    });
  }

  async upload(uploadedBy: string, file: Express.Multer.File) {
    const storageKey = `${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return this.prisma.file.create({
      data: {
        uploadedBy,
        bucket: this.bucket,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });
  }

  async getDownloadUrl(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: file.bucket, Key: file.storageKey }),
      { expiresIn: 300 }, // link works for 5 minutes, then expires
    );

    return { url, originalName: file.originalName };
  }
}