import { NextResponse } from 'next/server';
import { 
  S3Client, 
  ListObjectsCommand, 
  DeleteObjectsCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';

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

    const { path, isFolder } = await request.json();
    const bucket = process.env.AWS_BUCKET_NAME.replace(/\/$/, '');

    if (isFolder) {
      // List all objects in folder
      const listCommand = new ListObjectsCommand({
        Bucket: bucket,
        Prefix: path,
      });

      const listedObjects = await s3Client.send(listCommand);

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        // Delete all objects in folder
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key! })),
          },
        });

        await s3Client.send(deleteCommand);
      }
    } else {
      // Delete single file
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      await s3Client.send(deleteCommand);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${isFolder ? 'folder' : 'file'}`,
    });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}