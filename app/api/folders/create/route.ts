import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION!,
});

export async function POST(request: Request) {
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS bucket name is not configured');
    }
    
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS access key not recognised');
    }

    const { folderPath } = await request.json();
    
    // Ensure the folder path ends with a forward slash
    const normalizedPath = folderPath.endsWith('/')
      ? folderPath
      : `${folderPath}/`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME.replace(/\/$/, ''),
      Key: normalizedPath,
      Body: '',
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      folderPath: normalizedPath,
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}