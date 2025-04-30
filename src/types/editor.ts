export type SectionTypeDefault =
    | 'code'
    | 'video'
    | 'image'
    | 'text'
    | 'heading'
    | 'numbered-list'
    | 'bullet-list'
    | 'quote'
    | 'divider'
    | 'column-container'

export type SectionType =
    | {
          type: 'text'
          content: string
          id: string
          level?: 1 | 2 | 3
          parentId?: string
          anchorId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'image'
          url: string
          content?: string
          caption: string
          size?: string
          id: string
          anchorId?: string
          level?: 1 | 2 | 3
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'code'
          content: string
          level?: 1 | 2 | 3
          language: string
          id: string
          anchorId?: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'heading'
          content: string
          level: 1 | 2 | 3
          id: string
          anchorId?: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'numbered-list'
          title?: string
          items: string[]
          content?: string
          anchorId?: string
          level?: 1 | 2 | 3
          fontSize?: string
          id: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'bullet-list'
          title?: string
          items: string[]
          anchorId?: string
          content?: string
          level?: 1 | 2 | 3
          fontSize?: string
          id: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'quote'
          content: string
          level?: 1 | 2 | 3
          citation: string
          fontSize?: string
          id: string
          anchorId?: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'divider'
          id: string
          parentId?: string
          row?: number
          content?: string
          column?: number
          level?: 1 | 2 | 3
          dividerType?: string
          anchorId?: string
          spacing?: number
          thickness?: number
          color?: string
          marginTop?: number
          marginBottom?: number
          dinhDang?: {
              dividerType?: string
              spacing?: number
              thickness?: number
              color?: string
          }
      }
    | {
          type: 'video'
          url: string
          caption: string
          id: string
          content?: string
          level?: 1 | 2 | 3
          anchorId?: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'column-container'
          id: string
          columns: number
          children: string[]
          level?: 1 | 2 | 3
          anchorId?: string
          content?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
