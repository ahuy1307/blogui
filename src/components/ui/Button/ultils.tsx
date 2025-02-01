import styles from './Button.module.scss'

export function getSizeClass(
    size: string,
    icon?: React.ReactNode,
    shape?: 'circle' | 'square',
    children?: React.ReactNode
) {
    switch (size) {
        case 'very_large':
        case 'very_small':
            if (icon && shape !== 'square' && !children) {
                return `${styles[`${size}_icon`]} ${styles[`${size}_icon_sub`]}`
            }
            return styles[`${size}`]
        case 'large':
        case 'middle':
        case 'small':
            if (icon && shape !== 'square' && !children) {
                return `${styles[`size_${size}`]} ${styles[`size_${size}_icon`]}`
            }
            return styles[`size_${size}`]
    }
}
