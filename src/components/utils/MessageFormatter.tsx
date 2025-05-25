import React from 'react'

interface MessageFormatterProps {
    text: string
}

export const MessageFormatter: React.FC<MessageFormatterProps> = ({ text }) => {
    // Function to process text and convert markdown-like syntax
    const formatText = (content: string) => {
        // Handle section titles like "1. **Title**:" - Modified to preserve the colon
        const sectionTitleRegex = /^(\d+\.\s+)?\*\*(.*?)\*\*(:?)(.*)$/
        const match = content.match(sectionTitleRegex)

        if (match) {
            const [_, number, title, colon, restOfContent] = match
            return (
                <div className="mb-3">
                    <p>
                        {number && <span>{number}</span>}
                        <strong className="font-bold">{title}</strong>
                        {colon && <span>{colon}</span>}
                        {restOfContent && <span>{restOfContent}</span>}
                    </p>
                </div>
            )
        }

        // Split the text by newlines to handle paragraphs
        const paragraphs = content.split('\n\n')

        return paragraphs.map((paragraph, index) => {
            // Handle numbered list items (e.g., "1. Item")
            const listMatch = paragraph.match(/^(\d+)\.\s(.+)$/)
            if (listMatch) {
                return (
                    <li key={index} className="ml-6 list-decimal">
                        {processInlineFormatting(listMatch[2])}
                    </li>
                )
            }

            // Handle bullet points (e.g., "• Item" or "* Item")
            const bulletMatch = paragraph.match(/^[\•\*]\s(.+)$/)
            if (bulletMatch) {
                return (
                    <li key={index} className="ml-6 list-disc">
                        {processInlineFormatting(bulletMatch[1])}
                    </li>
                )
            }

            // Handle regular paragraphs with better bold detection
            return (
                <p key={index} className="mb-3">
                    {processInlineFormatting(paragraph)}
                </p>
            )
        })
    }

    // Process inline formatting like bold, italic, etc.
    const processInlineFormatting = (text: string) => {
        if (!text) return null

        // Enhanced regex for bold detection that also captures text after asterisks including colons
        const parts = []
        let currentText = text
        let boldMatch

        // Regex to find **text** pattern and preserve any characters that follow
        const boldRegex = /\*\*([^*]+)\*\*([:]?)/g

        let lastIndex = 0
        while ((boldMatch = boldRegex.exec(text)) !== null) {
            // Add text before the match
            if (boldMatch.index > lastIndex) {
                parts.push(text.substring(lastIndex, boldMatch.index))
            }

            // Add the bold text with the colon if present
            parts.push(
                <strong key={`bold-${boldMatch.index}`} className="font-bold">
                    {boldMatch[1]}
                </strong>
            )

            // Add the colon separately if it exists
            if (boldMatch[2]) {
                parts.push(boldMatch[2])
            }

            lastIndex = boldMatch.index + boldMatch[0].length
        }

        // Add any remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex))
        }

        return parts.length ? parts : text
    }

    return <div className="prose prose-sm max-w-none">{formatText(text)}</div>
}
