import Image from 'next/image'
import { Button } from '@components/ui/ui-kit.tsx'

interface ProcessedImageProps {
    image: string
}

const downloadImage = (image: string) => {
    const link = document.createElement('a')
    link.href = image
    link.download = 'mockup.png'
    link.click()
}

const ProcessedImage = ({ image }: ProcessedImageProps) => {
    return (
        <div
            id="processed-image"
            className={`grid w-full gap-8 rounded-3xl bg-[#282828] p-4 md:gap-12 md:p-8 lg:gap-16 lg:p-12`}
        >
            <div className="relative aspect-[1]">
                <Image
                    className="object-contain"
                    src={image}
                    sizes={'(max-width: 735px) 100vw, 50vw'}
                    fill={true}
                    priority={true}
                    alt=""
                />
            </div>
            <div className="flex  h-20 w-full items-center justify-center md:h-28 lg:h-32">
                <Button tone="brand" onClick={() => downloadImage(image)}>
                    Download
                </Button>
            </div>
        </div>
    )
}

export default ProcessedImage
