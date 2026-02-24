import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import FormField from '../../components/forms/FormField'
import Button from '../../components/ui/Button'
import { useToast } from '../../hooks/useToast'
import { authService } from '../../services/authService'
import { forgotPasswordSchema } from '../../utils/validationSchemas'

export default function ForgotPasswordPage() {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }) => {
    try {
      const response = await authService.requestPasswordReset(email)
      showToast(response?.message || 'If this email exists, a reset password email has been sent.', 'success')
      if (response?.temporaryPassword) {
        showToast(`Temporary password: ${response.temporaryPassword}`, 'info', 12000)
      }
      reset()
    } catch {
      showToast('Unable to send reset password now. Please try again.', 'error')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Forgot password</h2>
      <p className="mt-1 text-sm text-soft">Enter your email to receive a recovery password.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email" error={errors.email?.message}>
          <input {...register('email')} className="input-base auth-input" placeholder="Eg. admin@renterz.com" />
        </FormField>

        <Button className="w-full" type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Sending...' : <>Send recovery password <ArrowRight size={15} className="ml-1" /></>}
        </Button>
      </form>

      <p className="mt-4 text-sm text-soft">
        <Link className="inline-flex items-center gap-1 font-semibold text-[var(--primary)]" to="/login">
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </p>
    </div>
  )
}
