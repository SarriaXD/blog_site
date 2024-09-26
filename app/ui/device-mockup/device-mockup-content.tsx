'use client'

import ImageUploader from './image-loader.tsx'
import { FrameGallery } from './frame-gallery.tsx'
import ImageLoaderOptions from './image-loader-options.tsx'
import { Alert, Button } from '@ui/material.tsx'
import { iphone_frame, pixel_frame } from '@public/images'
import { useCallback, useEffect, useState } from 'react'
import ProcessedImage from './processed-image.tsx'

const frameGalleryData = [
    {
        image: iphone_frame,
        name: 'iPhone 15 pro',
        cornerRadius: 120,
    },
    {
        image: pixel_frame,
        name: 'Pixel 7',
        cornerRadius: 120,
    },
]

const options = [
    {
        title: 'contain',
        description:
            'Device frame is resized to fit the image. The image ratio is maintained.',
    },
    {
        title: 'fit',
        description:
            'Image is resized to fit the device frame. The image ratio is not maintained.',
    },
]

const navigateToProcessedImage = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
        const topOffset =
            section.getBoundingClientRect().top + window.scrollY - 100
        window.scrollTo({
            top: topOffset,
            behavior: 'smooth',
        })
    }
}

const DeviceMockupContent = () => {
    const [currentFrame, setCurrentFrame] = useState(0)
    const [activeOption, setActiveOption] = useState(0)
    const [image, setImage] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)

    const handleGenerateMockup = useCallback(async () => {
        if (!image) {
            setErrorMessage('No image selected')
            return
        }
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('image', image)
            formData.append('frame', frameGalleryData[currentFrame].name)
            formData.append('option', options[activeOption].title)
            const response = await fetch(
                'https://api.sarria.ca/mockup-device',
                {
                    method: 'POST',
                    body: formData,
                }
            )

            if (!response.ok) {
                setErrorMessage('Image processing failed')
                return
            }
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            setProcessedImage(url)
        } catch (error) {
            setErrorMessage('Error uploading image. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [image, currentFrame, activeOption])
    useEffect(() => {
        if (processedImage) {
            navigateToProcessedImage('processed-image')
        }
    }, [processedImage])
    // revoke object url when component unmounts
    useEffect(() => {
        return () => {
            if (processedImage) {
                URL.revokeObjectURL(processedImage)
            }
        }
    }, [processedImage])
    return (
        <div className="p-8 md:p-16 lg:p-24">
            <div className="flex w-full flex-col items-center justify-center gap-8 md:flex-row">
                <div className="w-[300px] md:w-[500px] lg:w-[800px]">
                    {processedImage && (
                        <ProcessedImage image={processedImage} />
                    )}
                    {!processedImage && (
                        <FrameGallery
                            data={frameGalleryData}
                            current={currentFrame}
                            onCurrentChange={setCurrentFrame}
                        />
                    )}
                </div>
                <div className="w-[300px] md:w-[500px] lg:w-[800px]">
                    <ImageUploader
                        onError={(error) => {
                            setErrorMessage(error)
                        }}
                        onImageLoaded={(image) => {
                            setImage(image)
                            setProcessedImage(null)
                        }}
                        onImageRemoved={() => {
                            setImage(null)
                            setProcessedImage(null)
                        }}
                    />
                    <ImageLoaderOptions
                        tabs={options}
                        activeTab={activeOption}
                        setActiveTab={setActiveOption}
                    />
                    <div className="flex items-center justify-center">
                        <Button
                            color="blue"
                            onClick={handleGenerateMockup}
                            loading={isLoading}
                            disabled={
                                isLoading || !image || processedImage !== null
                            }
                        >
                            Generate Mockup
                        </Button>
                    </div>
                </div>
            </div>
            <div className="pointer-events-none fixed inset-x-8 top-0 z-50 h-[100vh] md:inset-x-16 lg:inset-x-32">
                <Alert
                    open={errorMessage !== null}
                    color="red"
                    onClose={() => setErrorMessage(null)}
                    animate={{
                        mount: { y: 0 },
                        unmount: { y: 200 },
                    }}
                    transition={{
                        type: 'spring',
                        duration: 1,
                    }}
                    className="pointer-events-auto absolute bottom-[5%] px-8"
                >
                    {errorMessage}
                </Alert>
            </div>
        </div>
    )
}

export default DeviceMockupContent
