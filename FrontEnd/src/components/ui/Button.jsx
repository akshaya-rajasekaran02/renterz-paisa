import { classNames } from '../../utils/classNames'

const variants = {
  primary: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-transparent',
  secondary: 'bg-surface hover-surface-soft text-main border-base',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white border-transparent',
  ghost: 'bg-transparent hover-surface-soft text-main border-transparent',
}

export default function Button({ children, variant = 'primary', className, ...props }) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
