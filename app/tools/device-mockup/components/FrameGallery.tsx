import React from 'react'
import Image from 'next/image'
import { iphone_frame } from '../../../../public/images'

const data = [
    {
        image: iphone_frame,
    },
    {
        image: iphone_frame,
    },
]

interface FrameGalleryProps {
    className?: string | undefined
}

export function FrameGallery({ className = '' }: FrameGalleryProps) {
    const [active, setActive] = React.useState(0)

    return (
        <div className={`grid gap-4 md:gap-8 lg:gap-16 ${className}`}>
            <div className="relative aspect-[1]">
                <Image
                    className="object-contain"
                    src={data[active].image}
                    fill={true}
                    priority={true}
                    alt=""
                />
            </div>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {data.map(({ image }, index) => (
                    <div
                        className="relative h-40 max-w-full cursor-pointer"
                        onClick={() => setActive(index)}
                        key={index}
                    >
                        <Image
                            src={image}
                            fill={true}
                            priority={true}
                            className="object-contain"
                            alt="gallery-image"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
