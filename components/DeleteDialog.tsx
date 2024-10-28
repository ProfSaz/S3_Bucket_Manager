import { AlertCircle } from 'lucide-react';
import { DeleteDialogProps } from '@/lib/types';

const DeleteDialog = ({
  isOpen,
  itemName,
  isFolder,
  onConfirm,
  onCancel,
}: DeleteDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Confirm Delete</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this {isFolder ? 'folder' : 'file'}?
          <br />
          <span className="font-semibold">{itemName}</span>
        </p>

        <div className="flex space-x-4 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
