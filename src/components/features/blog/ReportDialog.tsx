'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/other-ui/Dialog'
import { Button } from '@/components/other-ui/Button'
import { Label } from '@/components/other-ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/other-ui/RadioGroup'
import { Textarea } from '@/components/other-ui/Textarea'
import { useToast } from '@/components/other-ui/useToast'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useTranslations } from 'next-intl'

interface ReportDialogProps {
    isOpen: boolean
    onClose: () => void
    blogId: string
}

export function ReportDialog({ isOpen, onClose, blogId }: ReportDialogProps) {
    const t = useTranslations('blog.ReportDialog')
    const [reason, setReason] = useState('0')
    const [details, setDetails] = useState('')
    const { toast } = useToast()

    const { data } = useQuery({
        queryKey: [],
        queryFn: async () => {
            const response = await authenticationService.getBlogReportOptions()
            return response.data
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            await authenticationService.reportBlog({
                baiViet: blogId,
                loaiBaoCao: Number(reason),
                lyDoBaoCao: details,
            })
        },
        onSuccess: () => {
            toast({
                title: t('successTitle'),
                description: t('successDescription'),
            })
            // Reset form and close dialog after successful submission
            setReason('0')
            setDetails('')
            onClose()
        },
        onError: (error: any) => {
            toast({
                title: t('reportErrorTitle'),
                description: error.response.data.errors.other[0],
                variant: 'destructive',
            })
        },
    })

    const handleSubmit = () => {
        if (!reason) {
            toast({
                title: t('missingReasonTitle'),
                description: t('missingReasonDescription'),
                variant: 'destructive',
            })
            return
        }

        // Only call mutate - form reset moved to onSuccess
        mutate()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] w-[360px] sm:w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>{t('reasonLabel')}</Label>
                        <RadioGroup
                            value={reason}
                            onValueChange={setReason}
                            className="pt-2"
                        >
                            {data &&
                                data.length > 0 &&
                                data.map((item: any) => (
                                    <div
                                        key={item.key.toString()}
                                        className="flex items-center space-x-2 pt-2 cursor-pointer"
                                    >
                                        <RadioGroupItem
                                            value={item.key.toString()}
                                            id={item.key.toString()}
                                        />
                                        <Label htmlFor={item.key.toString()}>
                                            {item.value}
                                        </Label>
                                    </div>
                                ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2 pt-4">
                        <Label htmlFor="details">{t('detailsLabel')}</Label>
                        <Textarea
                            id="details"
                            placeholder={t('detailsPlaceholder')}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending
                            ? t('submitting', { defaultValue: 'Submitting...' })
                            : t('submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
