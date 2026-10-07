import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Add, Close } from '@public/icons'

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

                const top = (containerHeight - scaledHeight) / 2
                const right = (containerWidth - scaledWidth) / 2

                setButtonPosition({ top, right })
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
                    className="absolute mt-2 mr-2 size-7 cursor-pointer rounded-full border border-white/40 bg-black/60 p-[7px] text-white backdrop-blur-md transition hover:bg-black/80"
                    style={{
                        top: `${buttonPosition.top}px`,
                        right: `${buttonPosition.right}px`,
                    }}
                    onClick={onRemove}
                />
            )}
        </div>
    )
}

interface ImageUploaderProps {
    onImageLoaded: (image: File) => void
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
    const [errorMessages, setErrorMessages] = useState<string | null>(null)

    const handleFile = useCallback(
        (file: File) => {
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const image = e.target?.result as string
                setImage(image)
                onImageLoaded(file)
            }
            reader.readAsDataURL(file)
        },
        [onImageLoaded]
    )

    const validateImage = (
        dataTransfer: DataTransfer
    ): string | null | undefined => {
        if (dataTransfer.items && dataTransfer.items.length > 0) {
            if (dataTransfer.items.length > 1) {
                return 'Too many items, only one image is allowed!'
            }
            if (!dataTransfer.items[0].type.startsWith('image/')) {
                return 'Only image is allowed!'
            }
            const allowedTypes = ['image/png', 'image/jpeg']
            if (!allowedTypes.includes(dataTransfer.items[0].type)) {
                return 'Only PNG and JPEG images are allowed!'
            }
            return null
        } else {
            return 'No file found!'
        }
    }

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const error = validateImage(e.dataTransfer)
        if (error) {
            setErrorMessages(error)
        }
        setIsDragging(true)
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        setErrorMessages(null)
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
            const error = validateImage(e.dataTransfer)
            if (error) {
                onError(error)
                return
            }
            handleFile(e.dataTransfer.files[0])
        },
        [handleFile, onError]
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
            className={`glass-inset-dark relative aspect-[1] w-full cursor-pointer rounded-[28px] border-2 border-dashed !border-white/20 transition-colors hover:!border-white/40`}
            style={{
                cursor: image ? 'default' : 'pointer',
            }}
        >
            {errorMessages && (
                <div className="flex size-full items-center justify-center rounded-[26px] bg-[#ff5c76]/20 px-6 text-center text-[#ffd6dd]">
                    {errorMessages}
                </div>
            )}
            {isDragging && !errorMessages && (
                <div className="flex size-full items-center justify-center rounded-[26px] bg-white/10">
                    Release to upload
                </div>
            )}
            {!image && !isDragging && !errorMessages && (
                <div className="flex size-full flex-col items-center justify-center gap-2 rounded-[26px] text-base text-white/70">
                    <Add className="size-12 text-white/40" />
                    Click or drag to upload an image
                </div>
            )}
            {image && !isDragging && !errorMessages && (
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
                accept="image/png, image/jpeg"
                onChange={onChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default ImageUploader
