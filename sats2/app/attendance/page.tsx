import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AttendanceContent } from "@/components/attendance-content"
import { ProtectedRoute } from "@/components/protected-route"

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["faculty", "class_incharge"]}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Attendance" subtitle="CSE B › 3rd Year › CSE-B" />
          <main className="flex-1 overflow-y-auto">
            <AttendanceContent />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
