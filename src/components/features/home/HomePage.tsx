// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:38:16"
//

'use client'

import React from 'react'
import { useRef, useEffect } from 'react'
import { FeaturesSection } from '../landing-page/FeaturesSection'
import { NewsletterSection } from '../landing-page/NewsletterSection'
import { TestimonialsSection } from '../landing-page/TestimonialsSection'
import { HeroSection } from '../landing-page/HeroSection'
import { Footer } from './Footer'
import { useAppData } from '@/contexts/AppDataProvider'
import { FeaturedBlogSection } from '../landing-page/FeaturedBlogSection'
import Header from './Header'
import { Toaster } from '@/components/other-ui/Toaster'

const HomePage = () => {
    const newsletterRef = useRef<HTMLDivElement>(null)
    const { topics, isLoading, error } = useAppData()

    const scrollToNewsletter = () => {
        newsletterRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 sm:mt-[80px] md:mt-0">
            <Header />
            <Toaster />
            <div className="flex flex-col w-full">
                <HeroSection onSubscribeClick={scrollToNewsletter} />
                <FeaturesSection />
                <FeaturedBlogSection />
                <TestimonialsSection />
                <div ref={newsletterRef} className="w-full">
                    <NewsletterSection />
                </div>
            </div>

            <Footer topics={topics.slice(0, 6)} />
        </div>
    )
}

export default HomePage
