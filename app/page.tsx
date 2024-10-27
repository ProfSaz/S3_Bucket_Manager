import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">S3 Bucket Upload</h1>
      <FileUpload />
    </main>
  );
}
