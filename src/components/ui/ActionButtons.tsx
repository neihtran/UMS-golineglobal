import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface ActionButtonsProps {
  viewHref?: string;
  onView?: () => void;
  editHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export function ActionButtons({
  viewHref,
  onView,
  editHref,
  onEdit,
  onDelete,
  deleteLoading = false,
  viewLabel = 'Chi tiết',
  editLabel = 'Sửa',
  deleteLabel = 'Xóa',
  className = '',
}: ActionButtonsProps) {
  return (
    <div className={`flex shrink-0 items-center gap-1 ${className}`}>
      {viewHref && (
        <Link to={viewHref}>
          <Button variant="outline" size="icon" title={viewLabel}>
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )}
      {onView && (
        <Button variant="outline" size="icon" onClick={onView} title={viewLabel}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {editHref && (
        <Link to={editHref}>
          <Button variant="outline" size="icon" title={editLabel}>
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      )}
      {onEdit && (
        <Button variant="outline" size="icon" onClick={onEdit} title={editLabel}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="danger"
          size="icon"
          onClick={onDelete}
          loading={deleteLoading}
          title={deleteLabel}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
