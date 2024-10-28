// import FileUpload from '@/components/FileUpload';
import BucketUI from '@/components/Bucket';

export default function UploadPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">S3 Bucket GUI</h1>
      <BucketUI />
    </main>
  );
}
