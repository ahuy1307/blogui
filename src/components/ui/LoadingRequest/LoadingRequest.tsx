// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import React from 'react'
import styles from './LoadingRequest.module.scss'
import { ClipLoader } from 'react-spinners'

const LoadingRequest = ({ isLoading = false }: { isLoading?: boolean }) => {
    return (
        <>
            {isLoading && (
                <div className={styles.layout}>
                    <ClipLoader color={'var(--text-color-brand)'} size={40} />
                </div>
            )}
        </>
    )
}

export default LoadingRequest
