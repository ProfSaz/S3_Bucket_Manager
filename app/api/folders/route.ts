// app/api/folders/route.ts
import { NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function GET(request: Request) {
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS bucket name is not configured');
    }

    // Get the prefix from query parameters
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME.replace(/\/$/, ''),
      Delimiter: '/',
      Prefix: prefix,
    };

    const data = await s3.listObjects(params).promise();

    // Process folders (CommonPrefixes)
    const folders =
      data.CommonPrefixes?.map((prefix) => {
        const folderPath = prefix.Prefix || '';
        const folderName = folderPath.split('/').slice(-2)[0]; // Get the last folder name
        return {
          path: folderPath,
          name: folderName || 'Root',
        };
      }) || [];

    // Process files
    const files =
      data.Contents?.filter((item) => (item.Key || '').slice(-1) !== '/') // Filter out folder markers
        .map((item) => ({
          key: item.Key || '',
          name: item.Key?.split('/').pop() || '',
          lastModified: item.LastModified,
          size: item.Size,
        })) || [];

    // Calculate breadcrumb trail
    const breadcrumbs = prefix
      .split('/')
      .filter(Boolean)
      .map((part, index, array) => ({
        name: part,
        path: array.slice(0, index + 1).join('/') + '/',
      }));

    return NextResponse.json({
      folders,
      files,
      currentPrefix: prefix,
      breadcrumbs: [{ name: 'Root', path: '' }, ...breadcrumbs],
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}
