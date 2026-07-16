import { Button, Modal } from "../../components/ui";

export function DeleteApplicationDialog({
  open,
  application,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      variant="dialog"
      title="Delete application?"
      description={
        application
          ? `${application.company} — ${application.role} will be permanently removed.`
          : "This application will be permanently removed."
      }
      closeDisabled={deleting}
      onClose={deleting ? () => {} : onCancel}
    >
      <p className="mt-5 text-sm leading-6 text-muted">
        This action cannot be undone. No other applications will be affected.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" disabled={deleting} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" loading={deleting} onClick={onConfirm}>
          {deleting ? "Deleting…" : "Delete application"}
        </Button>
      </div>
    </Modal>
  );
}

export function DiscardChangesDialog({ open, onCancel, onDiscard }) {
  return (
    <Modal
      open={open}
      variant="dialog"
      title="Discard unsaved changes?"
      description="Your edits have not been saved."
      onClose={onCancel}
    >
      <p className="mt-5 text-sm leading-6 text-muted">
        Continue editing to keep working, or discard the changes and close the panel.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Continue editing
        </Button>
        <Button variant="danger" onClick={onDiscard}>
          Discard changes
        </Button>
      </div>
    </Modal>
  );
}
