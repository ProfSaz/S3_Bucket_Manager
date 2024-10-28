interface UploadedFile {
  originalName: string;
  url: string;
  folder: string;
}

interface LoadingStates {
  folderFetch: boolean;
  folderCreate: boolean;
  deleteItem: string | null; // stores path of item being deleted
}

interface DeleteDialogProps {
  isOpen: boolean;
  itemName: string;
  isFolder: boolean;
  onConfirm: () => void;
  onCancel: () => void;
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

export type {
  UploadedFile,
  LoadingStates,
  DeleteDialogProps,
  FolderInfo,
  FileInfo,
  Breadcrumb,
};
