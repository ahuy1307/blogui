'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/other-ui/Input'
import { Button } from '@/components/other-ui/Button'
import { useToast } from '@/components/other-ui/useToast'
import { useTranslations } from 'next-intl'

export function NewsletterSection() {
    const t = useTranslations('landing.NewsletterSection')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubscribe = async (e: FormEvent) => {
        e.preventDefault()

        if (!email || !email.includes('@')) {
            toast({
                title: t('invalidEmail'),
                description: t('invalidEmailDescription'),
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)

        // Simulate subscription process
        setTimeout(() => {
            toast({
                title: t('subscribed'),
                description: t('subscribedDescription'),
            })
            setEmail('')
            setIsSubmitting(false)
        }, 1000)
    }

    return (
        <section id="newsletter" className="py-20 bg-purple-600 text-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {t('stayUpdated')}
                    </h2>
                    <p className="text-purple-100 mb-8 text-lg">
                        {t('joinCommunity')}
                    </p>

                    <form
                        onSubmit={handleSubscribe}
                        className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                    >
                        <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-purple-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            // required
                        />
                        <Button
                            type="submit"
                            className="bg-white text-purple-700 hover:bg-purple-100 whitespace-nowrap"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('subscribing') : t('subscribe')}
                        </Button>
                    </form>

                    <p className="text-purple-200 text-sm mt-4">
                        {t('privacy')}
                    </p>
                </div>
            </div>
        </section>
    )
}
