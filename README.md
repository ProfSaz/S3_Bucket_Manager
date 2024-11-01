# S3 Bucket UI Manager

A Nextjs web interface for managing AWS S3 buckets. This application provides an intuitive UI for uploading files, creating folders, and managing content in your S3 bucket with real-time progress tracking.

## Features

- `📁` Folder Navigation & Creation
- `📤` File & Folder Upload Support
- `🗑️` Delete Files & Folders
- `📊` Real-time Upload Progress
- `🔄` Breadcrumb Navigation
- `🔗` Direct URL Access to Uploaded Files

## Prerequisites

- Node.js (14.x or higher)
- AWS Account with S3 bucket
- AWS IAM user credentials with S3 access

## Setup

1. Clone the repository
```bash
git clone https://github.com/ProfSaz/S3_Bucket_Manager.git
```
2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables by creating a `.env.local` file:
```plaintext
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Required AWS S3 Bucket Policy

Ensure your S3 bucket has appropriate CORS configuration and bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*",
                "arn:aws:s3:::your-bucket-name"
            ]
        }
    ]
}
```

## Usage

- **Upload Files**: Click `"Select Files"` or drag & drop files
- **Upload Folders**: Click `"Select Folder"` to upload entire directory structures
- **Create Folders**: Click `"New Folder"` button and enter folder name
- **Navigate**: Use breadcrumb navigation or click folders to browse
- **Delete**: Hover over files/folders and click the trash icon
- **Monitor Progress**: View real-time upload progress bars
- **Access Files**: Get direct S3 URLs for uploaded files


## Security Notes

- Keep your AWS credentials secure and never commit them to version control
- Use appropriate IAM policies to restrict bucket access
- Consider implementing additional authentication for the UI

## Contributing

This project is open to contributions. We appreciate any help to improve the S3 Bucket UI Manager!

### Bug Reports

If you find a bug, please open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment details

### Feature Requests

Have an idea for a new feature? We'd love to hear it! Please open an issue with:

- Clear description of the feature
- Use cases
- Any implementation ideas you have