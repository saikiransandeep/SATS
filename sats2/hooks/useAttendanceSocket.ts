"use client"

import { useEffect, useState, useCallback } from "react"
import { useSocket } from "./useSocket"
import { useAuth } from "./useAuth"
import toast from "react-hot-toast"

export interface AttendanceUpdate {
  studentId: string
  status: "present" | "absent" | "od"
  markedBy: string
  timestamp: string
}

export interface AttendanceSession {
  id: string
  classId: string
  subjectId: string
  date: string
  startTime: string
  endTime?: string
  isActive: boolean
  markedBy: string[]
}

export function useAttendanceSocket(sessionId?: string) {
  const socket = useSocket()
  const { user } = useAuth()
  const [attendanceUpdates, setAttendanceUpdates] = useState<AttendanceUpdate[]>([])
  const [sessionData, setSessionData] = useState<AttendanceSession | null>(null)
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Join attendance session
  useEffect(() => {
    if (socket && sessionId && user) {
      socket.emit("join_attendance_session", { sessionId })
      setIsConnected(true)

      return () => {
        socket.emit("leave_attendance_session", { sessionId })
        setIsConnected(false)
      }
    }
  }, [socket, sessionId, user])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Real-time attendance updates
    socket.on("attendance_marked", (data: AttendanceUpdate) => {
      setAttendanceUpdates((prev) => [...prev, data])

      if (data.markedBy !== user?.id) {
        toast.success(`${data.studentId} marked ${data.status} by ${data.markedBy}`, {
          duration: 3000,
          position: "top-right",
        })
      }
    })

    // Session updates
    socket.on("session_updated", (data: AttendanceSession) => {
      setSessionData(data)
    })

    // Active users in session
    socket.on("session_users_updated", (users: string[]) => {
      setActiveUsers(users)
    })

    // Session ended
    socket.on("session_ended", (data: { sessionId: string; endedBy: string }) => {
      if (data.endedBy !== user?.id) {
        toast.error("Attendance session has been ended", {
          duration: 5000,
          position: "top-center",
        })
      }
      setSessionData((prev) => (prev ? { ...prev, isActive: false } : null))
    })

    // Notifications
    socket.on(
      "notification",
      (data: {
        type: string
        message: string
        timestamp: string
      }) => {
        switch (data.type) {
          case "attendance_reminder":
            toast("⏰ " + data.message, { duration: 4000 })
            break
          case "low_attendance_alert":
            toast.error("⚠️ " + data.message, { duration: 6000 })
            break
          default:
            toast(data.message)
        }
      },
    )

    // Connection status
    socket.on("connect", () => setIsConnected(true))
    socket.on("disconnect", () => setIsConnected(false))

    return () => {
      socket.off("attendance_marked")
      socket.off("session_updated")
      socket.off("session_users_updated")
      socket.off("session_ended")
      socket.off("notification")
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [socket, user])

  // Mark attendance function
  const markAttendance = useCallback(
    (studentId: string, status: "present" | "absent" | "od") => {
      if (socket && sessionId && user) {
        socket.emit("mark_attendance", {
          sessionId,
          studentId,
          status,
          markedBy: user.id,
        })
      }
    },
    [socket, sessionId, user],
  )

  // Submit session function
  const submitSession = useCallback(() => {
    if (socket && sessionId) {
      socket.emit("submit_attendance_session", { sessionId })
    }
  }, [socket, sessionId])

  // Send notification function
  const sendNotification = useCallback(
    (
      type: "attendance_reminder" | "low_attendance_alert" | "session_ended",
      recipients: string[],
      message: string,
      metadata?: any,
    ) => {
      if (socket) {
        socket.emit("send_notification", {
          type,
          recipients,
          message,
          metadata,
        })
      }
    },
    [socket],
  )

  return {
    attendanceUpdates,
    sessionData,
    activeUsers,
    isConnected,
    markAttendance,
    submitSession,
    sendNotification,
  }
}
