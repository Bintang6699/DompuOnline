import VendorDetailClient from './VendorDetailClient'

export default function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  return <VendorDetailClient params={params} />
}
