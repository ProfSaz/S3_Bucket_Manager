'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Folder, Plus, ChevronRight, Home } from 'lucide-react';

interface UploadedFile {
  originalName: string;
  url: string;
  folder: string;
}

interface FolderInfo {
  path: string;
  name: string;
}

interface FileInfo {
  key: string;
  name: string;
  lastModified: Date;
  size: number;
}

interface Breadcrumb {
  name: string;
  path: string;
}

export default function FileUpload() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [folderFiles, setFolderFiles] = useState<FileInfo[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchFolderContents(currentFolder);
    }
  }, [mounted, currentFolder]);

  const fetchFolderContents = async (prefix: string) => {
    try {
      const response = await fetch(`/api/folders?prefix=${encodeURIComponent(prefix)}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setFolders(data.folders);
      setFolderFiles(data.files);
      setBreadcrumbs(data.breadcrumbs);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch folder contents:', error);
      setError('Failed to load folder contents');
    }
  };

  const handleFolderClick = (folderPath: string) => {
    setCurrentFolder(folderPath);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles(Array.from(e.target.files));
      setError(null);
      setUploadedFiles([]);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      const folderPath = `${currentFolder}${newFolderName.trim().replace(/\s+/g, '-').toLowerCase()}/`;
      
      try {
        const response = await fetch('/api/folders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderPath }),
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create folder');
        }
  
        // Refresh the current folder contents
        await fetchFolderContents(currentFolder);
        setNewFolderName('');
        setShowNewFolderInput(false);
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to create folder');
        console.error('Error creating folder:', error);
      }
    }
  };

  const handleUpload = async () => {
    if (!files.length) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folderPath', currentFolder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedFiles(data.files);
      setFiles([]);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh the current folder contents
      await fetchFolderContents(currentFolder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            <button
              onClick={() => handleFolderClick(crumb.path)}
              className="hover:text-blue-500"
            >
              {index === 0 ? <Home className="h-4 w-4" /> : crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Folder Creation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Current Location: {currentFolder || 'Root'}</h2>
          <button
            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
          >
            <Plus className="h-5 w-5" />
            <span>New Folder</span>
          </button>
        </div>

        {showNewFolderInput && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="block w-full rounded-md bg-black text-green-700 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        )}
      </div>

      {/* Folders Grid */}
      {folders.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <button
                key={folder.path}
                onClick={() => handleFolderClick(folder.path)}
                className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50"
              >
                <Folder className="h-5 w-5 text-blue-500" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          multiple
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <span className="text-gray-600">
            Click to select multiple images
          </span>
        </label>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files:</h3>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between text-black bg-gray-50 p-2 rounded">
              <span className="truncate">{file.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Files in Current Folder */}
      {folderFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Files in Current Folder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folderFiles.map((file) => (
              <div key={file.key} className="flex items-center justify-between bg-blue-500 p-3 rounded-lg">
                <div className="">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-white">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-white">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}