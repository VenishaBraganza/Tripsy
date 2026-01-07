import { SettingsContent } from "@/components/settings/settings-content"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <SettingsContent />
      </div>
    </div>
  )
}
