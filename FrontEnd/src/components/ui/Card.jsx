import { classNames } from '../../utils/classNames'

export default function Card({ children, className }) {
  return <div className={classNames('card p-5', className)}>{children}</div>
}