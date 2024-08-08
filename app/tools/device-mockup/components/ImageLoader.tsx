import React, { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Add, Close } from '../../../../public/icons'

interface ImageWithCloseButtonProps {
    image: string
    onRemove: () => void
}

const ImageWithCloseButton = ({
    image,
    onRemove,
}: ImageWithCloseButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const [buttonPosition, setButtonPosition] = useState<{
        top: number
        right: number
    } | null>(null)

    useEffect(() => {
        const updateButtonPosition = () => {
            if (containerRef.current && imageRef.current) {
                const { naturalWidth, naturalHeight } = imageRef.current
                const { width: containerWidth, height: containerHeight } =
                    containerRef.current.getBoundingClientRect()

                const scale = Math.min(
                    containerWidth / naturalWidth,
                    containerHeight / naturalHeight
                )
                const scaledWidth = naturalWidth * scale
                const scaledHeight = naturalHeight * scale

                const top = (containerHeight - scaledHeight) / 2 - 12
                const right = (containerWidth - scaledWidth) / 2 - 12

                setButtonPosition({ top, right })

                console.log(
                    'scaledWidth',
                    scaledWidth,
                    'scaledHeight',
                    scaledHeight,
                    'top',
                    top,
                    'right',
                    right
                )
            }
        }

        const image = imageRef.current
        if (image) {
            if (image.complete) {
                updateButtonPosition()
            } else {
                image.onload = updateButtonPosition
            }
        }

        window.addEventListener('resize', updateButtonPosition)
        return () => window.removeEventListener('resize', updateButtonPosition)
    }, [image])

    return (
        <div className="size-full p-3">
            <div ref={containerRef} className="relative size-full">
                <Image
                    ref={imageRef}
                    src={image}
                    alt="Uploaded image"
                    fill={true}
                    className="object-contain"
                />
                {buttonPosition && (
                    <Close
                        className="absolute size-6 rounded-full bg-gray-500 p-1 text-white"
                        style={{
                            top: `${buttonPosition.top}px`,
                            right: `${buttonPosition.right}px`,
                        }}
                        onClick={onRemove}
                    />
                )}
            </div>
        </div>
    )
}

interface ImageUploaderProps {
    onImageLoaded: (image: string) => void
    onImageRemoved: () => void
    onError: (error: string) => void
}

const ImageUploader = ({
    onImageLoaded,
    onImageRemoved,
    onError,
}: ImageUploaderProps) => {
    const [image, setImage] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)
    const [errorMessages, setErrorMessages] = useState<string | null>(null)

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                onError('Only images are allowed')
                return
            }
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const image = e.target?.result as string
                setImage(image)
                onImageLoaded(image)
            }
            reader.readAsDataURL(file)
        },
        [onError, onImageLoaded]
    )

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            if (e.dataTransfer.items[0].type.startsWith('image/')) {
                setIsDragging(true)
            } else {
                setErrorMessages('Only images are allowed')
            }
        }
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current--
        if (dragCounter.current === 0) {
            setIsDragging(false)
            setErrorMessages(null)
        }
    }, [])

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            setErrorMessages(null)
            dragCounter.current = 0
            const file = e.dataTransfer.files[0]
            handleFile(file)
        },
        [handleFile]
    )

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                handleFile(file)
            }
        },
        [handleFile]
    )

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onClick={
                image
                    ? undefined
                    : () => document.getElementById('fileInput')?.click()
            }
            className="relative flex aspect-[1] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-600 md:w-80 lg:w-96"
            style={{
                cursor: image ? 'default' : 'pointer',
            }}
        >
            {isDragging && (
                <div className="flex size-full items-center justify-center bg-gray-400">
                    Release to upload
                </div>
            )}
            {errorMessages && (
                <div className="flex size-full items-center justify-center">
                    {errorMessages}
                </div>
            )}
            {!image && !isDragging && !errorMessages && (
                <Add className="size-12 text-gray-600" />
            )}
            {image && (
                <ImageWithCloseButton
                    image={image}
                    onRemove={() => {
                        setImage(null)
                        onImageRemoved()
                    }}
                />
            )}
            <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={onChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default ImageUploader
