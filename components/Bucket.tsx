'use client';

import {
  Upload,
  X,
  Folder,
  Plus,
  ChevronRight,
  Home,
  Trash2,
  Loader2,
} from 'lucide-react';
import DeleteDialog from './DeleteDialog';
import { useFileHook } from '@/lib/hooks';

export default function BucketUI() {
  const {
    mounted,
    files,
    uploading,
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
  } = useFileHook();

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {loading.folderFetch && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

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
          <h2 className="text-lg font-semibold">
            Current Location: {currentFolder || 'Root'}
          </h2>
          <button
            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
            disabled={loading.folderCreate}
          >
            {loading.folderCreate ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
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
              <div
                key={folder.path}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-500 group"
              >
                <button
                  onClick={() => handleFolderClick(folder.path)}
                  className="flex items-center space-x-2 flex-grow"
                  disabled={loading.deleteItem === folder.path}
                >
                  <Folder className="h-5 w-5 text-blue-500" />
                  <span className="truncate">{folder.name}</span>
                </button>
                <button
                  onClick={() => handleDelete(folder.path, true, folder.name)}
                  className="hidden group-hover:block text-red-500 hover:text-red-700 ml-2"
                  disabled={loading.deleteItem === folder.path}
                >
                  {loading.deleteItem === folder.path ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
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
          <span className="text-gray-600">Click to select multiple images</span>
        </label>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files:</h3>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-black bg-gray-50 p-2 rounded"
            >
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
            {uploading
              ? 'Uploading...'
              : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
      )}

      {/* Files in Current Folder */}
      {folderFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Files in Current Folder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folderFiles.map((file) => (
              <div
                key={file.key}
                className="flex items-center justify-between bg-blue-500 p-3 rounded-lg group"
              >
                <div className="flex-grow">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => handleDelete(file.key, false, file.name)}
                    className="hidden group-hover:block text-red-500 hover:text-red-700"
                    disabled={loading.deleteItem === file.key}
                  >
                    {loading.deleteItem === file.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        itemName={deleteDialog.itemName}
        isFolder={deleteDialog.isFolder}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
