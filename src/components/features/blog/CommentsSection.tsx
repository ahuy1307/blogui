'use client'

import type React from 'react'

import { useState, useRef, memo } from 'react'
import { Button } from '@/components/other-ui/Button'
import { Textarea } from '@/components/other-ui/Textarea'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/other-ui/Avatar'
import { MessageCircle, CornerDownRight, Send, X, AtSign } from 'lucide-react'
import { useToast } from '@/components/other-ui/useToast'

interface CommentAuthor {
    name: string
    avatar: string
}

export interface Comment {
    id: number
    author: CommentAuthor
    content: string
    date: string
    replies?: Comment[]
    mentions?: string[]
}

interface CommentsSectionProps {
    comments: Comment[]
    onAddComment: (comment: Omit<Comment, 'id' | 'date'>) => void
    onAddReply: (parentId: number, reply: Omit<Comment, 'id' | 'date'>) => void
}

// Sample users for mentions
const SAMPLE_USERS = [
    {
        name: 'Alex Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        name: 'Emma Wilson',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        name: 'Michael Chen',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    {
        name: 'Sarah Parker',
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    },
    {
        name: 'David Kim',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    {
        name: 'Lisa Rodriguez',
        avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
    },
]

// Memoized CommentItem component to prevent unnecessary re-renders
const CommentItem = memo(
    ({
        comment,
        isReply = false,
        onReplyClick,
        replyingTo,
        replyContent,
        replyInputRef,
        handleInputChange,
        handleSubmitReply,
        setReplyContent,
        setReplyMentions,
        replyMentions,
    }: {
        comment: Comment
        isReply?: boolean
        onReplyClick: (id: number | null) => void
        replyingTo: number | null
        replyContent: string
        replyInputRef: React.RefObject<HTMLTextAreaElement>
        handleInputChange: (
            e: React.ChangeEvent<HTMLTextAreaElement>,
            type: 'comment' | 'reply'
        ) => void
        handleSubmitReply: (parentId: number) => void
        setReplyContent: React.Dispatch<React.SetStateAction<string>>
        setReplyMentions: React.Dispatch<React.SetStateAction<string[]>>
        replyMentions: string[]
    }) => {
        // Highlight mentioned users in the comment content
        const renderCommentContent = () => {
            if (!comment.mentions || comment.mentions.length === 0) {
                return <p className="text-gray-700 mb-3">{comment.content}</p>
            }

            let content = comment.content
            comment.mentions.forEach((mention) => {
                const mentionRegex = new RegExp(`@${mention}\\b`, 'g')
                content = content.replace(
                    mentionRegex,
                    `<span class="text-blue-600 font-medium">@${mention}</span>`
                )
            })

            return (
                <p
                    className="text-gray-700 mb-3"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )
        }

        return (
            <div
                className={`${isReply ? 'pl-6 border-l-2 border-gray-100 mt-4' : 'mb-6'}`}
            >
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={comment.author.avatar}
                                alt={comment.author.name}
                            />
                            <AvatarFallback>
                                {comment.author.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">
                                {comment.author.name}
                            </div>
                            <div className="text-xs text-gray-500">
                                {comment.date}
                            </div>
                        </div>
                    </div>
                    {renderCommentContent()}
                    {!isReply && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-purple-600"
                            onClick={() =>
                                onReplyClick(
                                    replyingTo === comment.id
                                        ? null
                                        : comment.id
                                )
                            }
                        >
                            <CornerDownRight className="h-4 w-4 mr-1" />
                            {replyingTo === comment.id
                                ? 'Cancel Reply'
                                : 'Reply'}
                        </Button>
                    )}
                </div>

                {replyingTo === comment.id && (
                    <div className="mt-3 pl-6">
                        <div className="flex gap-2 items-start">
                            <Avatar className="h-7 w-7 mt-2">
                                <AvatarImage
                                    src="https://randomuser.me/api/portraits/lego/1.jpg"
                                    alt="Your Avatar"
                                />
                                <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    ref={replyInputRef}
                                    value={replyContent}
                                    onChange={(e) =>
                                        handleInputChange(e, 'reply')
                                    }
                                    placeholder="Write a reply... (Use @ to mention someone)"
                                    className="min-h-[80px] mb-2"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            onReplyClick(null)
                                            setReplyContent('')
                                            setReplyMentions([])
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSubmitReply(comment.id)
                                        }
                                        disabled={!replyContent.trim()}
                                    >
                                        <Send className="h-4 w-4 mr-1" />
                                        Reply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Display replies if there are any */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-3 mt-2">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                isReply={true}
                                onReplyClick={onReplyClick}
                                replyingTo={replyingTo}
                                replyContent={replyContent}
                                replyInputRef={replyInputRef}
                                handleInputChange={handleInputChange}
                                handleSubmitReply={handleSubmitReply}
                                setReplyContent={setReplyContent}
                                setReplyMentions={setReplyMentions}
                                replyMentions={replyMentions}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }
)

CommentItem.displayName = 'CommentItem'

export function CommentsSection({
    comments = [],
    onAddComment,
    onAddReply,
}: CommentsSectionProps) {
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [mentionQuery, setMentionQuery] = useState('')
    const [showMentions, setShowMentions] = useState(false)
    const [mentionAnchorPos, setMentionAnchorPos] = useState({
        top: 0,
        left: 0,
    })
    const [currentInputRef, setCurrentInputRef] = useState<'comment' | 'reply'>(
        'comment'
    )
    const { toast } = useToast()

    const commentInputRef = useRef<HTMLTextAreaElement>(null)
    const replyInputRef = useRef<HTMLTextAreaElement>(null)

    // Track mentions in the current comment/reply
    const [commentMentions, setCommentMentions] = useState<string[]>([])
    const [replyMentions, setReplyMentions] = useState<string[]>([])

    // Handle @ mentions
    const handleInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
        inputType: 'comment' | 'reply'
    ) => {
        const value = e.target.value

        if (inputType === 'comment') {
            setNewComment(value)
        } else {
            setReplyContent(value)
        }

        // Check for @ symbol
        const lastAtIndex = value.lastIndexOf('@')
        if (
            lastAtIndex !== -1 &&
            (lastAtIndex === 0 || value[lastAtIndex - 1] === ' ')
        ) {
            const query = value.substring(lastAtIndex + 1).split(' ')[0]
            setMentionQuery(query)
            setCurrentInputRef(inputType)

            if (query && query.length > 0) {
                // Position the mention popover
                const textarea =
                    inputType === 'comment'
                        ? commentInputRef.current
                        : replyInputRef.current
                if (textarea) {
                    const cursorPosition = textarea.selectionStart
                    const textBeforeCursor = value.substring(0, cursorPosition)
                    const lines = textBeforeCursor.split('\n')
                    const currentLine = lines[lines.length - 1]

                    // Calculate position based on textarea
                    const rect = textarea.getBoundingClientRect()
                    const lineHeight = Number.parseInt(
                        getComputedStyle(textarea).lineHeight
                    )
                    const lineCount = lines.length - 1

                    setMentionAnchorPos({
                        top: rect.top + lineHeight * lineCount + window.scrollY,
                        left: rect.left + currentLine.length * 8, // Approximate character width
                    })
                }

                setShowMentions(true)
            } else {
                setShowMentions(false)
            }
        } else {
            setShowMentions(false)
        }
    }

    const insertMention = (user: (typeof SAMPLE_USERS)[0]) => {
        const inputValue =
            currentInputRef === 'comment' ? newComment : replyContent
        const lastAtIndex = inputValue.lastIndexOf('@')

        if (lastAtIndex !== -1) {
            const beforeMention = inputValue.substring(0, lastAtIndex)
            const afterMention = inputValue.substring(
                lastAtIndex + mentionQuery.length + 1
            )
            const newValue = `${beforeMention}@${user.name} ${afterMention}`

            if (currentInputRef === 'comment') {
                setNewComment(newValue)
                setCommentMentions([...commentMentions, user.name])
                setTimeout(() => commentInputRef.current?.focus(), 0)
            } else {
                setReplyContent(newValue)
                setReplyMentions([...replyMentions, user.name])
                setTimeout(() => replyInputRef.current?.focus(), 0)
            }
        }

        setShowMentions(false)
    }

    const handleSubmitComment = () => {
        if (!newComment.trim()) return

        onAddComment({
            author: {
                name: 'You',
                avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
            },
            content: newComment,
            mentions: commentMentions.length > 0 ? commentMentions : undefined,
        })

        setNewComment('')
        setCommentMentions([])

        toast({
            title: 'Comment posted',
            description: 'Your comment has been added to the discussion.',
        })
    }

    const handleSubmitReply = (parentId: number) => {
        if (!replyContent.trim()) return

        onAddReply(parentId, {
            author: {
                name: 'You',
                avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
            },
            content: replyContent,
            mentions: replyMentions.length > 0 ? replyMentions : undefined,
        })

        setReplyContent('')
        setReplyingTo(null)
        setReplyMentions([])

        toast({
            title: 'Reply posted',
            description: 'Your reply has been added to the comment.',
        })
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments (
                {comments.reduce(
                    (count, comment) =>
                        count + 1 + (comment.replies?.length || 0),
                    0
                )}
                )
            </h3>

            {/* Add comment form */}
            <div className="mb-8">
                <Textarea
                    ref={commentInputRef}
                    placeholder="Add your thoughts... (Use @ to mention someone)"
                    className="mb-3 min-h-[100px]"
                    value={newComment}
                    onChange={(e) => handleInputChange(e, 'comment')}
                />
                <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                </Button>
            </div>

            {/* Comments list with nested replies */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onReplyClick={setReplyingTo}
                        replyingTo={replyingTo}
                        replyContent={replyContent}
                        replyInputRef={replyInputRef}
                        handleInputChange={handleInputChange}
                        handleSubmitReply={handleSubmitReply}
                        setReplyContent={setReplyContent}
                        setReplyMentions={setReplyMentions}
                        replyMentions={replyMentions}
                    />
                ))}
            </div>

            {/* Mentions popover */}
            {showMentions && (
                <div
                    className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 w-64"
                    style={{
                        top: `${mentionAnchorPos.top + 20}px`,
                        left: `${mentionAnchorPos.left}px`,
                    }}
                >
                    <div className="p-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <AtSign className="h-3 w-3" />
                            <span>Mention a user</span>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                            {SAMPLE_USERS.filter((user) =>
                                mentionQuery
                                    ? user.name
                                          .toLowerCase()
                                          .includes(mentionQuery.toLowerCase())
                                    : true
                            ).map((user) => (
                                <div
                                    key={user.name}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={() => insertMention(user)}
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                        <AvatarFallback>
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{user.name}</span>
                                </div>
                            ))}

                            {SAMPLE_USERS.filter((user) =>
                                mentionQuery
                                    ? user.name
                                          .toLowerCase()
                                          .includes(mentionQuery.toLowerCase())
                                    : true
                            ).length === 0 && (
                                <div className="p-2 text-sm text-gray-500">
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
