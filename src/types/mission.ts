export type MissionType = 'like' | 'write' | 'comment'

export interface Mission {
    id: string
    title: string
    type: MissionType
    requiredCount: number
    currentCount: number
    coinReward: number
    completed: boolean
    claimed: boolean
    expiresAt: string // ISO date string
}
