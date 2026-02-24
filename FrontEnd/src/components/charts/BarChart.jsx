export default function BarChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-semibold">Monthly Rent Chart</h3>
      <div className="flex h-56 items-end justify-between gap-3">
        {data.map((item) => (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-xl bg-teal-500/85" style={{ height: `${(item.value / max) * 100}%` }} />
            <span className="text-xs font-medium text-slate-600">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}