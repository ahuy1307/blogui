'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/other-ui/input'
import { Button } from '@/components/other-ui/button'
import { useToast } from '@/components/other-ui/use-toast'

export function NewsletterSection() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubscribe = async (e: FormEvent) => {
        e.preventDefault()

        if (!email || !email.includes('@')) {
            toast({
                title: 'Invalid email',
                description: 'Please enter a valid email address.',
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)

        // Simulate subscription process
        setTimeout(() => {
            toast({
                title: 'Subscription successful!',
                description: 'Thank you for subscribing to our newsletter.',
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
                        Stay Updated with AI Advancements
                    </h2>
                    <p className="text-purple-100 mb-8 text-lg">
                        Subscribe to our newsletter to receive the latest
                        insights on AI advancements, tutorials, and industry
                        news.
                    </p>

                    <form
                        onSubmit={handleSubscribe}
                        className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                    >
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-purple-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="bg-white text-purple-700 hover:bg-purple-100 whitespace-nowrap"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                    </form>

                    <p className="text-purple-200 text-sm mt-4">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </section>
    )
}
