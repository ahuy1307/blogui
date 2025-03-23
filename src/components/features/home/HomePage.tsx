// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:38:16"
//

'use client'

import React from 'react'
import { useRef } from 'react'
import { FeaturesSection } from '../landing-page/FeaturesSection'
import { FeaturedArticlesSection } from '../landing-page/FeaturedArticlesSection'
import { NewsletterSection } from '../landing-page/NewsletterSection'
import { TestimonialsSection } from '../landing-page/TestimonialsSection'
import { HeroSection } from '../landing-page/HeroSection'
import { Footer } from './Footer'

const HomePage = () => {
    const newsletterRef = useRef<HTMLDivElement>(null)

    const scrollToNewsletter = () => {
        newsletterRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <main>
                <HeroSection onSubscribeClick={scrollToNewsletter} />
                <FeaturesSection />
                <FeaturedArticlesSection />
                <TestimonialsSection />
                <div ref={newsletterRef}>
                    <NewsletterSection />
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default HomePage
