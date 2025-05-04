'use client'

import type React from 'react'

import { useState, useEffect, useRef, createRef } from 'react'
import { Button } from '@/components/other-ui/Button'
import { Label } from '@/components/other-ui/Label'
import { useToast } from '@/components/other-ui/useToast'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    Clock,
    BookOpen,
    Save,
    Eye,
    X,
    FileEdit,
    Pencil,
    FileText,
    ImageIcon,
    LayoutDashboard,
    Plus,
    ChevronDown,
    Sparkles,
    SquareArrowDown,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/other-ui/Tabs'
import { SortableSection } from '@/components/editor/SortableSection'
import { PreviewSection } from '@/components/editor/PreviewSection'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { DragPreview } from '@/components/editor/DragPreview'
import { SIDEBAR_SECTIONS } from '@/components/editor/constants'
import { SectionType } from '@/types/editor'
import { TopicSelector } from '@/components/features/blog/TopicSelector'
import { VideoUploadModal } from '@/components/features/blog/VideoUploadModal'
import { MediaLibrary } from '@/components/media-library/MediaLibrary'
import { BlogGenerator } from '@/components/blog-generator/BlogGenerator'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import Header from '@/components/features/home/Header'
import ScrollToTop from '@/components/features/home/ScrollToTop'
import { BlogMedia } from '@/types/interface'
import { Toaster } from '@/components/other-ui/Toaster'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Topic } from '@/types/interface'
import { useUnlockBodyScroll } from '@/hooks/useUnlockBodyScroll'
import { generateId } from '@/lib/utils'

export default function EditBlogPage({ params }: any) {
    const { id } = params

    const { data: blogDetail, isLoading } = useQuery({
        queryKey: ['blogDetail', id],
        queryFn: async () => {
            const response = await authenticationService.getBlogById({ id })
            return response.data
        },
        enabled: !!id,
    })

    const t = useTranslations('write') // Initialize translations for the 'write' namespace

    const updateBlogMutation = useMutation({
        mutationFn: (blogData: any) =>
            authenticationService.updateBlog({
                id,
                ...blogData,
            }),
        mutationKey: ['updateBlog'],
        onSuccess: () => {
            toast({
                title: t('blogUpdated'),
                description: t('blogUpdatedDescription'),
            })
        },
        onError: () => {
            toast({
                title: t('updateError'),
                description: t('updateErrorDescription'),
                variant: 'destructive',
            })
        },
    })

    const [title, setTitle] = useState('')
    const [shortDescription, setShortDescription] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [sections, setSections] = useState<SectionType[]>([])
    const [videoModalOpen, setVideoModalOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>('editor')
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [activeDragType, setActiveDragType] = useState<string | null>(null)
    const [sectionPickerOpen, setSectionPickerOpen] = useState(false)
    const tabRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()
    const locale = useLocale()

    const [wordCount, setWordCount] = useState(0)
    const [readingTime, setReadingTime] = useState(0)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const sectionRefs = useRef<{
        [key: string]: React.RefObject<HTMLDivElement>
    }>({})
    const [codeThemes, setCodeThemes] = useState<{
        [key: string]: 'light' | 'dark'
    }>({})
    const addSectionButtonRef = useRef<HTMLButtonElement>(null)

    const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
    const [mediaLibraryType, setMediaLibraryType] = useState<
        'image' | 'video' | 'all'
    >('all')
    const [blogGeneratorOpen, setBlogGeneratorOpen] = useState(false)
    const [categories, setCategories] = useState<Topic[]>([])

    useUnlockBodyScroll()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveDragId(active.id as string)

        const section = sections.find((s) => s.id === active.id)
        if (section) {
            setActiveDragType(section.type)
        }

        document.body.classList.add('dragging')
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        setActiveDragId(null)
        setActiveDragType(null)

        document.body.classList.remove('dragging')

        if (!over) return

        if (active.id !== over.id) {
            setSections((sections) => {
                const oldIndex = sections.findIndex(
                    (section) => section.id === active.id
                )
                const newIndex = sections.findIndex(
                    (section) => section.id === over.id
                )

                return arrayMove(sections, oldIndex, newIndex)
            })
        }
    }

    const addSection = (type: SectionType['type'], targetId?: string) => {
        const id = generateId()

        sectionRefs.current[id] = createRef()

        if (type === 'code') {
            setCodeThemes((prev) => ({ ...prev, [id]: 'dark' }))
        }

        let newSection: SectionType

        switch (type) {
            case 'text':
                newSection = {
                    type,
                    content: JSON.stringify({
                        text: '',
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id,
                }
                break
            case 'image':
                setActiveSection(id)
                openImageModal(id)
                newSection = { type, url: '', caption: '', id, size: 'medium' }
                break
            case 'code':
                newSection = { type, content: '', language: 'python', id }
                break
            case 'heading':
                newSection = { type, content: '', level: 2, id }
                break
            case 'numbered-list':
                newSection = { type, items: [''], fontSize: 'normal', id }
                break
            case 'bullet-list':
                newSection = { type, items: [''], fontSize: 'normal', id }
                break
            case 'quote':
                newSection = {
                    type,
                    content: '',
                    citation: '',
                    fontSize: 'normal',
                    id,
                }
                break
            case 'divider':
                newSection = {
                    type,
                    id,
                    dividerType: 'solid',
                    spacing: 8,
                    thickness: 4,
                    color: '#9c65d0',
                }
                break
            case 'video':
                setActiveSection(id)
                openVideoModal(id)
                newSection = { type, url: '', caption: '', id }
                break
            default:
                newSection = {
                    type: 'text',
                    content: JSON.stringify({
                        text: '',
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id,
                }
        }

        if (targetId) {
            const targetIndex = sections.findIndex(
                (section) => section.id === targetId
            )
            if (targetIndex !== -1) {
                const newSections = [...sections]
                newSections.splice(targetIndex + 1, 0, newSection)
                setSections(newSections)

                setTimeout(() => {
                    sectionRefs.current[id]?.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })
                }, 100)

                return
            }
        }

        setSections((prevSections) => {
            const newSections = [...prevSections, newSection]

            setTimeout(() => {
                sectionRefs.current[id]?.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
            }, 100)

            return newSections
        })

        setSectionPickerOpen(false)
    }

    const addSectionAfter = (type: string, currentSectionId: string) => {
        const id = generateId()

        // Create a ref for the new section
        sectionRefs.current[id] = createRef()

        // Set default code theme for code sections
        if (type === 'code') {
            setCodeThemes((prev) => ({ ...prev, [id]: 'dark' }))
        }

        let newSection: SectionType

        switch (type) {
            case 'text':
                newSection = {
                    type,
                    content: JSON.stringify({
                        text: '',
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id,
                }
                break
            case 'image':
                setActiveSection(id)
                openImageModal(id)
                newSection = { type, url: '', caption: '', id }
                break
            case 'code':
                newSection = { type, content: '', language: 'javascript', id }
                break
            case 'heading':
                newSection = { type, content: '', level: 2, id }
                break
            case 'numbered-list':
                newSection = {
                    type,
                    items: [''],
                    fontSize: 'normal',
                    title: '',
                    id,
                }
                break
            case 'bullet-list':
                newSection = {
                    type,
                    items: [''],
                    fontSize: 'normal',
                    title: '',
                    id,
                }
                break
            case 'quote':
                newSection = {
                    type,
                    content: '',
                    citation: '',
                    fontSize: 'normal',
                    id,
                }
                break
            case 'divider':
                newSection = { type, id }
                break
            case 'video':
                setActiveSection(id)
                openVideoModal(id)
                newSection = { type, url: '', caption: '', id }
                break
            default:
                newSection = {
                    type: 'text',
                    content: JSON.stringify({
                        text: '',
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id,
                }
        }

        // Find the index of the current section
        const currentIndex = sections.findIndex(
            (section) => section.id === currentSectionId
        )

        if (currentIndex !== -1) {
            // Insert the new section after the current one
            const newSections = [...sections]
            newSections.splice(currentIndex + 1, 0, newSection)
            setSections(newSections)

            // Scroll to the new section after render
            setTimeout(() => {
                sectionRefs.current[id]?.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
            }, 100)
        }
    }

    // Move a section to a specific position
    const moveSectionTo = (sectionId: string, newIndex: number) => {
        const currentIndex = sections.findIndex(
            (section) => section.id === sectionId
        )

        if (currentIndex !== -1 && currentIndex !== newIndex) {
            const newSections = [...sections]
            const [movedSection] = newSections.splice(currentIndex, 1)
            newSections.splice(newIndex, 0, movedSection)
            setSections([...newSections]) // Ensure state is updated with a new array reference

            toast({
                title: 'Section moved',
                description: `Section moved to position ${newIndex + 1}`,
            })
        }
    }

    const updateSection = (id: string, updates: Partial<SectionType>) => {
        setSections(
            sections.map((section) =>
                section.id === id
                    ? ({ ...section, ...updates } as SectionType)
                    : section
            )
        )
    }

    const deleteSection = (id: string) => {
        const sectionElement = sectionRefs.current[id]?.current
        if (sectionElement) {
            sectionElement.classList.add('section-removing')

            setTimeout(() => {
                setSections(sections.filter((section) => section.id !== id))
                delete sectionRefs.current[id]
                setCodeThemes((prev) => {
                    const newThemes = { ...prev }
                    delete newThemes[id]
                    return newThemes
                })
            }, 300)
        } else {
            setSections(sections.filter((section) => section.id !== id))
        }
    }

    const handleVideoSelected = (videoUrl: string) => {
        console.log('Using legacy video handler:', videoUrl)
    }

    const toggleCodeTheme = (sectionId: string) => {
        setCodeThemes((prev) => ({
            ...prev,
            [sectionId]: prev[sectionId] === 'light' ? 'dark' : 'light',
        }))
    }

    const handleMediaSelected = (media: BlogMedia) => {
        if (media.loaiMedia === 'image') {
            if (activeSection) {
                updateSection(activeSection, {
                    url: media.noiDungMedia.url,
                    caption: media.noiDungMedia.name || '',
                })
                setActiveSection(null)
            } else {
                setCoverImage(media.noiDungMedia.url)
            }
        } else if (media.loaiMedia === 'video') {
            if (activeSection) {
                updateSection(activeSection, {
                    url: media.noiDungMedia.url,
                    caption: media.noiDungMedia.name || '',
                })
                setActiveSection(null)
            }
        }
        setMediaLibraryOpen(false)
    }

    const handleBlogGenerated = (blogData: any) => {
        setTitle(blogData.title)
        setShortDescription(blogData.summary || '')

        setSections(blogData.sections)
    }

    const openImageModal = (sectionId?: string) => {
        if (sectionId) {
            setActiveSection(sectionId)
        }
        setMediaLibraryType('image')
        setMediaLibraryOpen(true)
    }

    const openVideoModal = (sectionId?: string) => {
        if (sectionId) {
            setActiveSection(sectionId)
        }
        setMediaLibraryType('video')
        setMediaLibraryOpen(true)
    }

    const openCoverImageModal = () => {
        setActiveSection(null)
        setMediaLibraryType('image')
        setMediaLibraryOpen(true)
    }

    const saveBlogPost = (daXuatBan = false) => {
        // Prevent multiple submissions
        if (isSaving || updateBlogMutation.isPending) return

        // Set loading state
        setIsSaving(true)

        const trimmedTitle = title.trim()
        // Check if title exists and meets requirements
        if (!trimmedTitle) {
            toast({
                title: t('missingTitle'),
                description: t('addTitle'),
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        // Check title length
        if (trimmedTitle.length < 5) {
            toast({
                title: t('titleTooShort'),
                description: t('titleMinLength', { min: 5 }),
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        // Check if title contains at least one letter
        if (!/[a-zA-Z\u00C0-\u00FF]/.test(trimmedTitle)) {
            toast({
                title: t('invalidTitle'),
                description: t('titleNeedsText'),
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        if (!coverImage) {
            toast({
                title: t('missingCoverImage'),
                description: t('addCoverImage'),
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        // Check if at least one section has been added
        if (sections.length === 0) {
            toast({
                title: t('missingContent'),
                description: t('addAtLeastOneSection'),
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        // Check for empty text and heading sections
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i]

            if (section.type === 'text') {
                let textContent = ''
                if (
                    typeof section.content === 'string' &&
                    section.content.startsWith('{')
                ) {
                    try {
                        const parsedContent = JSON.parse(section.content)
                        textContent = parsedContent.text || ''
                    } catch (e) {
                        textContent = section.content
                    }
                } else {
                    textContent = section.content
                }

                if (!textContent.trim()) {
                    toast({
                        title: t('missingContent'),
                        description: t('textSectionCannotBeEmpty'),
                        variant: 'destructive',
                    })

                    // Scroll to the empty text section
                    sectionRefs.current[section.id]?.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })

                    setIsSaving(false)
                    return
                }
            }

            if (
                section.type === 'heading' &&
                (!section.content || !section.content.trim())
            ) {
                toast({
                    title: t('missingContent'),
                    description: t('headingSectionCannotBeEmpty'),
                    variant: 'destructive',
                })

                // Scroll to the empty heading section
                sectionRefs.current[section.id]?.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })

                setIsSaving(false)
                return
            }
        }

        if (!categories.length) {
            toast({
                title: t('missingCategories'),
                description: t('addCategories'),
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        const formattedData = {
            tieuDe: title,
            noiDungNgan: shortDescription,
            anhBia: coverImage,
            daXuatBan: daXuatBan,
            thanhPhans: sections.map((section, index) => {
                let loaiThanhPhan: string
                let noiDung = ''
                let dinhDang: any = null

                switch (section.type) {
                    case 'text':
                        loaiThanhPhan = 'text'
                        try {
                            const parsedContent = JSON.parse(section.content)
                            noiDung = parsedContent.text || section.content
                            dinhDang = parsedContent.format || {}
                        } catch {
                            noiDung = section.content
                            dinhDang = {}
                        }
                        break
                    case 'heading':
                        loaiThanhPhan = 'heading'
                        noiDung = section.content
                        dinhDang = { level: section.level }
                        break
                    case 'image':
                        loaiThanhPhan = 'image'
                        noiDung = JSON.stringify({
                            url: section.url,
                            caption: section.caption,
                        })
                        dinhDang = { size: section.size || 'medium' }
                        break
                    case 'code':
                        loaiThanhPhan = 'code'
                        noiDung = JSON.stringify({
                            content: section.content,
                            language: section.language,
                        })
                        dinhDang = {}
                        break
                    case 'numbered-list':
                    case 'bullet-list':
                        loaiThanhPhan = section.type
                        noiDung = JSON.stringify({
                            title: section.title,
                            items: section.items,
                        })
                        dinhDang = { fontSize: section.fontSize || 'normal' }
                        break
                    case 'quote':
                        loaiThanhPhan = 'quote'
                        noiDung = JSON.stringify({
                            content: section.content,
                            citation: section.citation,
                        })
                        dinhDang = { fontSize: section.fontSize || 'normal' }
                        break
                    case 'divider':
                        loaiThanhPhan = 'divider'
                        dinhDang = {
                            dividerType: section.dividerType || 'solid',
                            spacing: section.spacing || 8,
                            thickness: section.thickness || 1,
                            color: section.color || '#9c65d0',
                        }
                        break
                    case 'video':
                        loaiThanhPhan = 'video'
                        noiDung = JSON.stringify({
                            url: section.url,
                            caption: section.caption,
                        })
                        dinhDang = {}
                        break
                    default:
                        loaiThanhPhan = 'unknown'
                }

                const baseSection = {
                    loaiThanhPhan,
                    noiDung,
                    dinhDang,
                    hang: index,
                    cot: 0,
                }

                // Include `id` only if it exists (for old sections)
                if (section.id.startsWith('section'))
                    return {
                        ...baseSection,
                    }
                else
                    return {
                        ...baseSection,
                        id: section.id,
                    }
            }),
            chuDes: categories.map((topic) => topic.id),
        }

        updateBlogMutation.mutate(
            { blogData: formattedData },
            {
                onSettled: () => {
                    setIsSaving(false)
                    setLastSaved(new Date())
                },
            }
        )
    }

    useEffect(() => {
        if (blogDetail) {
            setTitle(blogDetail.tieuDe || '')
            setShortDescription(blogDetail.noiDungNgan || '')
            setCoverImage(blogDetail.anhBia || '')
            setSections(
                blogDetail.thanhPhans.map((section: any) => {
                    let content = section.noiDung

                    // Parse `noiDung` for `bullet-list` and `numbered-list` types
                    if (
                        section.loaiThanhPhan === 'bullet-list' ||
                        section.loaiThanhPhan === 'numbered-list'
                    ) {
                        try {
                            const parsedContent = JSON.parse(section.noiDung)
                            section.title = parsedContent.title || ''
                            section.items = parsedContent.items || []
                            return {
                                id: section.id || generateId(),
                                type: section.loaiThanhPhan,
                                content,
                                items: section.items,
                                title: section.title,
                                ...section.dinhDang,
                            }
                        } catch {
                            section.title = ''
                            section.items = []
                        }
                    }

                    // Parse `noiDung` for `code` type
                    if (section.loaiThanhPhan === 'code') {
                        try {
                            const parsedContent = JSON.parse(section.noiDung)
                            section.content = parsedContent.content || ''
                            section.language =
                                parsedContent.language || 'plaintext'

                            // Decode the content string
                            const decodedContent = section.content.replace(
                                /\\n/g,
                                '\n'
                            )

                            return {
                                id: section.id || generateId(),
                                type: section.loaiThanhPhan,
                                content: decodedContent,
                                language: section.language,
                                ...section.dinhDang,
                            }
                        } catch {
                            section.content = ''
                            section.language = 'plaintext'
                        }
                    }

                    if (section.loaiThanhPhan === 'quote') {
                        try {
                            const parsedContent = JSON.parse(
                                JSON.parse(section.noiDung).content
                            )

                            return {
                                id: section.id || generateId(),
                                type: section.loaiThanhPhan,
                                content: parsedContent.content || '',
                                citation: parsedContent.citation || '',
                                ...section.dinhDang,
                            }
                        } catch {
                            section.content = ''
                            section.language = 'plaintext'
                        }
                    }

                    return {
                        id: section.id || generateId(),
                        type: section.loaiThanhPhan,
                        content,
                        ...section.dinhDang,
                    }
                })
            )
            setCategories(blogDetail.chuDes || [])
        }
    }, [blogDetail])

    useEffect(() => {
        const handleDrop = (e: DragEvent) => {
            e.preventDefault()

            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0]

                if (file.type.startsWith('image/')) {
                    const imageUrl = URL.createObjectURL(file)
                    setSections([
                        ...sections,
                        {
                            type: 'image',
                            url: imageUrl,
                            caption: file.name,
                            id: '',
                        },
                    ])
                }
            }
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault()
        }

        document.addEventListener('drop', handleDrop)
        document.addEventListener('dragover', handleDragOver)

        return () => {
            document.removeEventListener('drop', handleDrop)
            document.removeEventListener('dragover', handleDragOver)
        }
    }, [sections])

    const renderDragOverlay = () => {
        if (!activeDragType) return null

        const draggedSection = sections.find((s) => s.id === activeDragId)
        if (draggedSection) {
            return (
                <DragPreview
                    type={draggedSection.type}
                    section={draggedSection}
                />
            )
        }

        return null
    }

    const calculateStats = () => {
        let allText = title + ' ' + shortDescription + ' '

        sections.forEach((section) => {
            if (section.type === 'text') {
                try {
                    const parsedContent = JSON.parse(section.content)
                    if (parsedContent.text) {
                        allText += parsedContent.text + ' '
                    }
                } catch (e) {
                    allText += section.content + ' '
                }
            } else if (section.type === 'heading') {
                allText += section.content + ' '
            } else if (section.type === 'quote') {
                allText += section.content + ' '
            } else if (
                section.type === 'numbered-list' ||
                section.type === 'bullet-list'
            ) {
                section.items.forEach((item) => {
                    allText += item + ' '
                })
            }
        })

        const words = allText.trim().split(/\s+/).filter(Boolean).length
        setWordCount(words)

        const minutes = Math.ceil(words / 200)
        setReadingTime(minutes)
    }

    useEffect(() => {
        calculateStats()
    }, [title, shortDescription, sections])

    const mainContentStyle = {
        paddingRight: 'calc(64px + 1rem)',
    }

    const [isTabOpen, setIsTabOpen] = useState(false)

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setIsTabOpen(false)
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <>
            <ScrollToTop />
            <Toaster />
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-white text-gray-900">
                <Header isWrite={false} />
                <div className="fixed left-0 right-0 z-10 top-[-12px] shadow-sm border border-gray-400">
                    <div
                        className={`mt-[80px] flex flex-col gap-4 z-20 pt-4 shadow-sm  bg-white transition-all duration-500 ${
                            isTabOpen
                                ? 'h-[150px] overflow-hidden'
                                : 'h-0 overflow-hidden'
                        }`}
                    >
                        <div className="shadow-sm">
                            <div className="mx-auto  px-4 flex items-center justify-center">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {t('readingTime', {
                                                time: readingTime,
                                            })}
                                        </span>
                                        <span className="mx-1">•</span>
                                        <BookOpen className="h-3 w-3" />
                                        <span>
                                            {t('wordCount', {
                                                count: wordCount,
                                            })}
                                        </span>
                                        {lastSaved && (
                                            <>
                                                <span className="mx-1">•</span>
                                                <span>
                                                    {t('lastSaved', {
                                                        time: lastSaved.toLocaleTimeString(),
                                                    })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setBlogGeneratorOpen(true)
                                        }
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-1"
                                        disabled={
                                            isSaving ||
                                            updateBlogMutation.isPending
                                        }
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {t('aiGenerate')}
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            saveBlogPost(blogDetail?.daXuatBan)
                                        }
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        disabled={
                                            isSaving ||
                                            updateBlogMutation.isPending
                                        }
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ||
                                        updateBlogMutation.isPending
                                            ? t('updating')
                                            : t('update')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div ref={tabRef} className="z-20 shadow-sm">
                            <div className="container mx-auto py-2 px-4">
                                <Tabs
                                    value={activeTab}
                                    onValueChange={handleTabChange}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full gap-4 max-w-md mx-auto grid-cols-3 h-[60px] px-4 rounded-xl">
                                        <TabsTrigger
                                            value="editor"
                                            className="flex items-center gap-2 text-base"
                                        >
                                            <FileEdit className="h-4 w-4" />
                                            {t('editor')}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="preview"
                                            className="flex items-center gap-2 text-base"
                                        >
                                            <Eye className="h-4 w-4" />
                                            {t('preview')}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="layout"
                                            className="flex items-center gap-2 text-base"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            {t('layout')}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow-sm mx-auto flex justify-center pb-3 pt-2">
                        <Button
                            onClick={() => setIsTabOpen(!isTabOpen)}
                            className="bg-purple-600 text-white w-[100px] p-2 rounded-full shadow-md transition-all hover:bg-purple-700"
                        >
                            <SquareArrowDown
                                className={`h-12 w-12 transition-transform duration-500 block text-lg ${
                                    isTabOpen ? 'transform rotate-180' : ''
                                }`}
                                style={{ width: '1.5rem', height: '1.5rem' }}
                            />
                        </Button>
                    </div>
                </div>
                <div
                    className={`
                    pt-36 ${isTabOpen ? 'pt-72' : 'pt-36'}
                    transition-all duration-500
                `}
                >
                    {activeTab === 'editor' && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <main
                                className="container mx-auto px-4 py-8"
                                style={mainContentStyle}
                            >
                                <div className="max-w-4xl mx-auto">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 space-y-6">
                                        <div>
                                            <Label
                                                htmlFor="title"
                                                className="text-lg font-medium mb-2 block"
                                            >
                                                {t('blogTitle')}{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <input
                                                id="title"
                                                value={title}
                                                onChange={(e) =>
                                                    setTitle(e.target.value)
                                                }
                                                style={{ borderRadius: '6px' }}
                                                placeholder={t(
                                                    'titlePlaceholder'
                                                )}
                                                className="w-full text-xl font-bold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="cover-image"
                                                className="text-lg font-medium mb-2 block"
                                            >
                                                {t('coverImage')}{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            {coverImage ? (
                                                <div
                                                    className="relative rounded-lg overflow-hidden border border-gray-300 mb-2 -z-0"
                                                    style={{
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    <Image
                                                        src={coverImage}
                                                        alt="Cover Image"
                                                        width={400}
                                                        height={200}
                                                        className="w-full h-auto max-h-[300px] object-contain"
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                                                        onClick={() =>
                                                            setCoverImage('')
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer 
                          hover:bg-gray-50 hover:border-purple-300 transition-all"
                                                    onClick={() =>
                                                        openCoverImageModal()
                                                    }
                                                >
                                                    <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-500">
                                                        {t('changeCoverImage')}
                                                    </p>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openCoverImageModal()
                                                }
                                                className="border-gray-300 hover:bg-purple-50 hover:border-purple-300 mt-2 transition-all"
                                            >
                                                {coverImage
                                                    ? t('changeCoverImage')
                                                    : t('selectCoverImage')}
                                            </Button>
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="categories"
                                                className="text-lg font-medium mb-2 block"
                                            >
                                                {t('categories')}{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <TopicSelector
                                                selectedTopics={categories}
                                                onChange={setCategories}
                                            />
                                        </div>
                                    </div>

                                    <SortableContext
                                        items={sections.map(
                                            (section) => section.id
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-6">
                                            {sections.map((section, index) => (
                                                <div
                                                    ref={
                                                        sectionRefs.current[
                                                            section.id
                                                        ] ||
                                                        (sectionRefs.current[
                                                            section.id
                                                        ] = createRef())
                                                    }
                                                    key={section.id}
                                                    className="section-container transition-all duration-300"
                                                >
                                                    <SortableSection
                                                        section={section}
                                                        updateSection={
                                                            updateSection
                                                        }
                                                        deleteSection={
                                                            deleteSection
                                                        }
                                                        openImageModal={() => {
                                                            openImageModal(
                                                                section.id
                                                            )
                                                        }}
                                                        openVideoModal={() => {
                                                            openVideoModal(
                                                                section.id
                                                            )
                                                        }}
                                                        codeTheme={
                                                            codeThemes[
                                                                section.id
                                                            ] || 'dark'
                                                        }
                                                        toggleCodeTheme={() =>
                                                            toggleCodeTheme(
                                                                section.id
                                                            )
                                                        }
                                                        addSectionAfter={
                                                            addSectionAfter
                                                        }
                                                        sectionIndex={index}
                                                        totalSections={
                                                            sections.length
                                                        }
                                                        moveSectionTo={
                                                            moveSectionTo
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </SortableContext>

                                    {/* Add new sections button */}
                                    <div className="mt-2 mb-20">
                                        <Button
                                            ref={addSectionButtonRef}
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={sectionPickerOpen}
                                            className="w-full py-6 border-dashed border-gray-300 hover:bg-gray-50 hover:border-purple-300 transition-all flex items-center justify-center"
                                            onClick={() =>
                                                setSectionPickerOpen(
                                                    !sectionPickerOpen
                                                )
                                            }
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            {t('addNewSection')}
                                            <ChevronDown
                                                className={`h-4 w-4 ml-2 opacity-70 transition-transform duration-300 ${sectionPickerOpen ? 'rotate-180' : ''}`}
                                            />
                                        </Button>

                                        <div
                                            className={`mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg animate-in fade-in-50 slide-in-from-top-5 duration-300 ${sectionPickerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        >
                                            <div className="grid grid-cols-3 gap-3">
                                                {SIDEBAR_SECTIONS.map(
                                                    (section) => (
                                                        <div
                                                            key={section.type}
                                                            onClick={() =>
                                                                addSection(
                                                                    section.type
                                                                )
                                                            }
                                                            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-purple-500 hover:shadow-sm transition-all hover:bg-purple-50 transform hover:scale-105"
                                                        >
                                                            <div className="text-gray-600 mb-1">
                                                                {section.icon}
                                                            </div>
                                                            <span className="text-xs text-gray-700">
                                                                {
                                                                    section
                                                                        .label[
                                                                        locale as
                                                                            | 'en'
                                                                            | 'vi'
                                                                    ]
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>

                            <EditorSidebar
                                onAddSection={(type) => addSection(type)}
                            />

                            <DragOverlay>
                                {activeDragId ? renderDragOverlay() : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                    {activeTab === 'preview' && (
                        <div className="bg-gray-100 min-h-screen py-8">
                            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                                {coverImage && (
                                    <div className="relative h-[400px] w-full">
                                        <Image
                                            src={
                                                coverImage ||
                                                '/images/404_notfound.webp'
                                            }
                                            alt={title}
                                            width={600}
                                            height={600}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}

                                <div className="p-8">
                                    {title ? (
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                            {title}
                                        </h1>
                                    ) : (
                                        <div className="h-10 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
                                    )}

                                    {shortDescription ? (
                                        <p className="text-lg text-gray-600 mb-8">
                                            {shortDescription}
                                        </p>
                                    ) : (
                                        <div className="h-6 bg-gray-200 rounded-md mb-8 animate-pulse"></div>
                                    )}

                                    <div className="prose prose-lg max-w-none">
                                        {sections.length > 0 ? (
                                            sections.map((section) => (
                                                <PreviewSection
                                                    key={section.id}
                                                    section={section}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <p>{t('noContent')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'layout' && (
                        <div className="bg-gray-100 min-h-screen py-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 mb-6">
                                    <h2 className="text-xl font-bold mb-4 text-purple-700">
                                        {t('layoutPreview')}
                                    </h2>

                                    <div className="border border-gray-200 rounded-md p-4 mb-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-purple-500" />
                                            {t('header')}
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center border border-gray-100">
                                            <span className="text-lg font-bold text-gray-800">
                                                {title || t('yourTitle')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-md p-4 mb-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                            <ImageIcon className="h-4 w-4 mr-2 text-purple-500" />
                                            {t('coverImage')}
                                        </h3>
                                        {coverImage ? (
                                            <Image
                                                src={
                                                    coverImage ||
                                                    '/images/404_notfound.webp'
                                                }
                                                alt="Cover"
                                                width={600}
                                                height={400}
                                                className="w-full h-48 object-contain rounded-md"
                                            />
                                        ) : (
                                            <div className="bg-gray-50 h-48 rounded-md flex items-center justify-center border border-gray-100">
                                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="border border-gray-200 rounded-md p-4 mb-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                            <LayoutDashboard className="h-4 w-4 mr-2 text-purple-500" />
                                            {t('contentStructure')}
                                        </h3>
                                        <div className="space-y-2">
                                            {sections.length > 0 ? (
                                                sections.map(
                                                    (section, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-50 p-3 rounded-md flex items-center border border-gray-100 hover:border-purple-200 transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-700 font-medium">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium">
                                                                    {section.type
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                        section.type
                                                                            .slice(
                                                                                1
                                                                            )
                                                                            .replace(
                                                                                '-',
                                                                                ' '
                                                                            )}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {section.type ===
                                                                        'text' &&
                                                                        t(
                                                                            'textContent'
                                                                        )}
                                                                    {section.type ===
                                                                        'heading' &&
                                                                        t(
                                                                            'levelHeading',
                                                                            {
                                                                                level: section.level,
                                                                            }
                                                                        )}
                                                                    {section.type ===
                                                                        'image' &&
                                                                        (section.caption ||
                                                                            t(
                                                                                'image'
                                                                            ))}
                                                                    {section.type ===
                                                                        'code' &&
                                                                        `${section.language} ${t('code')}`}
                                                                    {section.type ===
                                                                        'numbered-list' &&
                                                                        t(
                                                                            'itemsCount',
                                                                            {
                                                                                count: section
                                                                                    .items
                                                                                    .length,
                                                                            }
                                                                        )}
                                                                    {section.type ===
                                                                        'bullet-list' &&
                                                                        t(
                                                                            'itemsCount',
                                                                            {
                                                                                count: section
                                                                                    .items
                                                                                    .length,
                                                                            }
                                                                        )}
                                                                    {section.type ===
                                                                        'quote' &&
                                                                        t(
                                                                            'quote'
                                                                        )}
                                                                    {section.type ===
                                                                        'divider' &&
                                                                        t(
                                                                            'divider'
                                                                        )}
                                                                    {section.type ===
                                                                        'video' &&
                                                                        t(
                                                                            'video'
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={`w-3 h-10 rounded-r-md ${
                                                                    section.type ===
                                                                    'text'
                                                                        ? 'bg-blue-500'
                                                                        : section.type ===
                                                                            'heading'
                                                                          ? 'bg-green-500'
                                                                          : section.type ===
                                                                              'image'
                                                                            ? 'bg-purple-500'
                                                                            : section.type ===
                                                                                'code'
                                                                              ? 'bg-yellow-500'
                                                                              : section.type ===
                                                                                  'numbered-list'
                                                                                ? 'bg-red-500'
                                                                                : section.type ===
                                                                                    'bullet-list'
                                                                                  ? 'bg-orange-500'
                                                                                  : section.type ===
                                                                                      'quote'
                                                                                    ? 'bg-indigo-500'
                                                                                    : section.type ===
                                                                                        'divider'
                                                                                      ? 'bg-gray-500'
                                                                                      : 'bg-teal-500'
                                                                }`}
                                                            ></div>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md border border-gray-100">
                                                    <p>
                                                        {t('noContentSections')}
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        {t('addSections')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-purple-500" />
                                            {t('stats')}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-md text-center border border-gray-100 hover:border-purple-200 transition-colors">
                                                <div className="text-2xl font-bold text-purple-700">
                                                    {sections.length}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {t('sections')}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-md text-center border border-gray-100 hover:border-purple-200 transition-colors">
                                                <div className="text-2xl font-bold text-purple-700">
                                                    {wordCount}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {t('words')}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-md text-center border border-gray-100 hover:border-purple-200 transition-colors">
                                                <div className="text-2xl font-bold text-purple-700">
                                                    {readingTime}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {t('minRead')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <VideoUploadModal
                    isOpen={videoModalOpen}
                    onClose={() => setVideoModalOpen(false)}
                    onVideoSelected={handleVideoSelected}
                />

                {mediaLibraryOpen && (
                    <MediaLibrary
                        isOpen={mediaLibraryOpen}
                        onClose={() => setMediaLibraryOpen(false)}
                        onMediaSelected={handleMediaSelected}
                        mediaType={mediaLibraryType}
                    />
                )}

                {blogGeneratorOpen && (
                    <BlogGenerator
                        isOpen={blogGeneratorOpen}
                        onClose={() => setBlogGeneratorOpen(false)}
                        onBlogGenerated={handleBlogGenerated}
                    />
                )}
            </div>
        </>
    )
}
