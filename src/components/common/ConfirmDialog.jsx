import Modal   from './Modal';
import Spinner  from './Spinner';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title     = 'Confirm Delete',
  message,
  loading   = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">
        {message ?? 'Are you sure? This action cannot be undone.'}
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
