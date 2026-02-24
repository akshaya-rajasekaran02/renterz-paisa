export default function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-main">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}