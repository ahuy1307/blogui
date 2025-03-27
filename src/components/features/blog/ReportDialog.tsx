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

interface ReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

const REPORT_REASONS = [
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'spam', label: 'Spam or misleading' },
    { id: 'offensive', label: 'Offensive or harmful' },
    { id: 'copyright', label: 'Copyright violation' },
    { id: 'factual', label: 'Factual inaccuracy' },
    { id: 'other', label: 'Other reason' },
]

export function ReportDialog({ isOpen, onClose }: ReportDialogProps) {
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')
    const { toast } = useToast()

    const handleSubmit = () => {
        if (!reason) {
            toast({
                title: 'Please select a reason',
                description: 'You must select a reason for your report',
                variant: 'destructive',
            })
            return
        }

        // In a real app, you would send this to your backend
        console.log('Report submitted:', { reason, details })

        toast({
            title: 'Report submitted',
            description:
                'Thank you for your feedback. Our team will review this content.',
        })

        // Reset form and close dialog
        setReason('')
        setDetails('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report Content</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Reason for reporting</Label>
                        <RadioGroup value={reason} onValueChange={setReason}>
                            {REPORT_REASONS.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center space-x-2"
                                >
                                    <RadioGroupItem
                                        value={item.id}
                                        id={item.id}
                                    />
                                    <Label htmlFor={item.id}>
                                        {item.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="details">
                            Additional details (optional)
                        </Label>
                        <Textarea
                            id="details"
                            placeholder="Please provide any additional information that might help us understand the issue"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Submit Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
