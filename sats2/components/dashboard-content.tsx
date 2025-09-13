"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Edit, Copy, Download, Filter, Calendar } from "lucide-react"

const currentClasses = [
  {
    subject: "Data Structures",
    code: "CSE-B",
    time: "10:30 AM - 11:30 AM",
    status: "current",
    color: "border-l-green-500",
  },
  {
    subject: "Operating Systems",
    code: "IT-A",
    time: "1:00 PM - 2:00 PM",
    status: "upcoming",
    color: "border-l-blue-500",
  },
  {
    subject: "Intro to Programming",
    code: "CSE-A",
    time: "9:00 AM - 10:00 AM",
    status: "active",
    color: "border-l-gray-400",
  },
]

const recentAttendance = [
  {
    subject: "Data Structures",
    code: "CSE-B",
    time: "10:30 AM - 11:30 AM (1hr)",
    present: 42,
    total: 45,
    percentage: 93,
  },
  {
    subject: "Operating Systems",
    code: "IT-A",
    time: "1:00 PM - 2:00 PM (1hr)",
    present: 35,
    total: 50,
    percentage: 70,
  },
  {
    subject: "Intro to Programming",
    code: "CSE-A",
    time: "9:00 AM - 10:00 AM (1hr)",
    present: 48,
    total: 60,
    percentage: 80,
  },
]

const subjectSummary = [
  { subject: "Intro to Programming", section: "Section A", percentage: 92 },
  { subject: "Data Structures", section: "Section B", percentage: 85 },
  { subject: "Operating Systems", section: "Section A", percentage: 95 },
]

export function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Schedule & Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentClasses.map((classItem, index) => (
                <div key={index} className={`border-l-4 ${classItem.color} pl-4 py-3 bg-gray-50 rounded-r-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{classItem.subject}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{classItem.code}</span>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {classItem.time}
                        </div>
                        {classItem.status === "current" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Current
                          </Badge>
                        )}
                        {classItem.status === "active" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active Session
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {classItem.status === "active" ? (
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-1" />
                          Start Session
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance Actions */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Attendance Actions</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  Sort
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAttendance.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {item.subject} - {item.code}
                    </h4>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{item.time}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">
                      {item.present}/{item.total}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.percentage >= 90 ? "bg-green-500" : item.percentage >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject-wise Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjectSummary.map((subject, index) => (
              <div key={index} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${subject.percentage}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{subject.percentage}%</span>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900">{subject.subject}</h3>
                <p className="text-sm text-gray-600">{subject.section}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
