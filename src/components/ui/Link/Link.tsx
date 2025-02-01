import Link from 'next/link'
import React from 'react'
import styles from './Link.module.scss'

type SizeType = 'large' | 'small' | 'very_small'

type ThemeType = 'light' | 'dark'

interface LinkProps {
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
    children: React.ReactNode
    href: string
    size?: SizeType
    disabled?: boolean
    theme?: ThemeType
    iconLeft?: React.ReactNode
    iconRight?: React.ReactNode
}

/**
 * @fileoverview
 * Component that displays a link with size and theme options.
 *
 * @typedef {('large' | 'small' | 'very_small')} SizeType - Defines the size type of the link.
 * @typedef {('light' | 'dark')} ThemeType - Defines the theme type of the link.
 *
 * @interface LinkProps - Interface for the properties of the NextLink component.
 * @property {SizeType} size - Size of the link.
 * @property {boolean} disabled - Whether the link is disabled or not.
 * @property {ThemeType} theme - Theme of the link.
 * @property {React.ReactNode} iconLeft - Icon to be displayed to the left of the link text.
 * @property {React.ReactNode} iconRight - Icon to be displayed to the right of the link text.
 *
 * @function getSizeClass - Function to get the size class based on the size type.
 * @param {SizeType} size - Size type of the link
 * @returns {string} - Corresponding size class.
 *
 * @component NextLink - NextLink component.
 * @param {LinkProps} props - Properties of NextLink
 * @returns {JSX.Element} - JSX interface of NextLink.
 */

const NextLink: React.FC<LinkProps> = ({
    onClick,
    children,
    href,
    size,
    disabled,
    theme = 'light',
    iconLeft,
    iconRight,
    ...rest
}) => {
    const sizeClass = styles[size || 'small']
    const themeClass = theme === 'dark' ? styles.dark : styles.link
    if (disabled) {
        return (
            <span className={`${themeClass} ${styles.disabled} ${sizeClass}`}>
                {iconLeft && iconLeft}
                {children}
                {iconRight && iconRight}
            </span>
        )
    }
    return (
        <Link
            className={`${themeClass} ${sizeClass}`}
            {...rest}
            href={href}
            onClick={onClick}
        >
            {iconLeft && iconLeft}
            {children}
            {iconRight && iconRight}
        </Link>
    )
}

export default NextLink
