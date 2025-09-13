import { ProtectedRoute } from "@/components/protected-route"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["faculty", "class_incharge", "hod", "principal"]}>
      <SettingsContent />
    </ProtectedRoute>
  )
}
