'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/other-ui/Button'
import { Textarea } from '@/components/other-ui/Textarea'
import {
    Send,
    Bot,
    X,
    Minimize,
    Maximize,
    Coins,
    Info,
    Loader,
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/other-ui/Avatar'
import { useToast } from '@/components/other-ui/useToast'
import { useTranslations } from 'next-intl'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/other-ui/Tooltip'
import { useAuth } from '@/contexts/auth/AuthContext'
import { Badge } from '@/components/other-ui/Badge'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { MessageFormatter } from '@/components/utils/MessageFormatter'
import { signIn } from '@/contexts/auth/reducers'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface ChatAssistantProps {
    blogTitle: string
    blogId: string // Add blogId prop to fetch related chat messages
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
    blogTitle,
    blogId,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hi there! I'm your AI assistant for this article "${blogTitle}". Ask me anything about it!`,
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [showCoinWarning, setShowCoinWarning] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const { toast } = useToast()
    const t = useTranslations('blog.ChatAssistant')
    const { user, dispatch } = useAuth()
    const [coinBalance, setCoinBalance] = useState(user?.soLuongCoin) // Mock coin balance

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

    // Track questions asked in current session
    const [questionsAsked, setQuestionsAsked] = useState(0)

    // Load chat history from API
    const loadChatHistory = async () => {
        if (!blogId) return

        try {
            setIsLoadingHistory(true)
            const response = await authenticationService.getAllChatAssistants({
                blog_id: blogId,
                limit: 50, // Fetch a reasonable number of messages
            })

            if (
                response &&
                response.data &&
                response.data.results &&
                response.data.results.length > 0
            ) {
                // Transform API messages to our format, keeping our initial greeting
                const historyMessages = response.data.results
                    .map((msg: any) => ({
                        id: msg.id,
                        role: 'user' as const,
                        content: msg.cauHoi,
                        timestamp: new Date(msg.createdAt),
                    }))
                    .concat(
                        response.data.results.map((msg: any) => ({
                            id: `${msg.id}-response`,
                            role: 'assistant' as const,
                            content: msg.cauTraLoi,
                            timestamp: new Date(msg.updatedAt),
                        }))
                    )

                // Sort messages by timestamp
                historyMessages.sort(
                    (a: Message, b: Message) =>
                        a.timestamp.getTime() - b.timestamp.getTime()
                )

                // Update questionsAsked count
                setQuestionsAsked(response.data.results.length)

                // Combine initial greeting with loaded messages
                setMessages((prev) => {
                    const initialGreeting = prev[0] // Keep the first greeting message
                    return [initialGreeting, ...historyMessages]
                })
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
            toast({
                title: t('errorLoadingHistory'),
                description: t('tryAgainLater'),
                variant: 'destructive',
            })
        } finally {
            setIsLoadingHistory(false)
        }
    }

    // Load chat history when the component mounts and the chat is opened
    useEffect(() => {
        if (isOpen && user && blogId) {
            loadChatHistory()
        }
    }, [isOpen, user, blogId])

    // Auto-scroll to bottom when messages change with a small delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [messages])

    // Focus input when chat opens or after receiving a response
    useEffect(() => {
        if (isOpen && !isMinimized && !isLoading) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [isOpen, isMinimized, isLoading, messages.length])

    // Show coin warning when opening chat
    useEffect(() => {
        if (isOpen && messages.length === 1) {
            setShowCoinWarning(true)
            // Auto-hide the warning after 6 seconds
            const timer = setTimeout(() => {
                setShowCoinWarning(false)
            }, 6000)
            return () => clearTimeout(timer)
        }
    }, [isOpen, messages.length])

    const toggleChat = () => {
        setIsOpen(!isOpen)
        setIsMinimized(false)
    }

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return

        // Check for sufficient coin balance (5 coins per question)
        if (coinBalance && coinBalance < 5) {
            toast({
                title: t('insufficientCoins'),
                description: t('needMoreCoins'),
                variant: 'destructive',
            })
            return
        }

        // Create user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Deduct coins and update questions asked immediately to update UI
        setCoinBalance((prev) => prev && prev - 5)
        setQuestionsAsked((prev) => prev && prev + 1)

        try {
            // Call the API to get a response from the AI assistant
            const response = await authenticationService.askChatAssistant({
                blog_id: blogId,
                question: userMessage.content,
            })

            // Create assistant message from API response
            // Handle the specific response format provided in the sample
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    response.data?.data?.response ||
                    response.data?.cauTraLoi ||
                    t('errorResponse'),
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])
            handleSignIn()
        } catch (error) {
            console.error('Error getting AI response:', error)

            // Create error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    t('apiErrorMessage') ||
                    "Sorry, I couldn't process your request. Please try again.",
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, errorMessage])

            toast({
                title: t('errorTitle'),
                description: t('apiErrorDescription'),
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className={'fixed bottom-6 right-4 md:bottom-6 md:right-6 z-[49]'}>
            {/* Chat Button with notification badge */}
            {!isOpen && (
                <div className="relative">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className="rounded-full h-12 w-12 md:h-14 md:w-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg flex items-center justify-center transition-transform hover:scale-105 duration-300"
                                    onClick={toggleChat}
                                >
                                    <Bot className="h-5 w-5 md:h-6 md:w-6" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>{t('askAboutArticle')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center border-2 border-white animate-pulse">
                        AI
                    </span>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out border border-gray-200 animate-fadeInUp
                    ${
                        isMinimized
                            ? 'w-auto sm:w-auto'
                            : 'h-[500px] sm:h-[550px] w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] max-w-[400px]'
                    }`}
                >
                    {/* Chat Header - Fixed at the top */}
                    <div
                        className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                        ${isMinimized ? 'rounded-xl px-4' : 'px-3'} py-3 flex justify-between items-center sticky top-0 z-10`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 rounded-full p-1">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="font-medium flex items-center gap-2">
                                <span className="truncate max-w-[120px] sm:max-w-none">
                                    {isMinimized
                                        ? t('chatMinimizedTitle')
                                        : t('chatTitle')}
                                </span>
                                {isMinimized && (
                                    <Badge
                                        variant="outline"
                                        className="ml-1 bg-white/10 border-white/30 text-white text-xs py-0 px-2"
                                    >
                                        {coinBalance}{' '}
                                        {coinBalance === 1
                                            ? t('coin')
                                            : t('coins')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Hide minimize button on small screens */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:bg-white/20 rounded-full p-1 hidden md:flex"
                                onClick={toggleMinimize}
                            >
                                <div className="transition-transform duration-300">
                                    {isMinimized ? (
                                        <Maximize className="h-4 w-4" />
                                    ) : (
                                        <Minimize className="h-4 w-4" />
                                    )}
                                </div>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:bg-white/20 rounded-full p-1"
                                onClick={toggleChat}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content below header */}
                    {!isMinimized && (
                        <div className="flex flex-col h-[calc(100%-56px)]">
                            {/* Coin Balance Bar */}
                            <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium">
                                        {t('balance')}:{' '}
                                        <span className="text-indigo-600">
                                            {coinBalance}
                                        </span>
                                    </span>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center text-xs text-gray-500 cursor-help">
                                                <span className="mr-1">
                                                    {t('costPerQuestion')}
                                                </span>
                                                <Info className="h-3 w-3" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="left"
                                            className="max-w-xs"
                                        >
                                            <p>{t('coinExplanation')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Session Stats */}
                            <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-purple-50 text-purple-700 border-purple-200"
                                    >
                                        {t('questionsAsked')}: {questionsAsked}
                                    </Badge>
                                </div>
                                {user ? (
                                    <span className="text-xs text-green-600 flex items-center">
                                        <svg
                                            className="w-3 h-3 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="hidden sm:inline">
                                            {t('historySaved')}
                                        </span>
                                        <span className="inline sm:hidden">
                                            {t('saved')}
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-xs text-orange-600 flex items-center">
                                        <svg
                                            className="w-3 h-3 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="hidden sm:inline">
                                            {t('loginToSave')}
                                        </span>
                                        <span className="inline sm:hidden">
                                            {t('login')}
                                        </span>
                                    </span>
                                )}
                            </div>

                            {/* Coin Warning Banner */}
                            {showCoinWarning && (
                                <div className="mx-4 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center text-sm text-amber-800 animate-fadeIn">
                                    <Coins className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm">
                                        {t('coinWarning')}
                                    </p>
                                    <button
                                        onClick={() =>
                                            setShowCoinWarning(false)
                                        }
                                        className="ml-2 text-amber-700 hover:text-amber-900"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Loading history indicator */}
                            {isLoadingHistory && (
                                <div className="flex justify-center items-center p-4 text-sm text-gray-500">
                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                    {t('loadingHistory')}
                                </div>
                            )}

                            <div className="flex-grow overflow-y-auto px-4 pt-4 flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-3 shadow-sm
                                            ${
                                                msg.role === 'user'
                                                    ? 'bg-purple-100 text-gray-800 rounded-tr-none'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                            }`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src="/images/ai-avatar.jpg" />
                                                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                                            AI
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-medium text-indigo-600">
                                                        {t('assistantName')}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Use MessageFormatter instead of plain text */}
                                            <div className="text-sm">
                                                <MessageFormatter
                                                    text={msg.content}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 text-right">
                                                {msg.timestamp.toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start animate-fadeIn">
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage
                                                        src="/images/ai-avatar.jpg"
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                                        AI
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-indigo-600">
                                                    {t('assistantName')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1 items-center">
                                                    <div
                                                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '0ms',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '150ms',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '300ms',
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {t('thinking')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* This div is used as a reference for scrolling to bottom */}
                                <div
                                    ref={messagesEndRef}
                                    className="h-0 w-full"
                                />
                            </div>

                            {/* Chat Input - Fixed height */}
                            <div className="border-t border-gray-200 p-3 bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <Textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyPress}
                                        placeholder={t('askPlaceholder')}
                                        className="flex-1 min-h-[60px] max-h-[150px] py-3 px-4 resize-none rounded-xl border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        disabled={
                                            isLoading ||
                                            !coinBalance ||
                                            coinBalance < 5
                                        }
                                        rows={2}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={
                                            !input.trim() ||
                                            isLoading ||
                                            !coinBalance ||
                                            coinBalance < 5
                                        }
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 w-12 rounded-full flex-shrink-0 transition-transform hover:scale-105"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                                {/* <div className="mt-2 flex justify-between items-center">
                                    <div className="text-xs text-gray-500">
                                        {t('disclaimer')}
                                    </div>
                                    <div className="text-xs font-medium text-indigo-600">
                                        {coinBalance >= 5 ? (
                                            <span className="flex items-center">
                                                <Coins className="h-3 w-3 mr-1 text-amber-500" />
                                                -5 {t('perQuestion')}
                                            </span>
                                        ) : (
                                            <span className="text-red-500">
                                                {t('insufficientCoins')}
                                            </span>
                                        )}
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
