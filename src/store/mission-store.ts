import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authenticationService } from "@/core/services/API/authentication/Authentication.service"

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

export interface UserTask {
  id: string
  createdAt: string
  updatedAt: string
  loaiNhiemVu: number
  tienDo: number
  soLanCanThucHien: number
  daHoanThanh: boolean
  daNhanThuong: boolean
  nguoiDung: string
  tenNhiemVu: string
  coinNhanThuong: number
}

interface MissionState {
  missions: Mission[]
  coins: number
  isLoading: boolean
  error: string | null

  // API Integration
  fetchUserTasks: () => Promise<void>
  collectTaskReward: (taskId: string) => Promise<boolean>
  refreshMissionData: () => Promise<void> // Added this new function
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: [],
      coins: 0,
      isLoading: false,
      error: null,

      fetchUserTasks: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticationService.getUserTasksDaily()
          const userTasks = response?.data?.results || []
          
          // Convert API userTasks to our mission format
          const missions = userTasks.map((task: UserTask) => ({
            id: task.id,
            title: task.tenNhiemVu,
            type: task.loaiNhiemVu || "login",
            requiredCount: task.soLanCanThucHien,
            currentCount: task.tienDo,
            coinReward: task.coinNhanThuong,
            completed: task.daHoanThanh,
            claimed: task.daNhanThuong,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          }))
          
          set({ 
            missions,
            isLoading: false 
          })
          
          return missions
        } catch (error) {
          console.error("Error fetching daily tasks:", error)
          set({ 
            isLoading: false, 
            error: "Failed to load daily tasks. Please try again later." 
          })
        }
      },

      collectTaskReward: async (taskId: string) => {
        set({ isLoading: true, error: null })
        try {
          await authenticationService.collectCoinCompletedTask({
            task_id: taskId
          })
          
          // Update local state to reflect collected reward
          set((state) => {
            const taskToUpdate = state.missions.find(mission => mission.id === taskId)
            
            if (!taskToUpdate) {
              return { isLoading: false }
            }
            
            const updatedMissions = state.missions.map(mission => 
              mission.id === taskId ? { ...mission, claimed: true } : mission
            )
            
            return {
              missions: updatedMissions,
              coins: state.coins + (taskToUpdate.coinReward || 0),
              isLoading: false
            }
          })
          
          return true
        } catch (error) {
          console.error("Error collecting task reward:", error)
          set({ 
            isLoading: false, 
            error: "Failed to collect reward. Please try again later." 
          })
          return false
        }
      },
      
      // New function to refresh all mission data
      refreshMissionData: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticationService.getUserTasksDaily()
          const userTasks = response?.data?.results || []
          
          // Convert API userTasks to our mission format
          const missions = userTasks.map((task: UserTask) => ({
            id: task.id,
            title: task.tenNhiemVu,
            type: task.loaiNhiemVu || "login",
            requiredCount: task.soLanCanThucHien,
            currentCount: task.tienDo,
            coinReward: task.coinNhanThuong,
            completed: task.daHoanThanh,
            claimed: task.daNhanThuong,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          }))
          
          set({ 
            missions,
            isLoading: false 
          })
          
          return missions
        } catch (error) {
          console.error("Error refreshing mission data:", error)
          set({ 
            isLoading: false, 
            error: "Failed to refresh mission data. Please try again later." 
          })
        }
      }
    }),
    {
      name: "mission-storage",
    },
  ),
)
