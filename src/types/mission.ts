export type MissionType = "login" | "post" | "like" | "comment" | "share" | "read"

export interface Mission {
  id: string
  title: string
  type: MissionType
  requiredCount: number
  currentCount: number
  coinReward: number
  completed: boolean
  claimed: boolean
  createdAt: string
  updatedAt: string
}
