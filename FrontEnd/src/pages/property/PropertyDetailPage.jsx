import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import { usePageLoading } from '../../hooks/usePageLoading'
import { inventoryService } from '../../services/inventoryService'
import { propertyService } from '../../services/propertyService'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const loading = usePageLoading(350)

  const [property, setProperty] = useState(null)
  const unitsList = useMemo(() => inventoryService.getUnits(), [])
  const units = useMemo(() => unitsList.filter((unit) => unit.propertyId === property?.id), [property, unitsList])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const record = await propertyService.getProperty(id)
        if (!cancelled) setProperty(record)
      } catch {
        if (!cancelled) {
          const local = inventoryService.getProperties().find((item) => item.id === Number(id)) || null
          setProperty(local)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-56" />
      </div>
    )
  }

  if (!property) {
    return <Card>Property not found.</Card>
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold">{property.name}</h2>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">
          <div><p className="text-soft">City</p><p className="font-semibold">{property.city}</p></div>
          <div><p className="text-soft">Type</p><p className="font-semibold">{property.type}</p></div>
          <div><p className="text-soft">Units</p><p className="font-semibold">{property.units}</p></div>
          <div><p className="text-soft">Status</p><StatusBadge status={property.status} /></div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Unit Inventory</h3>
        <div className="mt-3 grid gap-2">
          {units.map((unit) => (
            <div key={unit.id} className="flex items-center justify-between rounded-xl border border-base px-3 py-2 text-sm">
              <span>{unit.unitNo} | Floor {unit.floor}</span>
              <StatusBadge status={unit.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
