// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import styles from './CropperAvatar.module.scss'

const CropperAvatar = ({ image, onCropComplete }: any) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)

    return (
        <div className={styles.cropper_wrapper}>
            <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
            />
        </div>
    )
}
export default CropperAvatar
