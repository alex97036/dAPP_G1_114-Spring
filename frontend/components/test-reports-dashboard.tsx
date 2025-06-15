"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { RefreshCw, TestTube, BarChart3, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface Report {
  id: string
  timestamp: number
  reporter: string
  cid: string
  content: string
  tags: string[]
}

interface Stats {
  total: number
  today: number
  lastUpdated: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export default function ReportsDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState("all")
  const [apiStatus, setApiStatus] = useState<{ [key: string]: "success" | "error" | "loading" }>({})

  const API_BASE = "http://localhost:3000"

  // Load reports from API
  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/reports`)
      const data = await response.json()

      if (data.success) {
        setReports(data.reports || [])
      } else {
        setError(data.error || "Failed to load reports")
      }
    } catch (err) {
      setError(`Connection error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || "Failed to load statistics")
      }
    } catch (err) {
      setError(`Connection error: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  // Test API endpoints
  const testAPI = async () => {
    const endpoints = [
      { name: "reports", url: `${API_BASE}/reports` },
      { name: "stats", url: `${API_BASE}/stats` },
    ]

    setApiStatus({})

    for (const endpoint of endpoints) {
      setApiStatus((prev) => ({ ...prev, [endpoint.name]: "loading" }))

      try {
        const response = await fetch(endpoint.url)
        const data = await response.json()

        setApiStatus((prev) => ({
          ...prev,
          [endpoint.name]: data.success ? "success" : "error",
        }))
      } catch (err) {
        setApiStatus((prev) => ({ ...prev, [endpoint.name]: "error" }))
      }
    }
  }

  // Get unique tags for filtering
  const getAllTags = () => {
    const tags = new Set<string>()
    reports.forEach((report) => {
      if (report.tags && report.tags.length > 0) {
        report.tags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags)
  }

  // Filter reports based on current filter
  const getFilteredReports = () => {
    if (currentFilter === "all") return reports
    return reports.filter((report) => report.tags && report.tags.includes(currentFilter))
  }

  // Prepare chart data for tag distribution
  const getTagChartData = () => {
    const tagCounts: { [key: string]: number } = {}

    reports.forEach((report) => {
      if (report.tags && report.tags.length > 0) {
        report.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      } else {
        tagCounts["無標籤"] = (tagCounts["無標籤"] || 0) + 1
      }
    })

    return Object.entries(tagCounts).map(([tag, count]) => ({
      tag,
      count,
    }))
  }

  // Prepare chart data for time series (last 30 days)
  const getTimeChartData = () => {
    const today = new Date()
    const dateData: { [key: string]: number } = {}

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      dateData[dateStr] = 0
    }

    // Count reports by date
    reports.forEach((report) => {
      const date = new Date(report.timestamp * 1000)
      const dateStr = date.toISOString().split("T")[0]
      if (dateData[dateStr] !== undefined) {
        dateData[dateStr]++
      }
    })

    return Object.entries(dateData).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" }),
      count,
    }))
  }

  // Load data on component mount
  useEffect(() => {
    loadStats()
    loadReports()
  }, [])

  const filteredReports = getFilteredReports()
  const tagChartData = getTagChartData()
  const timeChartData = getTimeChartData()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <BarChart3 className="h-8 w-8" />
          檢舉記錄測試頁面
        </h1>
        <p className="text-muted-foreground">此頁面用於測試後端 API 和顯示所有檢舉記錄</p>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            統計資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">總檢舉數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                <div className="text-sm text-muted-foreground">今日檢舉</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{new Date(stats.lastUpdated).toLocaleString("zh-TW")}</div>
                <div className="text-sm text-muted-foreground">最後更新</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">載入中...</div>
          )}

          {/* Charts */}
          {reports.length > 0 && (
            <Tabs defaultValue="tags" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tags">標籤分布圖</TabsTrigger>
                <TabsTrigger value="time">時間趨勢圖</TabsTrigger>
              </TabsList>

              <TabsContent value="tags" className="mt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tagChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tag" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="time" className="mt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏷️ 標籤篩選</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("all")}
            >
              全部
            </Button>
            {getAllTags().map((tag) => (
              <Button
                key={tag}
                variant={currentFilter === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentFilter(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={loadReports} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          載入所有檢舉
        </Button>
        <Button onClick={loadStats} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          載入統計資訊
        </Button>
        <Button onClick={testAPI} variant="outline">
          <TestTube className="h-4 w-4 mr-2" />
          測試 API
        </Button>
      </div>

      {/* API Status */}
      {Object.keys(apiStatus).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🧪 API 測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(apiStatus).map(([endpoint, status]) => (
                <div key={endpoint} className="flex items-center gap-2">
                  {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  {status === "loading" && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
                  <span className="capitalize">{endpoint} API:</span>
                  <span
                    className={
                      status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-blue-600"
                    }
                  >
                    {status === "success" ? "正常" : status === "error" ? "錯誤" : "測試中..."}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>
            檢舉記錄
            {currentFilter !== "all" && (
              <Badge variant="secondary" className="ml-2">
                篩選: {currentFilter}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {currentFilter === "all" ? "尚無檢舉記錄" : `無「${currentFilter}」標籤的檢舉記錄`}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">顯示 {filteredReports.length} 筆檢舉記錄</div>
              {filteredReports
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((report, index) => (
                  <Card key={report.id || index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">檢舉 #{reports.length - reports.indexOf(report)}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(report.timestamp * 1000).toLocaleString("zh-TW")}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">詐騙類型標籤:</div>
                            <div className="flex flex-wrap gap-1">
                              {report.tags && report.tags.length > 0 ? (
                                report.tags.map((tag, i) => (
                                  <Badge key={i} variant="default" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground italic text-sm">無標籤</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-1">檢舉人:</div>
                            <div className="text-sm font-mono bg-muted p-2 rounded text-xs break-all">
                              {`${report.reporter.substring(0, 6)}...${report.reporter.substring(38)}`}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-1">檢舉內容預覽:</div>
                          <div className="text-sm italic bg-muted p-2 rounded">
                            "
                            {report.content && report.content !== "內容不可用"
                              ? report.content.length > 80
                                ? report.content.substring(0, 80) + "..."
                                : report.content
                              : "內容不可用"}
                            "
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <strong>完整地址:</strong> <code className="text-xs">{report.reporter}</code>
                          </div>
                          <div>
                            <strong>內容 CID:</strong> <code className="text-xs">{report.cid}</code>
                          </div>
                          <div>
                            <strong>時間戳:</strong> {report.timestamp}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
