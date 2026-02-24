import { useState } from 'react'
import Button from '../ui/Button'
import { useToast } from '../../hooks/useToast'

export default function LandingFeedback() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email'
    }
    if (!form.message.trim()) nextErrors.message = 'Feedback is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    showToast('Thanks for your feedback. We will review it soon.', 'success')
    setForm({ name: '', email: '', message: '' })
    setErrors({})
  }

  return (
    <section className="rounded-3xl border border-base bg-surface p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-bold">Share Your Feedback</h3>
      <p className="mt-2 text-sm text-soft">Tell us what to improve in the product experience.</p>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-main">Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="input-base"
            placeholder="Your name"
          />
          {errors.name ? <span className="mt-1 block text-xs text-rose-600">{errors.name}</span> : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-main">Email</span>
          <input
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="input-base"
            placeholder="you@example.com"
          />
          {errors.email ? <span className="mt-1 block text-xs text-rose-600">{errors.email}</span> : null}
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-main">Feedback</span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            className="input-base min-h-28 resize-y"
            placeholder="Write your suggestions..."
          />
          {errors.message ? <span className="mt-1 block text-xs text-rose-600">{errors.message}</span> : null}
        </label>

        <div className="md:col-span-2">
          <Button type="submit">Submit Feedback</Button>
        </div>
      </form>
    </section>
  )
}
