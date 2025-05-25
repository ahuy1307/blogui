'use client'

import { useEffect } from 'react'
import { Button } from '@/components/other-ui/Button'
import {
    Award,
    Check,
    Coins,
    Edit,
    Heart,
    LogIn,
    MessageCircle,
    Share2,
} from 'lucide-react'
import { Progress } from '@/components/other-ui/Progress'
import { useMissions } from '@/hooks/useMissions'
import { Badge } from '@/components/other-ui/Badge'
import { useToast } from '@/components/other-ui/useToast'
import { MissionType } from '@/store/mission-store'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { Toaster } from '@/components/other-ui/Toaster'

export default function MissionPage() {
    const t = useTranslations('header.MissionsDropdown')
    const { dispatch, user } = useAuth()

    const {
        missions,
        fetchUserTasks,
        collectTaskReward,
        fetchTransactionHistory,
    } = useMissions()
    const { toast } = useToast()

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

    // Initialize missions on component mount
    useEffect(() => {
        fetchUserTasks()
    }, [fetchUserTasks])

    const completedMissions = missions.filter((mission) => mission.completed)
    const unclaimedMissions = missions.filter(
        (mission) => mission.completed && !mission.claimed
    )

    const handleClaimReward = async (missionId: string) => {
        const success = await collectTaskReward(missionId)
        if (success) {
            toast({
                title: t('claimRewardSuccess'),
                description: t('claimRewardDescription'),
            })
            fetchTransactionHistory()
            handleSignIn()
        } else {
            toast({
                title: t('claimRewardError'),
                description: t('claimRewardErrorDescription'),
                variant: 'destructive',
            })
        }
    }

    const getMissionIcon = (type: MissionType) => {
        switch (type) {
            case 'like':
                return <Heart className="h-5 w-5 text-red-500" />
            case 'post':
                return <Edit className="h-5 w-5 text-green-500" />
            case 'comment':
                return <MessageCircle className="h-5 w-5 text-blue-500" />
            case 'share':
                return <Share2 className="h-5 w-5 text-orange-500" />
            case 'login':
                return <LogIn className="h-5 w-5 text-indigo-500" />
            default:
                return <Award className="h-5 w-5 text-purple-500" />
        }
    }

    return (
        <>
            <Toaster />
            <div className="container px-4 py-8 max-w-3xl mx-auto pt-[80px]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-3">
                        <Award className="h-8 w-8 text-primary" />
                        {t('missions')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('missionsDescription')}
                    </p>
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            {t('missionsDaily')}
                        </h2>
                        <Badge variant="outline" className="text-sm">
                            {completedMissions.length}/{missions.length}{' '}
                            {t('completed')}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                        {t('dailyMissionsDescription')}
                    </p>

                    <div className="space-y-6">
                        {missions.map((mission) => (
                            <div
                                key={mission.id}
                                className="flex flex-col p-5 border rounded-lg bg-background"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            {getMissionIcon(mission.type)}
                                        </div>
                                        <div>
                                            <p className="font-bold">
                                                {mission.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    `missionDescription.${mission.type}`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {mission.currentCount}/
                                        {mission.requiredCount}
                                    </div>
                                </div>

                                <Progress
                                    value={
                                        (mission.currentCount /
                                            mission.requiredCount) *
                                        100
                                    }
                                    className={`h-2 mb-4 ${
                                        mission.completed ? 'bg-green-500' : ''
                                    }`}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-600 font-medium">
                                        <Coins className="h-5 w-5" />
                                        <span>
                                            {mission.coinReward}{' '}
                                            {t('coinsReward')}
                                        </span>
                                    </div>
                                    {mission.completed ? (
                                        mission.claimed ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <Check className="h-5 w-5" />
                                                <span>{t('claimed')}</span>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() =>
                                                    handleClaimReward(
                                                        mission.id
                                                    )
                                                }
                                                className="bg-amber-500 hover:bg-amber-600"
                                            >
                                                {t('claimReward')}
                                            </Button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>

                    {unclaimedMissions.length > 0 && (
                        <div className="mt-8 p-4 border rounded-lg bg-amber-50 border-amber-200">
                            <p className="text-center font-medium text-amber-800">
                                {t('youHave')} {unclaimedMissions.length}{' '}
                                {unclaimedMissions.length === 1
                                    ? t('unclaimedReward')
                                    : t('unclaimedRewards')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {t('howItWorks')}
                    </h2>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Award className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {t('dailyTasksTitle')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('dailyTasksDescription')}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Coins className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {t('earnCoinsTitle')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('earnCoinsDescription')}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Check className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {t('useCoinsTitle')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('useCoinsDescription')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
