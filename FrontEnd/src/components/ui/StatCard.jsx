import Card from './Card'
import { classNames } from '../../utils/classNames'

export default function StatCard({ title, value, accent = 'bg-teal-500', onClick }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classNames('card relative w-full overflow-hidden p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg')}
      >
        <span className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 ${accent}`} />
        <p className="text-sm text-soft">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-main">{value}</h3>
      </button>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      <span className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 ${accent}`} />
      <p className="text-sm text-soft">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-main">{value}</h3>
    </Card>
  )
}
