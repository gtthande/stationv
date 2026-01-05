import SupplierDetailClient from './_components/SupplierDetailClient'

export default function SupplierDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <SupplierDetailClient supplierId={params.id} />
}

