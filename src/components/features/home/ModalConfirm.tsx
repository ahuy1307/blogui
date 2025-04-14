// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-17 23:04:20"
//

import { Modal } from 'antd'
import React from 'react'
import styles from './ModalConfirmCancel.module.scss'
import Button from '@/components/ui/Button/Button'
import { useTranslations } from 'next-intl'

interface ModalConfirmProps {
    open: boolean
    onCancel: (value: boolean) => void
    onClickConfirm: () => void
    title: string
    description: string
}

const ModalConfirm = ({
    open,
    onCancel,
    onClickConfirm,
    title,
    description,
}: ModalConfirmProps) => {
    const t = useTranslations('header.ModalConfirm')
    const handleClose = () => {
        onCancel(false)
    }
    return (
        <Modal
            onCancel={handleClose}
            open={open}
            footer={null}
            closeIcon={null}
            className={styles.container}
        >
            <div className={styles.body}>
                <div className={styles.box_text}>
                    <div className={styles.title}>
                        <p>{title}</p>
                    </div>
                    <p className={styles.desc}>{description}</p>
                </div>
                <div className={styles.box_actions}>
                    <Button
                        onClick={onClickConfirm}
                        size="small"
                        type="primary"
                        className={styles.btn_agree}
                    >
                        {t('confirm')}
                    </Button>
                    <Button
                        size="small"
                        onClick={handleClose}
                        className={styles.btn_cancel}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ModalConfirm
