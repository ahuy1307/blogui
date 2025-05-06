'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/other-ui/Button'
import { Textarea } from '@/components/other-ui/Textarea'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/other-ui/Avatar'
import {
    MessageCircle,
    CornerDownRight,
    Send,
    X,
    Edit2,
    Trash2,
    Smile,
} from 'lucide-react'
import { useToast } from '@/components/other-ui/useToast'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/other-ui/DropdownMenu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/other-ui/AlertDialog'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/other-ui/Popover'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation } from '@tanstack/react-query'
import { set } from 'nprogress'
import { comment } from 'postcss'
import { useAuth } from '@/contexts/auth/AuthContext'
import { useTranslations } from 'next-intl'
import { useMissions } from '@/hooks/useMissions'

interface CommentUser {
    id: string
    ho: string
    ten: string
    avatar: string
}

export interface CommentData {
    id: string
    nguoiDung: CommentUser
    baiViet: string
    noiDungBinhLuan: string
    binhLuanCha?: string
    binhLuanReply?: {
        id: string
        nguoiDung: CommentUser
    }
    createdAt: string
    updatedAt: string
    binhLuanCuaBan?: boolean
    totalChild: number // Add this property to track total child comments
}

interface CommentsSectionProps {
    comments?: CommentData[]
    postId?: string
    refetchComment: () => void
}

// Format date to relative time
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 604800)} weeks ago`

    return date.toLocaleDateString()
}

// Comment item component
const CommentItem = ({
    comment,
    isReply = false,
    onReplyClick,
    replyingTo,
    replyContent,
    replyInputRef,
    handleInputChange,
    handleSubmitReply,
    setReplyContent,
    allComments,
    onEditComment,
    onDeleteComment,
    handleEmojiSelect,
}: {
    comment: CommentData
    isReply?: boolean
    onReplyClick: (id: string | null) => void
    replyingTo: string | null
    replyContent: string
    replyInputRef: React.RefObject<HTMLTextAreaElement>
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSubmitReply: (parentId: string) => void
    setReplyContent: React.Dispatch<React.SetStateAction<string>>
    allComments: CommentData[]
    onEditComment: (id: string, content: string) => void
    onDeleteComment: (id: string) => void
    handleEmojiSelect: (
        emoji: any,
        inputType: 'comment' | 'reply' | 'edit'
    ) => void
}) => {
    const t = useTranslations('blog.Comment')
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.noiDungBinhLuan)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const editInputRef = useRef<HTMLTextAreaElement>(null)
    const { user } = useAuth()

    // Find the user being replied to
    const findReplyUser = () => {
        if (!comment.binhLuanReply) return null

        const replyToId = comment.binhLuanReply.id
        return comment.binhLuanReply.nguoiDung
    }

    const replyToUser = findReplyUser()

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus()
        }
    }, [isEditing])

    const handleEditSubmit = () => {
        if (editContent.trim()) {
            onEditComment(comment.id, editContent)
            setIsEditing(false)
        }
    }

    const handleEmojiSelectForEdit = (emoji: any) => {
        handleEmojiSelect(emoji, 'edit')
        setEditContent((prev) => prev + emoji.native)
    }

    return (
        <div
            className={`${isReply ? 'pl-6 border-l-2 border-gray-100 mt-4' : 'mb-6'}`}
        >
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={
                                comment.nguoiDung.avatar ||
                                '/images/default_avatar.jpg'
                            }
                            alt={`alt`}
                        />
                        <AvatarFallback>
                            {comment.nguoiDung.ho.charAt(0).toUpperCase()}
                            {comment.nguoiDung.ten.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <div className="font-medium text-base">
                            {user && comment.binhLuanCuaBan ? (
                                <span className="text-purple-600">
                                    {t('you')}
                                </span>
                            ) : (
                                `${comment.nguoiDung.ho} ${comment.nguoiDung.ten}`
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            {formatRelativeTime(comment.createdAt)}
                        </div>
                    </div>
                </div>

                {isReply && replyToUser && (
                    <div className="mb-2 text-sm text-gray-500">
                        <span className="font-medium">
                            {t('replyingTo')} {replyToUser.ho} {replyToUser.ten}
                        </span>
                    </div>
                )}

                {isEditing ? (
                    <div className="mb-3">
                        <Textarea
                            ref={editInputRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[80px] mb-2"
                        />
                        <div className="flex justify-between items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-80 p-0 mt-[340px]"
                                    side="right"
                                >
                                    <Picker
                                        data={data}
                                        onEmojiSelect={handleEmojiSelectForEdit}
                                        theme="light"
                                    />
                                </PopoverContent>
                            </Popover>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditContent(comment.noiDungBinhLuan)
                                    }}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    {t('cancel')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleEditSubmit}
                                    disabled={!editContent.trim()}
                                >
                                    <Send className="h-4 w-4 mr-1" />
                                    {t('save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 mb-2 mt-6 whitespace-pre-wrap">
                        {comment.noiDungBinhLuan}
                    </p>
                )}

                {!isEditing && (
                    <div className="flex items-center gap-2">
                        {user && (
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
                                {t('reply')}
                            </Button>
                        )}

                        {user && comment.binhLuanCuaBan && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-purple-600"
                                    >
                                        •••
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        {t('edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteAlert(true)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t('delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                )}
            </div>

            {replyingTo === comment.id && (
                <div className="mt-4 pl-6">
                    <div className="flex gap-8 items-start">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={
                                    user?.avatar || '/images/default_avatar.jpg'
                                }
                                alt={user?.ten.charAt(0).toUpperCase()}
                            />
                            <AvatarFallback>
                                {user?.ho.charAt(0).toUpperCase()}
                                {user?.ten.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-2 text-sm text-gray-500">
                                <span className="font-medium">
                                    {t('replyingTo')} {comment.nguoiDung.ho}{' '}
                                    {comment.nguoiDung.ten}
                                </span>
                            </div>
                            <Textarea
                                ref={replyInputRef}
                                value={replyContent}
                                onChange={handleInputChange}
                                placeholder="Write a reply..."
                                className="min-h-[80px] mb-2"
                            />
                            <div className="flex justify-between items-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <Smile className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-80 p-0"
                                        align="start"
                                    >
                                        <Picker
                                            data={data}
                                            onEmojiSelect={(emoji: any) =>
                                                handleEmojiSelect(
                                                    emoji,
                                                    'reply'
                                                )
                                            }
                                            theme="light"
                                        />
                                    </PopoverContent>
                                </Popover>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            onReplyClick(null)
                                            setReplyContent('')
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSubmitReply(comment.id)
                                        }
                                        disabled={!replyContent.trim()}
                                    >
                                        <Send className="h-4 w-4 mr-1" />
                                        {t('reply')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AlertDialog
                open={showDeleteAlert}
                onOpenChange={setShowDeleteAlert}
            >
                <AlertDialogContent style={{ borderRadius: '12px' }}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('deleteConfirm')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteConfirmSubText')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                        style={{
                            marginTop: '24px',
                        }}
                    >
                        <AlertDialogCancel style={{ borderRadius: '8px' }}>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            style={{ borderRadius: '8px' }}
                            onClick={() => onDeleteComment(comment.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export function CommentsSection({
    comments = [],
    postId = '1',
    refetchComment,
}: CommentsSectionProps) {
    // Group comments by parent
    const t = useTranslations('blog.Comment')
    const [parentComments, setParentComments] = useState<CommentData[]>([])
    const [childComments, setChildComments] = useState<
        Record<string, CommentData[]>
    >({})

    // Add state to track which comments have expanded replies
    const [expandedComments, setExpandedComments] = useState<Set<string>>(
        new Set()
    )
    const [loadingChildComments, setLoadingChildComments] = useState<
        Set<string>
    >(new Set())

    // Add state to track pagination and total counts
    const [childCommentsPagination, setChildCommentsPagination] = useState<
        Record<string, { page: number; totalCount: number }>
    >({})

    // State to track total child comments per parent
    const [totalChildComments, setTotalChildComments] = useState<
        Record<string, number>
    >({})

    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [currentInputType, setCurrentInputType] = useState<
        'comment' | 'reply' | 'edit'
    >('comment')
    const { toast } = useToast()
    const { user } = useAuth()

    const commentInputRef = useRef<HTMLTextAreaElement>(null)
    const replyInputRef = useRef<HTMLTextAreaElement>(null)

    // Process comments into parent and child groups
    useEffect(() => {
        const parents: CommentData[] = []

        comments &&
            comments.forEach((comment) => {
                // All passed comments are parent comments
                parents.push(comment)

                // Initialize totalChildComments from comment data if available
                if (
                    comment.totalChild !== undefined &&
                    comment.totalChild > 0
                ) {
                    setTotalChildComments((prev) => ({
                        ...prev,
                        [comment.id]: comment.totalChild,
                    }))
                }
            })

        setParentComments(parents)
        if (user) refetchComment()

        const timeoutId = setTimeout(() => {
            refetchComment()
        }, 60000) // Refetch comments after 1 minute

        // Clear the timeout when the component unmounts or when comments change
        return () => clearTimeout(timeoutId)
    }, [comments, refetchComment, user])

    // Function to fetch child comments with improved pagination handling
    const { mutate: fetchChildComments } = useMutation({
        mutationFn: async ({
            parentId,
            page = 1,
            limit = 10, // Default limit per page
        }: {
            parentId: string
            page?: number
            limit?: number
        }) => {
            const response = await authenticationService.getAllChildComments({
                blog_id: postId,
                comment_id: parentId,
                page,
                limit,
            })
            return {
                parentId,
                data: response.data.results,
                totalCount: response.data.count,
                page,
                limit,
            }
        },
        onSuccess: (result) => {
            const { parentId, data, totalCount, page, limit } = result

            // Update the child comments state
            setChildComments((prev) => {
                // If it's the first page, replace the array
                // Otherwise, append to existing comments
                const existingComments = page === 1 ? [] : prev[parentId] || []
                return {
                    ...prev,
                    [parentId]: [...existingComments, ...data],
                }
            })

            // Update pagination state with the correct total count
            setChildCommentsPagination((prev) => ({
                ...prev,
                [parentId]: { page, totalCount },
            }))

            // Update total child comments count
            setTotalChildComments((prev) => ({
                ...prev,
                [parentId]: totalCount,
            }))

            setLoadingChildComments((prev) => {
                const newSet = new Set(prev)
                newSet.delete(parentId)
                return newSet
            })
        },
        onError: (error, variables) => {
            const { parentId } = variables
            toast({
                title: t('error'),
                description: t('errorLoadingComments'),
                variant: 'destructive',
            })
            setLoadingChildComments((prev) => {
                const newSet = new Set(prev)
                newSet.delete(parentId)
                return newSet
            })
            setExpandedComments((prev) => {
                const newSet = new Set(prev)
                newSet.delete(parentId)
                return newSet
            })
        },
    })

    // Toggle function to expand/collapse child comments
    const toggleChildComments = (parentId: string) => {
        setExpandedComments((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(parentId)) {
                newSet.delete(parentId)
            } else {
                newSet.add(parentId)
                // Always fetch the latest child comments when expanding
                setLoadingChildComments((prev) => new Set(prev).add(parentId))
                fetchChildComments({ parentId, page: 1 })
            }
            return newSet
        })
    }

    // Function to load more child comments with proper pagination
    const loadMoreChildComments = (parentId: string) => {
        const pagination = childCommentsPagination[parentId]
        if (!pagination) return

        // Calculate the next page
        const nextPage = pagination.page + 1
        setLoadingChildComments((prev) => new Set(prev).add(parentId))

        fetchChildComments({
            parentId,
            page: nextPage,
        })
    }

    // Get the remaining reply count for a comment - fixed calculation
    const getRemainingReplyCount = (parentId: string) => {
        const pagination = childCommentsPagination[parentId]
        // If no pagination info yet, check if we have a count from another source
        if (!pagination) {
            // Default to the child comment count or 0 if none
            return childComments[parentId]?.length || 0
        }

        const loadedCount = childComments[parentId]?.length || 0
        // Calculate remaining
        const remaining = Math.max(0, pagination.totalCount - loadedCount)

        return remaining
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setNewComment(value)
    }

    const handleReplyInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const value = e.target.value
        setReplyContent(value)
        setCurrentInputType('reply')
    }

    const handleEmojiSelect = (
        emoji: any,
        inputType: 'comment' | 'reply' | 'edit'
    ) => {
        setCurrentInputType(inputType)

        if (inputType === 'comment') {
            setNewComment((prev) => prev + emoji.native)
        } else if (inputType === 'reply') {
            setReplyContent((prev) => prev + emoji.native)
        }
        // "edit" case is handled in the CommentItem component
    }

    const { mutate: postComment } = useMutation({
        mutationFn: async (newComment: any) => {
            const response = await authenticationService.addComment({
                blog_id: postId,
                noiDungBinhLuan: newComment.noiDungBinhLuan,
                binhLuan: newComment.binhLuan,
            })
            return { data: response.data, commentData: newComment }
        },
        onSuccess: (result, variables) => {
            fetchUserTasks()
            const { data, commentData } = result

            // If this is a reply comment (has binhLuan property)
            if (commentData.binhLuan) {
                // Get the parent ID from the input
                const parentId = commentData.binhLuan

                // If the API response contains binhLuanCha, use it to fetch child comments
                if (data.binhLuanCha) {
                    // This is the key change: use the binhLuanCha from the API response
                    // to identify which parent's children we need to refresh
                    const parentCommentId = data.binhLuanCha

                    if (expandedComments.has(parentCommentId)) {
                        // Parent already expanded, refresh child comments
                        setLoadingChildComments((prev) =>
                            new Set(prev).add(parentCommentId)
                        )
                        fetchChildComments({
                            parentId: parentCommentId,
                            page: 1,
                        })
                    } else {
                        // Auto-expand parent and fetch child comments
                        setExpandedComments((prev) =>
                            new Set(prev).add(parentCommentId)
                        )
                        setLoadingChildComments((prev) =>
                            new Set(prev).add(parentCommentId)
                        )
                        fetchChildComments({
                            parentId: parentCommentId,
                            page: 1,
                        })
                    }
                } else {
                    // Fallback to the original parent ID if binhLuanCha is not in the response
                    if (expandedComments.has(parentId)) {
                        setLoadingChildComments((prev) =>
                            new Set(prev).add(parentId)
                        )
                        fetchChildComments({ parentId, page: 1 })
                    } else {
                        setExpandedComments((prev) =>
                            new Set(prev).add(parentId)
                        )
                        setLoadingChildComments((prev) =>
                            new Set(prev).add(parentId)
                        )
                        fetchChildComments({ parentId, page: 1 })
                    }
                }

                // Don't call refetchComment() for replies
            } else {
                // For top-level comments, do a full refetch
                refetchComment()
            }

            toast({
                title: t('commentAdded'),
                description: t('commentAddedSubText'),
            })
        },
        onError: () => {
            toast({
                title: t('error'),
                description: t('errorAddingComment'),
                variant: 'destructive',
            })
        },
    })
    const { fetchUserTasks } = useMissions()

    const handleSubmitComment = () => {
        if (!newComment.trim()) return

        postComment({
            noiDungBinhLuan: newComment,
        })

        setNewComment('')
    }

    const handleSubmitReply = (parentId: string) => {
        postComment({
            noiDungBinhLuan: replyContent,
            binhLuan: parentId,
        })

        setReplyContent('')
        setReplyingTo(null)
    }

    const { mutate: editComment } = useMutation({
        mutationFn: async (comment: any) => {
            const response = await authenticationService.updateComment({
                blog_id: postId,
                comment_id: comment.id,
                noiDungBinhLuan: comment.noiDungBinhLuan,
            })
            return response.data
        },
        onSuccess: (data, variables) => {
            // Update UI optimistically
            const { id, noiDungBinhLuan } = variables

            // Check if it's a child comment
            let isChild = false
            let parentId = ''

            // Loop through all child comments to find if this is a child comment
            Object.entries(childComments).forEach(([pId, children]) => {
                if (children.some((child) => child.id === id)) {
                    isChild = true
                    parentId = pId
                }
            })

            if (isChild && parentId) {
                // Update the child comment in state
                setChildComments((prev) => {
                    const updatedChildren = prev[parentId].map((child) =>
                        child.id === id ? { ...child, noiDungBinhLuan } : child
                    )

                    return {
                        ...prev,
                        [parentId]: updatedChildren,
                    }
                })
            }

            toast({
                title: t('commentUpdated'),
                description: t('commentUpdatedSubText'),
            })

            // Still refetch to ensure consistency with server data
            refetchComment()
        },
        onError: () => {
            toast({
                title: t('error'),
                description: t('errorUpdatingComment'),
                variant: 'destructive',
            })
            refetchComment()
        },
    })

    const { mutate: deleteComment } = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await authenticationService.deleteComment({
                blog_id: postId,
                comment_id: commentId,
            })
            return response.data
        },
        onSuccess: (_, commentId) => {
            // Check if it's a child comment
            let isChild = false
            let parentId = ''

            // Loop through all child comments to find if this is a child comment
            Object.entries(childComments).forEach(([pId, children]) => {
                if (children.some((child) => child.id === commentId)) {
                    isChild = true
                    parentId = pId
                }
            })

            if (isChild && parentId) {
                // Remove the child comment from state
                setChildComments((prev) => {
                    const updatedChildren = prev[parentId].filter(
                        (child) => child.id !== commentId
                    )

                    return {
                        ...prev,
                        [parentId]: updatedChildren,
                    }
                })

                // Update pagination count
                setChildCommentsPagination((prev) => {
                    if (!prev[parentId]) return prev

                    return {
                        ...prev,
                        [parentId]: {
                            ...prev[parentId],
                            totalCount: prev[parentId].totalCount - 1,
                        },
                    }
                })
            } else {
                // For parent comments, we'll let the refetch handle it
            }

            toast({
                title: t('commentDeleted'),
                description: t('commentDeletedSubText'),
            })

            // Still refetch to ensure consistency with server
            refetchComment()
        },
        onError: () => {
            toast({
                title: t('error'),
                description: t('errorDeletingComment'),
                variant: 'destructive',
            })
            refetchComment()
        },
    })

    const handleEditComment = (id: string, content: string) => {
        editComment({
            id,
            noiDungBinhLuan: content,
        })
    }

    const handleDeleteComment = (id: string) => {
        deleteComment(id)
    }

    // Count all comments - now includes a count of visible replies
    const totalComments =
        parentComments.length +
        Object.entries(childComments)
            .filter(([parentId]) => expandedComments.has(parentId))
            .reduce((sum, [_, children]) => sum + children.length, 0)

    // Get comments count for the "View replies" button - improved version
    const getCommentCount = (commentId: string) => {
        // Try to get from the comment's totalChild property
        const parentComment = parentComments.find((c) => c.id === commentId)
        if (parentComment?.totalChild !== undefined) {
            return parentComment.totalChild
        }

        // Try to get from totalChildComments state
        if (totalChildComments[commentId] !== undefined) {
            return totalChildComments[commentId]
        }

        // Try to get from pagination info
        if (childCommentsPagination[commentId]?.totalCount !== undefined) {
            return childCommentsPagination[commentId].totalCount
        }

        // Try to get from loaded child comments
        if (childComments[commentId]?.length) {
            return childComments[commentId].length
        }

        // Default to 0 if no count info available
        return 0
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('comments')} ({parentComments.length}){' '}
                {/* Show parent comment count */}
            </h3>

            {/* Only show comment form when user is logged in */}
            {user && (
                <div className="mb-8">
                    <Textarea
                        ref={commentInputRef}
                        placeholder={t('addYourThoughts')}
                        className="mb-3 min-h-[100px]"
                        value={newComment}
                        onChange={handleInputChange}
                        onClick={() => setCurrentInputType('comment')}
                    />
                    <div className="flex justify-between items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 p-0 mt-[300px]"
                                side="right"
                            >
                                <Picker
                                    data={data}
                                    onEmojiSelect={(emoji: any) =>
                                        handleEmojiSelect(emoji, 'comment')
                                    }
                                    theme="light"
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim()}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {t('postComment')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Comments list with nested replies */}
            <div className="space-y-6">
                {parentComments.map((comment) => (
                    <div key={comment.id}>
                        <CommentItem
                            comment={comment}
                            onReplyClick={setReplyingTo}
                            replyingTo={replyingTo}
                            replyContent={replyContent}
                            replyInputRef={replyInputRef}
                            handleInputChange={handleReplyInputChange}
                            handleSubmitReply={handleSubmitReply}
                            setReplyContent={setReplyContent}
                            allComments={[
                                ...parentComments,
                                ...Object.values(childComments).flat(),
                            ]}
                            onEditComment={handleEditComment}
                            onDeleteComment={handleDeleteComment}
                            handleEmojiSelect={handleEmojiSelect}
                        />

                        {/* Add button to toggle replies with count - only show when there are replies */}
                        {!expandedComments.has(comment.id) &&
                            getCommentCount(comment.id) > 0 && (
                                <div className="ml-6 mt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-purple-600 hover:text-purple-800"
                                        onClick={() =>
                                            toggleChildComments(comment.id)
                                        }
                                    >
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        <span>
                                            {t('view')}{' '}
                                            {getCommentCount(comment.id)}{' '}
                                            {getCommentCount(comment.id) === 1
                                                ? t('reply')
                                                : t('replies')}
                                        </span>
                                    </Button>
                                </div>
                            )}

                        {/* Show loading state while fetching replies */}
                        {loadingChildComments.has(comment.id) && (
                            <div className="ml-6 mt-3 flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                                <span className="text-sm text-gray-500">
                                    {t('loadingReplies')}
                                </span>
                            </div>
                        )}

                        {/* Show child comments if expanded */}
                        {expandedComments.has(comment.id) &&
                            childComments[comment.id] && (
                                <div className="ml-6 space-y-3 mt-2">
                                    {childComments[comment.id].map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            isReply={true}
                                            onReplyClick={setReplyingTo}
                                            replyingTo={replyingTo}
                                            replyContent={replyContent}
                                            replyInputRef={replyInputRef}
                                            handleInputChange={
                                                handleReplyInputChange
                                            }
                                            handleSubmitReply={
                                                handleSubmitReply
                                            }
                                            setReplyContent={setReplyContent}
                                            allComments={[
                                                ...parentComments,
                                                ...Object.values(
                                                    childComments
                                                ).flat(),
                                            ]}
                                            onEditComment={handleEditComment}
                                            onDeleteComment={
                                                handleDeleteComment
                                            }
                                            handleEmojiSelect={
                                                handleEmojiSelect
                                            }
                                        />
                                    ))}

                                    {/* Show "Load more" button if needed, with count of remaining replies */}
                                    {getRemainingReplyCount(comment.id) > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-purple-600 hover:text-purple-800"
                                            onClick={() =>
                                                loadMoreChildComments(
                                                    comment.id
                                                )
                                            }
                                            disabled={loadingChildComments.has(
                                                comment.id
                                            )}
                                        >
                                            {loadingChildComments.has(
                                                comment.id
                                            ) ? (
                                                <span className="flex items-center">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-500 border-t-transparent mr-2"></div>
                                                    {t('loadingMore')}
                                                </span>
                                            ) : (
                                                <span>
                                                    {t('show')}{' '}
                                                    {getRemainingReplyCount(
                                                        comment.id
                                                    )}{' '}
                                                    {t('more')}{' '}
                                                    {getRemainingReplyCount(
                                                        comment.id
                                                    ) === 1
                                                        ? t('reply')
                                                        : t('replies')}
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}
                    </div>
                ))}
            </div>
        </div>
    )
}
