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
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'image'
          url: string
          caption: string
          size?: string
          id: string
          parentId?: string
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
    | {
          type: 'code'
          content: string
          language: string
          id: string
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
          citation: string
          fontSize?: string
          id: string
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
          column?: number
          dividerType?: string
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
          row?: number
          column?: number
          marginTop?: number
          marginBottom?: number
      }
