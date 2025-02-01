import styles from './Input.module.scss'
export const getSizeClassName = (size: string): string => {
    return styles[`input_${size}`]
}

export const getAntdSizeProp = (
    size: string
): 'large' | 'small' | 'middle' | undefined => {
    switch (size) {
        case 'large':
            return 'large'
        case 'small':
            return 'small'
        case 'medium':
            return 'middle'
        default:
            return undefined
    }
}

export const getBorderRadius = (size: string): number => {
    switch (size) {
        case 'very_small':
            return 4
        case 'small':
            return 6
        case 'medium':
        case 'large':
        case 'very_large':
        default:
            return 8
    }
}
