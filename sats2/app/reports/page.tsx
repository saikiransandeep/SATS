import { ProtectedRoute } from "@/components/protected-route"
import { ReportsContent } from "@/components/reports-content"

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["faculty", "class_incharge", "hod", "principal"]}>
      <ReportsContent />
    </ProtectedRoute>
  )
}
