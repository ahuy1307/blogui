'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import { useTranslations } from 'next-intl'
import { brandName } from '@/core/config/appConfig'

export function TestimonialsSection() {
    const t = useTranslations('landing.TestimonialsSection')

    const testimonials = [
        {
            id: 1,
            content: `${brandName} has been an invaluable resource for staying updated on AI advancements. The articles are well-researched and the community is incredibly supportive.`,
            author: 'Dr. Sarah Johnson',
            role: 'AI Researcher at Stanford',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        },
        {
            id: 2,
            content: `As someone new to the field of AI, ${brandName} has been my go-to platform for learning. The content is accessible yet in-depth, perfect for beginners and experts alike.`,
            author: 'Michael Chen',
            role: 'Software Engineer',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        },
        {
            id: 3,
            content:
                'The AI-powered writing tools have significantly improved my content creation process. I can now generate high-quality AI articles in half the time.',
            author: 'Emma Wilson',
            role: 'Content Creator',
            avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
        },
    ]

    const [activeIndex, setActiveIndex] = useState(0)

    const nextTestimonial = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
        setActiveIndex(
            (prev) => (prev - 1 + testimonials.length) % testimonials.length
        )
    }

    return (
        <section className="py-12 md:py-16 lg:py-20 bg-purple-50">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    className="text-center mb-8 md:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                        {t('whatOurUsersSay')}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto px-2">
                        {t('joinThousands')} {brandName}.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto relative">
                    <div className="hidden md:block absolute -top-10 -left-10 text-purple-200">
                        <Quote className="h-16 w-16 md:h-20 md:w-20" />
                    </div>

                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 md:p-8 lg:p-12 relative z-10"
                        key={activeIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-gray-700 text-base md:text-lg lg:text-xl italic mb-6 md:mb-8">
                            {testimonials[activeIndex].content}
                        </p>
                        <div className="flex items-center">
                            <div className="mr-4">
                                <Image
                                    src={
                                        testimonials[activeIndex].avatar ||
                                        '/images/default_image.jpg'
                                    }
                                    alt={testimonials[activeIndex].author}
                                    width={60}
                                    height={60}
                                    className="rounded-full w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    {testimonials[activeIndex].author}
                                </h4>
                                <p className="text-gray-600 text-xs md:text-sm">
                                    {testimonials[activeIndex].role}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex justify-center mt-6 md:mt-8 gap-3 md:gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevTestimonial}
                            className="rounded-full h-9 w-9 md:h-10 md:w-10 border-purple-200 text-purple-600 hover:bg-purple-100"
                        >
                            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <div className="flex gap-1 md:gap-2 items-center">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-2 rounded-full transition-all ${
                                        index === activeIndex
                                            ? 'w-5 md:w-6 bg-purple-600'
                                            : 'w-2 bg-purple-200'
                                    }`}
                                    onClick={() => setActiveIndex(index)}
                                />
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextTestimonial}
                            className="rounded-full h-9 w-9 md:h-10 md:w-10 border-purple-200 text-purple-600 hover:bg-purple-100"
                        >
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
