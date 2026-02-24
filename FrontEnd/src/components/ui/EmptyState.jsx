export default function EmptyState({ title, subtitle }) {
  return (
    <div className="card flex min-h-52 flex-col items-center justify-center gap-2 border-dashed text-center">
      <h3 className="text-lg font-semibold text-main">{title}</h3>
      <p className="max-w-sm text-sm text-soft">{subtitle}</p>
    </div>
  )
}