import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Mission, MissionType } from "@/types/mission"

export interface Transaction {
  id: string
  amount: number
  type: "earned" | "spent"
  source: string
  description: string
  timestamp: string
}

interface MissionState {
  missions: Mission[]
  coins: number
  transactions: Transaction[]

  // Mission actions
  initializeDailyMissions: () => void
  incrementMissionProgress: (type: MissionType) => void
  claimReward: (missionId: string) => void

  // Coin actions
  addCoins: (amount: number, source: string, description: string) => void
  spendCoins: (amount: number, source: string, description: string) => boolean

  // History
  getCoinHistory: () => Transaction[]
}

// Helper to create a new mission
const createMission = (
  id: string,
  title: string,
  type: MissionType,
  requiredCount: number,
  coinReward: number,
): Mission => {
  // Set expiration to end of current day
  const today = new Date()
  const expiresAt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  return {
    id,
    title,
    type,
    requiredCount,
    currentCount: 0,
    coinReward,
    completed: false,
    claimed: false,
    expiresAt,
  }
}

// Helper to create a transaction record
const createTransaction = (
  amount: number,
  type: "earned" | "spent",
  source: string,
  description: string,
): Transaction => {
  return {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount,
    type,
    source,
    description,
    timestamp: new Date().toISOString(),
  }
}

// Daily missions configuration
const dailyMissions = [
  {
    id: "write-blog",
    title: "Write a blog post",
    type: "write" as MissionType,
    requiredCount: 1,
    coinReward: 50,
  },
  {
    id: "like-posts",
    title: "Like 10 blog posts",
    type: "like" as MissionType,
    requiredCount: 10,
    coinReward: 20,
  },
  {
    id: "comment-posts",
    title: "Comment on 5 blog posts",
    type: "comment" as MissionType,
    requiredCount: 5,
    coinReward: 30,
  },
]

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: [],
      coins: 0,
      transactions: [],

      initializeDailyMissions: () => {
        const currentMissions = get().missions

        // Check if missions need to be reset (expired)
        const needsReset =
          currentMissions.length === 0 || currentMissions.some((mission) => new Date(mission.expiresAt) < new Date())

        if (needsReset) {
          const newMissions = dailyMissions.map((mission) =>
            createMission(mission.id, mission.title, mission.type, mission.requiredCount, mission.coinReward),
          )

          set({ missions: newMissions })
        }
      },

      incrementMissionProgress: (type) => {
        set((state) => {
          const updatedMissions = state.missions.map((mission) => {
            if (mission.type === type && !mission.completed) {
              const newCount = mission.currentCount + 1
              const completed = newCount >= mission.requiredCount

              return {
                ...mission,
                currentCount: newCount,
                completed,
              }
            }
            return mission
          })

          return { missions: updatedMissions }
        })
      },

      claimReward: (missionId) => {
        const mission = get().missions.find((m) => m.id === missionId)

        if (mission && mission.completed && !mission.claimed) {
          const transaction = createTransaction(
            mission.coinReward,
            "earned",
            "mission",
            `Completed mission: ${mission.title}`,
          )

          set((state) => {
            const updatedMissions = state.missions.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))

            return {
              missions: updatedMissions,
              coins: state.coins + mission.coinReward,
              transactions: [transaction, ...state.transactions],
            }
          })
        }
      },

      addCoins: (amount, source, description) => {
        const transaction = createTransaction(amount, "earned", source, description)

        set((state) => ({
          coins: state.coins + amount,
          transactions: [transaction, ...state.transactions],
        }))
      },

      spendCoins: (amount, source, description) => {
        const { coins } = get()

        if (coins >= amount) {
          const transaction = createTransaction(amount, "spent", source, description)

          set((state) => ({
            coins: state.coins - amount,
            transactions: [transaction, ...state.transactions],
          }))
          return true
        }

        return false
      },

      getCoinHistory: () => {
        return get().transactions
      },
    }),
    {
      name: "mission-storage",
    },
  ),
)

