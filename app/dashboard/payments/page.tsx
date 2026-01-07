import { PaymentHistory } from "@/components/payment"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { requireAuth } from "@/lib/auth"

export const metadata = {
  title: "Payment History | Tripsy Dashboard",
  description: "View and manage your payment transactions and booking history.",
}

export default async function PaymentHistoryPage() {
  const user = await requireAuth()

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1 p-8">
        <PaymentHistory userId={user.id} />
      </div>
    </div>
  )
}