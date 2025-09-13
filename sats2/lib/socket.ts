"use client"

import { io, type Socket } from "socket.io-client"
import { authService } from "./auth"

class SocketService {
  private socket: Socket | null = null
  private static instance: SocketService

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(): Socket {
    if (!this.socket) {
      const token = authService.getToken()

      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      })

      this.socket.on("connect", () => {
        console.log("[v0] Socket connected:", this.socket?.id)
      })

      this.socket.on("disconnect", () => {
        console.log("[v0] Socket disconnected")
      })

      this.socket.on("connect_error", (error) => {
        console.error("[v0] Socket connection error:", error)
      })
    }

    return this.socket
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  public getSocket(): Socket | null {
    return this.socket
  }

  // Attendance-specific methods
  public joinAttendanceSession(sessionId: string): void {
    if (this.socket) {
      this.socket.emit("join_attendance_session", { sessionId })
    }
  }

  public leaveAttendanceSession(sessionId: string): void {
    if (this.socket) {
      this.socket.emit("leave_attendance_session", { sessionId })
    }
  }

  public markAttendance(data: {
    sessionId: string
    studentId: string
    status: "present" | "absent" | "od"
    markedBy: string
  }): void {
    if (this.socket) {
      this.socket.emit("mark_attendance", data)
    }
  }

  public submitAttendanceSession(sessionId: string): void {
    if (this.socket) {
      this.socket.emit("submit_attendance_session", { sessionId })
    }
  }

  // Notification methods
  public sendNotification(data: {
    type: "attendance_reminder" | "low_attendance_alert" | "session_ended"
    recipients: string[]
    message: string
    metadata?: any
  }): void {
    if (this.socket) {
      this.socket.emit("send_notification", data)
    }
  }
}

export const socketService = SocketService.getInstance()
