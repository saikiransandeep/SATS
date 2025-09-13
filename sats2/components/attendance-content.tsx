"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ChevronLeft, ChevronRight, Download, UserCheck, UserX, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAttendanceSocket } from "@/hooks/useAttendanceSocket"
import { RealTimeIndicator } from "./real-time-indicator"
import toast from "react-hot-toast"

const students = [
  { id: "1", name: "Alice Johnson", rollNumber: "CSE2001", avatar: "/alice-in-wonderland.png", status: "present" },
  { id: "2", name: "Bob Williams", rollNumber: "CSE2002", avatar: "/bob-portrait.png", status: "absent" },
  { id: "3", name: "Charlie Brown", rollNumber: "CSE2003", avatar: "/abstract-figure-charlie.png", status: "present" },
  { id: "4", name: "Diana Miller", rollNumber: "CSE2004", avatar: "/diana.jpg", status: "od" },
  { id: "5", name: "Ethan Davis", rollNumber: "CSE2005", avatar: "/ethan-portrait.png", status: "present" },
]

export function AttendanceContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("CSE-B")
  const [selectedDate, setSelectedDate] = useState("10/27/2023")
  const [attendanceData, setAttendanceData] = useState(students)
  const [sessionId] = useState("session_123") // In real app, this would come from props/context
  const [sessionTimer, setSessionTimer] = useState("00:15:30")

  const { attendanceUpdates, sessionData, activeUsers, isConnected, markAttendance, submitSession, sendNotification } =
    useAttendanceSocket(sessionId)

  // Update local state when real-time updates arrive
  useEffect(() => {
    attendanceUpdates.forEach((update) => {
      setAttendanceData((prev) =>
        prev.map((student) =>
          student.id === update.studentId ? { ...student, status: update.status as any } : student,
        ),
      )
    })
  }, [attendanceUpdates])

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      // Update timer logic here
      setSessionTimer((prev) => {
        const [minutes, seconds] = prev.split(":").slice(1).map(Number)
        const totalSeconds = minutes * 60 + seconds
        if (totalSeconds <= 0) {
          clearInterval(timer)
          return "00:00:00"
        }
        const newTotal = totalSeconds - 1
        const newMinutes = Math.floor(newTotal / 60)
        const newSeconds = newTotal % 60
        return `00:${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const updateAttendance = (studentId: string, status: "present" | "absent" | "od") => {
    markAttendance(studentId, status)

    // Optimistic update for immediate UI feedback
    setAttendanceData((prev) => prev.map((student) => (student.id === studentId ? { ...student, status } : student)))
  }

  const markAllPresent = () => {
    attendanceData.forEach((student) => {
      markAttendance(student.id, "present")
    })
    setAttendanceData((prev) => prev.map((student) => ({ ...student, status: "present" as const })))
    toast.success("All students marked present")
  }

  const markAllAbsent = () => {
    attendanceData.forEach((student) => {
      markAttendance(student.id, "absent")
    })
    setAttendanceData((prev) => prev.map((student) => ({ ...student, status: "absent" as const })))
    toast.success("All students marked absent")
  }

  const handleSubmitAttendance = () => {
    submitSession()
    toast.success("Attendance submitted successfully!")

    // Send notification to relevant users
    sendNotification("session_ended", ["hod", "class_incharge"], `Attendance for ${selectedClass} has been submitted`, {
      sessionId,
      class: selectedClass,
      date: selectedDate,
    })
  }

  const filteredStudents = attendanceData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const presentCount = attendanceData.filter((s) => s.status === "present").length
  const absentCount = attendanceData.filter((s) => s.status === "absent").length
  const odCount = attendanceData.filter((s) => s.status === "od").length
  const unmarkedCount = attendanceData.filter((s) => s.status === "unmarked").length
  const totalStudents = attendanceData.length
  const isSessionActive = sessionData?.isActive ?? true

  return (
    <div className="p-6">
      <div className="mb-6">
        <RealTimeIndicator isConnected={isConnected} activeUsers={activeUsers} sessionTimer={sessionTimer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Attendance Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE-B">CSE-B</SelectItem>
                <SelectItem value="CSE-A">CSE-A</SelectItem>
                <SelectItem value="IT-A">IT-A</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="od">On Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Student List */}
          {isSessionActive ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">AVATAR</th>
                        <th className="text-left p-4 font-medium text-gray-600">STUDENT NAME</th>
                        <th className="text-left p-4 font-medium text-gray-600">ROLL NUMBER</th>
                        <th className="text-left p-4 font-medium text-gray-600">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="p-4 font-medium">{student.name}</td>
                          <td className="p-4 text-gray-600">{student.rollNumber}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={student.status === "present" ? "default" : "outline"}
                                className={student.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                                onClick={() => updateAttendance(student.id, "present")}
                              >
                                P
                              </Button>
                              <Button
                                size="sm"
                                variant={student.status === "absent" ? "default" : "outline"}
                                className={student.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                                onClick={() => updateAttendance(student.id, "absent")}
                              >
                                A
                              </Button>
                              <Button
                                size="sm"
                                variant={student.status === "od" ? "default" : "outline"}
                                className={student.status === "od" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                                onClick={() => updateAttendance(student.id, "od")}
                              >
                                OD
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Marking Closed</h3>
              <p className="text-gray-600">This session has ended and attendance can no longer be modified.</p>
            </Card>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 1 to 5 of 45 students</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8"
              disabled={!isSessionActive}
              onClick={handleSubmitAttendance}
            >
              Submit Attendance
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              {isConnected ? "Auto-saving in real-time" : "Last saved at 10:35 AM"}
            </p>
          </div>
        </div>

        {/* Attendance Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold">{totalStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Present</span>
                <span className="font-semibold text-green-600">{presentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Absent</span>
                <span className="font-semibold text-red-600">{absentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">On Duty (OD)</span>
                <span className="font-semibold text-yellow-600">{odCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unmarked</span>
                <span className="font-semibold">{unmarkedCount}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-green-500 h-3 rounded-full relative"
                    style={{ width: `${(presentCount / totalStudents) * 100}%` }}
                  >
                    <div className="absolute -right-2 -top-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <p className="text-center font-semibold text-lg">
                  {Math.round((presentCount / totalStudents) * 100)}% Present
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                onClick={markAllPresent}
                disabled={!isSessionActive}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                onClick={markAllAbsent}
                disabled={!isSessionActive}
              >
                <UserX className="mr-2 h-4 w-4" />
                Mark All Absent
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
