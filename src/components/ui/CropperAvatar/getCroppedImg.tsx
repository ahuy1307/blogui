// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
    const image = new Image()
    image.src = imageSrc

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    await new Promise((resolve) => {
        image.onload = resolve
    })

    ctx?.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
    )

    return new Promise<string>((resolve, reject) => {
        const base64Image = canvas.toDataURL('image/jpeg')
        resolve(base64Image)
    })
}

export default getCroppedImg
