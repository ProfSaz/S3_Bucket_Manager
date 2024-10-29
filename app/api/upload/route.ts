import { NextResponse, NextRequest } from 'next/server';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderPath = formData.get('folderPath') as string;

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const normalizedPath = `${folderPath.replace(/\/*$/, '')}/`;
        const fileName = `${normalizedPath}${file.name.replace(/\s/g, '_')}`;

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        };

        const uploadResult = await s3.upload(params).promise();
        console.log('Uploaded image URL:', uploadResult.Location);
        return {
          originalName: file.name,
          url: uploadResult.Location,
          folder: normalizedPath,
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: uploadResults,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
