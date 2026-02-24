import { STATUS_COLORS } from '../../constants/status'
import { classNames } from '../../utils/classNames'

export default function StatusBadge({ status }) {
  return (
    <span className={classNames('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', STATUS_COLORS[status] || 'bg-surface-soft text-main border-base')}>
      {status}
    </span>
  )
}