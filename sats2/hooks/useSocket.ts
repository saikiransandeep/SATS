"use client"

import { useEffect, useRef } from "react"
import type { Socket } from "socket.io-client"
import { socketService } from "@/lib/socket"
import { useAuth } from "./useAuth"

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !socketRef.current) {
      socketRef.current = socketService.connect()
    }

    return () => {
      if (socketRef.current) {
        socketService.disconnect()
        socketRef.current = null
      }
    }
  }, [isAuthenticated])

  return socketRef.current
}
