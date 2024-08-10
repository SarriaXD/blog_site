'use client'

import ImageUploader from './components/ImageLoader.tsx'
import { FrameGallery } from './components/FrameGallery.tsx'
import ImageLoaderOptions from './components/ImageLoaderOptions.tsx'
import { Alert, Button } from '../../components/Material.tsx'
import { iphone_frame, pixel_frame } from '../../../public/images'
import { useCallback, useEffect, useState } from 'react'
import ProcessedImage from './components/ProcessedImage.tsx'

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

const MainContent = () => {
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
                // 'https://api.sarria.ca/mockup-device',
                'http://192.168.2.18:1234/mockup-device',
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
    // revoke object url when component unmounts
    useEffect(() => {
        return () => {
            if (processedImage) {
                URL.revokeObjectURL(processedImage)
            }
        }
    }, [processedImage])
    return (
        <div className="p-8">
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
                            color="blue-gray"
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
            <Alert
                open={errorMessage !== null}
                color="red"
                onClose={() => setErrorMessage(null)}
                animate={{
                    mount: { y: -50 },
                    unmount: { y: 100 },
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                {errorMessage}
            </Alert>
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <section className="bg-[#1E1E1E] py-24">
                <div className="mx-auto min-h-[100vh] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </section>
        </main>
    )
}
