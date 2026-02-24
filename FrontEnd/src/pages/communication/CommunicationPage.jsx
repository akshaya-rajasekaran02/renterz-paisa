import { useEffect, useState } from 'react'
import { Mail, MessageCircle, PhoneCall, Smartphone } from 'lucide-react'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import { usePageLoading } from '../../hooks/usePageLoading'
import { communicationService } from '../../services/communicationService'
import { useToast } from '../../hooks/useToast'
import { formatDateTime } from '../../utils/formatters'

const channelIcons = {
  SMS: Smartphone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  VOICE: PhoneCall,
}

export default function CommunicationPage() {
  const loading = usePageLoading(350)
  const { showToast } = useToast()
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const records = await communicationService.listMyCommunications()
        if (!cancelled) setItems(records)
      } catch (error) {
        if (!cancelled) {
          showToast(error?.response?.data?.message || 'Unable to load communications.', 'error')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [showToast])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Communication Timeline</h2>
        <p className="text-sm text-soft">End-to-end delivery visibility across SMS, Email, WhatsApp, and Voice.</p>
      </div>

      <Card>
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = channelIcons[item.channel] || MessageCircle
            return (
              <div key={item.id} className="rounded-xl border border-base p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-main">
                      <Icon size={15} />
                    </span>
                    <strong className="text-sm text-main">{item.channel}</strong>
                    <span className="rounded-lg bg-surface-soft px-2 py-1 text-xs font-semibold text-main">{item.templateName}</span>
                  </div>
                  <StatusBadge status={item.deliveryStatus} />
                </div>
                <p className="mt-2 text-sm text-soft">{item.message}</p>
                <p className="mt-1 text-xs text-soft">{formatDateTime(item.timestamp)}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
