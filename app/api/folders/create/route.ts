// app/api/folders/create/route.ts
import { NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: Request) {
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS bucket name is not configured');
    }

    const { folderPath } = await request.json();
    
    // Ensure the folder path ends with a forward slash
    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME.replace(/\/$/, ''),
      Key: normalizedPath,
      Body: '' // Empty object to represent folder
    };

    await s3.putObject(params).promise();

    return NextResponse.json({ 
      success: true, 
      folderPath: normalizedPath 
    });
    
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}