import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from 'antd'
import React from 'react'

type ITooltip = AntdTooltipProps & {
    placement?:
        | 'top'
        | 'left'
        | 'right'
        | 'bottom'
        | 'topLeft'
        | 'topRight'
        | 'bottomLeft'
        | 'bottomRight'
        | 'leftTop'
        | 'leftBottom'
        | 'rightTop'
        | 'rightBottom'
    children: React.ReactNode
    title: React.ReactNode
    arrow?: boolean
}

/**
 * Property for the custom Tooltip component.
 *
 * @property {string}  placement  - The placement of the tooltip. {'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'}.
 * @property {React.ReactNode} title - The content to show when the tooltip is visible.
 * @property {boolean} arrow - Whether to show an arrow pointing to the referenced element.
 */

const Tooltip: React.FC<ITooltip> = ({
    title,
    arrow = true,
    placement = 'top',
    children,
    ...rest
}) => {
    return (
        <AntdTooltip
            placement={placement}
            title={title}
            arrow={arrow}
            {...rest}
        >
            {children}
        </AntdTooltip>
    )
}

export default Tooltip
