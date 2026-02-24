import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-soft">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  )
}