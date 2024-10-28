import { useState, useEffect } from 'react';
import {
  UploadedFile,
  LoadingStates,
  FolderInfo,
  FileInfo,
  Breadcrumb,
} from '@/lib/types';

export const useFileHook = () => {
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
  const [loading, setLoading] = useState<LoadingStates>({
    folderFetch: false,
    folderCreate: false,
    deleteItem: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemPath: '',
    itemName: '',
    isFolder: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchFolderContents(currentFolder);
    }
  }, [mounted, currentFolder]);

  const fetchFolderContents = async (prefix: string) => {
    setLoading((prev) => ({ ...prev, folderFetch: true }));
    try {
      const response = await fetch(
        `/api/folders?prefix=${encodeURIComponent(prefix)}`
      );
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setFolders(data.folders);
      setFolderFiles(data.files);
      setBreadcrumbs(data.breadcrumbs);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch folder contents:', error);
      setError('Failed to load folder contents');
    } finally {
      setLoading((prev) => ({ ...prev, folderFetch: false }));
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

  const handleDelete = async (
    path: string,
    isFolder: boolean,
    name: string
  ) => {
    setDeleteDialog({
      isOpen: true,
      itemPath: path,
      itemName: name,
      isFolder,
    });
  };

  const confirmDelete = async () => {
    const { itemPath, isFolder } = deleteDialog;
    setLoading((prev) => ({ ...prev, deleteItem: itemPath }));

    try {
      const response = await fetch('/api/folders/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: itemPath, isFolder }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      await fetchFolderContents(currentFolder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading((prev) => ({ ...prev, deleteItem: null }));
      setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      setLoading((prev) => ({ ...prev, folderCreate: true }));
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

        await fetchFolderContents(currentFolder);
        setNewFolderName('');
        setShowNewFolderInput(false);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to create folder'
        );
      } finally {
        setLoading((prev) => ({ ...prev, folderCreate: false }));
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
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchFolderContents(currentFolder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return {
    mounted,
    files,
    uploading,
    uploadedFiles,
    error,
    currentFolder,
    folders,
    folderFiles,
    breadcrumbs,
    newFolderName,
    showNewFolderInput,
    loading,
    deleteDialog,
    setNewFolderName,
    setFiles,
    setShowNewFolderInput,
    setDeleteDialog,
    handleFolderClick,
    handleFileChange,
    handleDelete,
    confirmDelete,
    handleCreateFolder,
    handleUpload,
  };
};
