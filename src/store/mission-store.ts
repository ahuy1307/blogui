import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authenticationService } from "@/core/services/API/authentication/Authentication.service"

export type MissionType = "login" | "post" | "like" | "comment" | "share" | "charge_gen_blog" | "charge_gen_image" | "complete_profile"

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
  loaiNhiemVu: string
  tienDo: number
  soLanCanThucHien: number
  daHoanThanh: boolean
  daNhanThuong: boolean
  nguoiDung: string
  tenNhiemVu: string
  coinNhanThuong: number
}

export interface Transaction {
  id: string
  type: 'earned' | 'spent'
  amount?: number
  source?: string
  description?: string
  timestamp?: string
  createdAt?: string
  
  // For UserTask-based transactions
  loaiNhiemVu?: string
  tienDo?: number
  soLanCanThucHien?: number
  tenNhiemVu?: string
  coinNhanThuong?: number
}

interface MissionState {
  missions: Mission[]
  coins: number
  isLoading: boolean
  error: string | null
  transactions: Transaction[]
  hasMoreTransactions: boolean
  currentTransactionPage: number
  needsLazyLoading: boolean  // Add this property

  // API Integration
  fetchUserTasks: () => Promise<void>
  collectTaskReward: (taskId: string) => Promise<boolean>
  refreshMissionData: () => Promise<void>
  
  // Transaction related function
  fetchTransactionHistory: (page?: number, reset?: boolean) => Promise<void>
  loadMoreTransactions: () => Promise<void>
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: [],
      coins: 0,
      isLoading: false,
      error: null,
      transactions: [],
      hasMoreTransactions: true,
      currentTransactionPage: 1,
      needsLazyLoading: false,  // Initialize this property

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
      },
      
      fetchTransactionHistory: async (page = 1, reset = false) => {
        set(state => ({ 
          isLoading: true, 
          error: null,
          currentTransactionPage: page
        }))
        
        try {
          const response = await authenticationService.getCoinHistory({ page, limit: 10 })
          const historyData = response?.data?.results || []
          const totalCount = response?.data?.count || 0
          const totalPages = Math.ceil(totalCount / 10) || 1
          
          // Convert API historyData to our transaction format
          const newTransactions = historyData.map((item: UserTask) => {
            // Determine transaction type based on loaiNhiemVu
            // If it starts with "charge_", it's a "spent" transaction, otherwise "earned"
            const type = item.loaiNhiemVu?.startsWith('charge_') ? 'spent' : 'earned'
            
            return {
              id: item.id,
              type,
              amount: item.coinNhanThuong,
              source: item.loaiNhiemVu,
              description: item.tenNhiemVu,
              createdAt: item.createdAt,
              // Include original UserTask properties
              loaiNhiemVu: item.loaiNhiemVu,
              tienDo: item.tienDo,
              soLanCanThucHien: item.soLanCanThucHien,
              tenNhiemVu: item.tenNhiemVu,
              coinNhanThuong: item.coinNhanThuong
            }
          })
          
          // If totalCount <= 10, we load all transactions at once and don't need lazy loading
          // If totalCount > 10, enable lazy loading
          const needsLazyLoading = totalCount > 10
          
          set(state => ({ 
            // If reset or first page, replace transactions; otherwise append to existing
            transactions: reset || page === 1 ? newTransactions : [...state.transactions, ...newTransactions],
            hasMoreTransactions: page < totalPages,
            isLoading: false,
            needsLazyLoading
          }))
          
          return newTransactions
        } catch (error) {
          console.error("Error fetching transaction history:", error)
          set({ 
            isLoading: false, 
            error: "Failed to load transaction history. Please try again later." 
          })
        }
      },
      
      loadMoreTransactions: async () => {
        const { currentTransactionPage, hasMoreTransactions, isLoading, needsLazyLoading } = get()
        
        // Only load more if needed (count > 10) and we have more pages
        if (!needsLazyLoading || !hasMoreTransactions || isLoading) return
        
        await get().fetchTransactionHistory(currentTransactionPage + 1, false)
      }
    }),
    {
      name: "mission-storage",
    }
  )
)
