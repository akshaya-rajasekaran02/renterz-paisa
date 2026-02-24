import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function isConfigured() {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY)
}

export const emailService = {
  isConfigured,

  async sendRecoveryPassword({ toEmail, toName, temporaryPassword }) {
    if (!isConfigured()) {
      const missing = []
      if (!EMAILJS_SERVICE_ID) missing.push('VITE_EMAILJS_SERVICE_ID')
      if (!EMAILJS_TEMPLATE_ID) missing.push('VITE_EMAILJS_TEMPLATE_ID')
      if (!EMAILJS_PUBLIC_KEY) missing.push('VITE_EMAILJS_PUBLIC_KEY')
      throw new Error(`EmailJS config missing: ${missing.join(', ')}`)
    }

    const safeEmail = String(toEmail || '').trim()
    const safeName = String(toName || 'User').trim()
    const safePassword = String(temporaryPassword || '').trim()
    const params = {
      to_email: safeEmail,
      email: safeEmail,
      user_email: safeEmail,
      reply_to: safeEmail,
      to_name: safeName,
      user_name: safeName,
      temporary_password: safePassword,
      pass: safePassword,
      message: `Your temporary password is: ${safePassword}`,
    }

    // Keep 4th arg as public key string for broad EmailJS SDK compatibility.
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
  },
}
