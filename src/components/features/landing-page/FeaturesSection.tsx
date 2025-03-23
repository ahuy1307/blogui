'use client'

import { motion } from 'framer-motion'
import {
    Lightbulb,
    PenTool,
    Users,
    Award,
    Sparkles,
    BookOpen,
} from 'lucide-react'

export function FeaturesSection() {
    const features = [
        {
            icon: <Lightbulb className="h-6 w-6 text-purple-600" />,
            title: 'Cutting-Edge Insights',
            description:
                'Stay updated with the latest advancements in AI, machine learning, and deep learning technologies.',
        },
        {
            icon: <PenTool className="h-6 w-6 text-purple-600" />,
            title: 'Write & Publish',
            description:
                'Share your knowledge by writing and publishing articles on our platform with our easy-to-use editor.',
        },
        {
            icon: <Users className="h-6 w-6 text-purple-600" />,
            title: 'Community Engagement',
            description:
                'Engage with a community of AI enthusiasts through comments, likes, and discussions.',
        },
        {
            icon: <Award className="h-6 w-6 text-purple-600" />,
            title: 'Earn Rewards',
            description:
                'Complete missions and earn coins that can be redeemed for exclusive content and features.',
        },
        {
            icon: <Sparkles className="h-6 w-6 text-purple-600" />,
            title: 'AI-Powered Tools',
            description:
                'Use our AI-powered tools to generate blog ideas, improve your writing, and create engaging content.',
        },
        {
            icon: <BookOpen className="h-6 w-6 text-purple-600" />,
            title: 'Curated Content',
            description:
                "Discover curated articles organized by topics to help you find exactly what you're looking for.",
        },
    ]

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-3xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Why Choose{' '}
                        <span className="text-purple-600">NeuralPulse</span>
                    </motion.h2>
                    <motion.p
                        className="text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Our platform offers a comprehensive set of features
                        designed to enhance your AI learning and sharing
                        experience.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-purple-200"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
