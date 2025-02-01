import { ConfigProvider } from 'antd'
import AntTextArea, { type TextAreaProps } from 'antd/es/input/TextArea'

const TextArea: React.FC<TextAreaProps> = (props) => {
    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                components: {
                    Input: {
                        colorBorder: 'var(--border-color-default)',
                        activeBorderColor: 'var(--border-color-active)',
                        hoverBorderColor: 'var(--border-color-hover)',
                        colorErrorBorderHover: 'var(--border-color-error)',
                        colorBgContainerDisabled:
                            'var(--background-black-disabled)',
                        colorError: 'var(--border-color-error)',
                        colorTextDisabled: 'var(--text-color-disable)',
                        colorErrorText: 'var(--text-color-red)',
                    },
                },
            }}
        >
            <AntTextArea {...props} />
        </ConfigProvider>
    )
}
export default TextArea
