"use client"

import { Wifi, WifiOff, Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RealTimeIndicatorProps {
  isConnected: boolean
  activeUsers: string[]
  sessionTimer?: string
}

export function RealTimeIndicator({ isConnected, activeUsers, sessionTimer = "00:15:30" }: RealTimeIndicatorProps) {
  return (
    <div className="flex items-center space-x-4 p-3 bg-white border rounded-lg shadow-sm">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Active Users */}
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4 text-blue-500" />
        <Badge variant="secondary" className="text-xs">
          {activeUsers.length} active
        </Badge>
      </div>

      {/* Session Timer */}
      <div className="flex items-center space-x-2 text-red-600">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-sm font-medium">{sessionTimer}</span>
      </div>

      {/* Auto-save indicator */}
      <div className="text-xs text-gray-500">Auto-saving...</div>
    </div>
  )
}
