import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/forms/FormField'
import Button from '../../components/ui/Button'
import { ROLE_HOME_PATH } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { loginSchema } from '../../utils/validationSchemas'
import api from '../../services/api'
import { userService } from '../../services/userService'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [registerData, setRegisterData] = useState({ name: '', email: '', mobile: '', password: '' })
  const [registering, setRegistering] = useState(false)
  const { login, loading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      const session = await login(values)
      showToast('Login successful', 'success')
      const homePath = ROLE_HOME_PATH[session?.user?.role] || '/dashboard'
      const requestedPath = location.state?.from?.pathname
      navigate(requestedPath || homePath, { replace: true })
    } catch {
      showToast('Unable to login. Please verify credentials.', 'error')
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    if (!registerData.name || !registerData.email || !registerData.mobile || !registerData.password) {
      showToast('All fields are required', 'error')
      return
    }
    setRegistering(true)
    try {
      await api.post('/auth/register', {
        name: registerData.name,
        email: registerData.email,
        mobile: registerData.mobile,
        password: registerData.password,
      })
      showToast('Registration successful! Please login.', 'success')
      setShowRegister(false)
      setRegisterData({ name: '', email: '', mobile: '', password: '' })
    } catch (error) {
      showToast(error?.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Welcome back</h2>
      <p className="mt-1 text-sm text-soft">Sign in to access your property workspace.</p>

      <form className="login-form-reveal mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="login-form-item" style={{ '--login-delay': '80ms' }}>
          <FormField label="Email" error={errors.email?.message}>
            <input {...register('email')} className="input-base auth-input" placeholder="Eg. admin@renterz.com" />
          </FormField>
        </div>

        <div className="login-form-item" style={{ '--login-delay': '160ms' }}>
          <FormField label="Password" error={errors.password?.message}>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-base auth-input pr-10"
                placeholder="Eg. ********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-soft"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link className="text-xs font-semibold text-[var(--primary)]" to="/forgot-password">Forgot password?</Link>
            </div>
          </FormField>
        </div>

        <div className="login-form-item" style={{ '--login-delay': '230ms' }}>
          <Button className="login-submit-cta w-full" type="submit" disabled={!isValid || loading}>
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={15} className="login-submit-icon ml-1" /></>}
          </Button>
        </div>
      </form>

      <p className="mt-4 text-sm text-soft">
        Need an account?{' '}
        <button type="button" className="font-semibold text-[var(--primary)] hover:underline" onClick={() => setShowRegister(true)}>
          Register here
        </button>
      </p>

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">Register New Admin</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="input-base w-full"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="input-base w-full"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mobile</label>
                <input
                  type="text"
                  value={registerData.mobile}
                  onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
                  className="input-base w-full"
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="input-base w-full"
                  placeholder="Create a password"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => setShowRegister(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={registering} className="flex-1">
                  {registering ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
