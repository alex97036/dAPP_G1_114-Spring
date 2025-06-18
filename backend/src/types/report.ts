export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE'
  | 'COPYRIGHT'
  | 'HARASSMENT'
  | 'OTHER'

export interface Report {
  id: number
  reporterId: string              // 舉報者 user id
  targetId: string                // 被檢舉對象的 id（可為 user 或 content）
  targetType: 'USER' | 'POST' | 'COMMENT'
  reason: ReportReason
  description?: string            // 補充說明
  createdAt: Date
  resolved: boolean
}