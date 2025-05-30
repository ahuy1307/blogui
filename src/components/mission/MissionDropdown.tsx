'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/other-ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/other-ui/DropdownMenu'
import {
    Award,
    Book,
    Check,
    ChevronDown,
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
import { Tooltip } from 'antd'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'

export function MissionsDropdown() {
    const t = useTranslations('header.MissionsDropdown')
    const { dispatch, user } = useAuth()

    const {
        missions,
        fetchUserTasks,
        collectTaskReward,
        fetchTransactionHistory,
    } = useMissions()
    const [open, setOpen] = useState(false)
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
        user && fetchUserTasks()
    }, [fetchUserTasks])

    const completedMissions = missions.filter((mission) => mission.completed)
    const unclaimedMissions = missions.filter(
        (mission) => mission.completed && !mission.claimed
    )
    const hasUnclaimedRewards = unclaimedMissions.length > 0

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
            case 'read_blog':
                return <Book className="h-5 w-5 text-yellow-500" />
            default:
                return <Award className="h-5 w-5 text-purple-500" />
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <Tooltip title={t('missions')}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                        <Award
                            className="h-10 w-10"
                            style={{ width: '21px', height: '21px' }}
                        />
                        <span className="sr-only">{t('missions')}</span>
                        {hasUnclaimedRewards && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-2 text-[10px] text-primary-foreground">
                                {unclaimedMissions.length}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
            </Tooltip>
            <DropdownMenuContent
                align="end"
                className="w-[350px] max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenuLabel className="flex items-center justify-between mt-6 mb-4">
                    <span className="text-base">{t('missionsDaily')}</span>
                    <Badge variant="outline" className="ml-2">
                        {completedMissions.length}/{missions.length}{' '}
                        {t('completed')}
                    </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="overflow-auto max-h-[50vh]">
                    <DropdownMenuGroup onClick={(e) => e.stopPropagation()}>
                        {missions.map((mission) => (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                key={mission.id}
                                className="flex flex-col items-stretch p-3 h-auto cursor-default"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getMissionIcon(mission.type)}
                                        <span className="ml-1 text-sm font-bold">
                                            {mission.title}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {mission.currentCount}/
                                        {mission.requiredCount}
                                    </div>
                                </div>
                                <div className="py-2">
                                    <Progress
                                        value={
                                            (mission.currentCount /
                                                mission.requiredCount) *
                                            100
                                        }
                                        className={`h-2
                                            ${mission.completed}
                                                ? 'bg-green-100'
                                                : ''`}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                                        <Coins className="h-3 w-3" />
                                        <span>{mission.coinReward} coins</span>
                                    </div>
                                    {mission.completed ? (
                                        mission.claimed ? (
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                <Check className="h-3 w-3" />
                                                <span>{t('claimed')}</span>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleClaimReward(
                                                        mission.id
                                                    )
                                                }
                                                className="h-7 text-xs bg-yellow-500 hover:bg-yellow-600 font-bold"
                                            >
                                                {t('claimReward')}
                                            </Button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </DropdownMenuGroup>
                </div>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
