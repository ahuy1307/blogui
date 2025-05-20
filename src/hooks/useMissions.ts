import { useEffect } from 'react';
import { useMissionStore } from '@/store/mission-store';

export function useMissions() {
  const { 
    missions, 
    coins, 
    isLoading,
    error,
    fetchUserTasks,
    collectTaskReward,
    transactions,
    fetchTransactionHistory
  } = useMissionStore();

  // Fetch missions when the hook is first used
  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  // Get incomplete missions
  const availableMissions = missions.filter(mission => !mission.claimed);
  
  // Get completed but unclaimed missions
  const completedMissions = missions.filter(mission => mission.completed && !mission.claimed);
  
  // Calculate total available coins from unclaimed missions
  const availableCoins = completedMissions.reduce((total, mission) => total + mission.coinReward, 0);

  return {
    missions,
    coins,
    isLoading,
    error,
    availableMissions,
    completedMissions,
    availableCoins,
    fetchUserTasks,
    collectTaskReward,
    transactions,
    fetchTransactionHistory
  };
}
