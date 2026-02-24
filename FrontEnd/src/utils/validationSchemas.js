import { object, string } from 'yup'

export const loginSchema = object({
  email: string().required('Email is required').email('Enter a valid email'),
  password: string().required('Password is required').min(8, 'Minimum 8 characters'),
})

export const forgotPasswordSchema = object({
  email: string().required('Email is required').email('Enter a valid email'),
})
