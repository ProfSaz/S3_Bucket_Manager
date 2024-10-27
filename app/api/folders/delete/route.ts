// app/api/delete/route.ts
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

    const { path, isFolder } = await request.json();
    const bucket = process.env.AWS_BUCKET_NAME.replace(/\/$/, '');

    if (isFolder) {
      // List all objects in folder
      const listParams = {
        Bucket: bucket,
        Prefix: path
      };

      const listedObjects = await s3.listObjects(listParams).promise();

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        // Delete all objects in folder
        const deleteParams = {
          Bucket: bucket,
          Delete: {
            Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key! }))
          }
        };

        await s3.deleteObjects(deleteParams).promise();
      }
    } else {
      // Delete single file
      const deleteParams = {
        Bucket: bucket,
        Key: path
      };

      await s3.deleteObject(deleteParams).promise();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${isFolder ? 'folder' : 'file'}`
    });
    
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}