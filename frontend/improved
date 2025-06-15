"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Wallet,
  Send,
  RefreshCw,
  Globe,
  DollarSign,
  Bitcoin,
  Phone,
  Smartphone,
  Fish,
  User,
  ShoppingCart,
  Heart,
  Briefcase,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react"

// 詐騙類型標籤配置
const FRAUD_TAGS = [
  { id: "網路詐騙", label: "網路詐騙", icon: Globe },
  { id: "投資詐騙", label: "投資詐騙", icon: DollarSign },
  { id: "加密貨幣", label: "加密貨幣", icon: Bitcoin },
  { id: "電話詐騙", label: "電話詐騙", icon: Phone },
  { id: "簡訊詐騙", label: "簡訊詐騙", icon: Smartphone },
  { id: "釣魚網站", label: "釣魚網站", icon: Fish },
  { id: "假冒身份", label: "假冒身份", icon: User },
  { id: "購物詐騙", label: "購物詐騙", icon: ShoppingCart },
  { id: "愛情詐騙", label: "愛情詐騙", icon: Heart },
  { id: "求職詐騙", label: "求職詐騙", icon: Briefcase },
  { id: "其他", label: "其他", icon: HelpCircle },
]

interface Report {
  reporter: string
  cid: string
  timestamp: number
  content?: string
  tags?: string[]
  hasContent?: boolean
}

export default function FraudReportingPlatform() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [reportContent, setReportContent] = useState("")
  const [reports, setReports] = useState<Report[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilter, setCurrentFilter] = useState("all")
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(null)

  // 模擬數據
  const mockReports: Report[] = [
    {
      reporter: "0x1234567890123456789012345678901234567890",
      cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      timestamp: Date.now() / 1000 - 3600,
      content: "收到假投資平台簡訊，聲稱可以快速獲利，要求轉帳到指定帳戶",
      tags: ["投資詐騙", "簡訊詐騙"],
      hasContent: true,
    },
    {
      reporter: "0x9876543210987654321098765432109876543210",
      cid: "QmPChd2hVbrJ1bfo675WPtgBAeqm7bfzDj2eVZ2z8z8z8z",
      timestamp: Date.now() / 1000 - 7200,
      content: "釣魚網站偽裝成銀行官網，要求輸入帳號密碼和信用卡資訊",
      tags: ["釣魚網站", "網路詐騙"],
      hasContent: true,
    },
  ]

  useEffect(() => {
    setReports(mockReports)
  }, [])

  // 連接錢包
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("請先安裝 MetaMask")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      setCurrentAccount(accounts[0])
      setIsConnected(true)
      setMessage({ type: "success", content: "錢包連接成功！" })

      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: "error", content: `連接失敗: ${error.message}` })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  // 斷開錢包
  const disconnectWallet = () => {
    setIsConnected(false)
    setCurrentAccount(null)
    setSelectedTags([])
    setReportContent("")
    setMessage({ type: "success", content: "錢包連接已斷開" })
    setTimeout(() => setMessage(null), 3000)
  }

  // 切換標籤選擇
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]))
  }

  // 提交檢舉
  const submitReport = async () => {
    if (!reportContent.trim()) {
      setMessage({ type: "error", content: "請輸入檢舉內容" })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (selectedTags.length === 0) {
      const confirmed = confirm("您尚未選擇任何詐騙類型標籤，確定要繼續提交嗎？")
      if (!confirmed) return
    }

    setIsSubmitting(true)

    try {
      // 模擬提交過程
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newReport: Report = {
        reporter: currentAccount!,
        cid: `QmMock${Date.now()}`,
        timestamp: Date.now() / 1000,
        content: reportContent,
        tags: selectedTags,
        hasContent: true,
      }

      setReports((prev) => [newReport, ...prev])
      setReportContent("")
      setSelectedTags([])
      setMessage({
        type: "success",
        content: `檢舉提交成功！CID: ${newReport.cid}`,
      })

      setTimeout(() => setMessage(null), 5000)
    } catch (error: any) {
      setMessage({ type: "error", content: `提交失敗: ${error.message}` })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 重新載入
  const refreshReports = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReports(mockReports)
    setIsLoading(false)
    setMessage({ type: "success", content: "檢舉記錄已更新" })
    setTimeout(() => setMessage(null), 3000)
  }

  // 篩選檢舉記錄
  const filteredReports =
    currentFilter === "all" ? reports : reports.filter((report) => report.tags?.includes(currentFilter))

  // 統計資訊 - 基於篩選結果
  const totalReports = filteredReports.length
  const todayReports = filteredReports.filter((report) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return report.timestamp >= today.getTime() / 1000
  }).length

  // 獲取所有使用過的標籤
  const usedTags = Array.from(new Set(reports.flatMap((report) => report.tags || [])))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 標題區域 */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Shield className="h-8 w-8" />
              詐騙檢舉平台 Demo
            </CardTitle>
            <p className="text-blue-100 mt-2">
              📝 此版本使用模擬 IPFS CID，檢舉內容透過 SHA256 雜湊生成唯一識別碼，並存儲在區塊鏈上。
              所有檢舉記錄將永久保存且公開透明。
            </p>
          </CardHeader>
        </Card>

        {/* 訊息顯示 */}
        {message && (
          <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.content}
            </AlertDescription>
          </Alert>
        )}

        {/* 錢包連接區域 */}
        <Card>
          <CardContent className="p-6">
            {!isConnected ? (
              <div className="text-center">
                <Button
                  onClick={connectWallet}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  連接 MetaMask 錢包
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">
                    當前帳號:{" "}
                    <span className="font-mono font-semibold">
                      {currentAccount?.substring(0, 6)}...{currentAccount?.substring(38)}
                    </span>
                  </span>
                </div>
                <Button onClick={disconnectWallet} variant="outline" size="sm">
                  斷開連接
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 檢舉表單 */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                提交檢舉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 標籤選擇 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">📋 選擇詐騙類型標籤 (可多選):</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {FRAUD_TAGS.map((tag) => {
                    const Icon = tag.icon
                    const isSelected = selectedTags.includes(tag.id)
                    return (
                      <Button
                        key={tag.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag.id)}
                        className={`transition-all ${isSelected ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {tag.label}
                      </Button>
                    )
                  })}
                </div>
                <div className="text-sm">
                  <span className="font-medium">已選擇標籤：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTags.length === 0 ? (
                      <span className="text-gray-500 italic">請選擇詐騙類型標籤</span>
                    ) : (
                      selectedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-green-100 text-green-800">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 檢舉內容 */}
              <div>
                <Textarea
                  placeholder="請詳細描述詐騙情況，包括：&#10;• 詐騙手法&#10;• 涉及金額&#10;• 詐騙方聯絡方式&#10;• 其他相關證據..."
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={submitReport}
                disabled={isSubmitting || !reportContent.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    送出檢舉
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 檢舉記錄 */}
        {isConnected && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">📋 檢舉記錄</CardTitle>
                <Button onClick={refreshReports} variant="outline" size="sm" disabled={isLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  重新載入
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 標籤篩選器 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">📌 依標籤篩選檢舉記錄：</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={currentFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentFilter("all")}
                  >
                    全部
                  </Button>
                  {usedTags.map((tag) => (
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
              </div>

              {/* 統計資訊 */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                      <TrendingUp className="h-6 w-6" />
                      {totalReports}
                    </div>
                    <div className="text-sm text-gray-600">總檢舉數</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-2">
                      <Calendar className="h-6 w-6" />
                      {todayReports}
                    </div>
                    <div className="text-sm text-gray-600">今日檢舉</div>
                  </CardContent>
                </Card>
              </div>

              {/* 檢舉記錄列表 */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <div>尚無檢舉記錄</div>
                    <div className="text-sm mt-1">成為第一個提交檢舉的人！</div>
                  </div>
                ) : (
                  filteredReports.map((report, index) => {
                    const date = new Date(report.timestamp * 1000)
                    const shortReporter = `${report.reporter.substring(0, 6)}...${report.reporter.substring(38)}`
                    const shortCid = `${report.cid.substring(0, 12)}...${report.cid.substring(report.cid.length - 8)}`

                    return (
                      <Card key={`${report.cid}-${index}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-sm text-gray-500">{date.toLocaleString("zh-TW")}</div>
                            <Badge variant="outline">#{reports.length - index}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">檢舉人:</span>
                              <div className="font-mono text-gray-600">{shortReporter}</div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">詐騙類型標籤:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {report.tags && report.tags.length > 0 ? (
                                  report.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-gray-500 italic">無標籤</span>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">檢舉內容:</span>
                              <div className="bg-gray-50 p-2 rounded mt-1 text-gray-600 italic">
                                "{report.content || "內容不可用"}"
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">內容 ID:</span>
                              <div className="font-mono text-xs bg-gray-100 p-1 rounded">{shortCid}</div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">狀態:</span>
                              <div className="flex items-center gap-1">
                                {report.hasContent ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600 text-xs">內容可用</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                    <span className="text-yellow-600 text-xs">內容不可用</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
