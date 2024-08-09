import React from 'react'
import Image from 'next/image'
import { iphone_frame, pixel_frame } from '../../../../public/images'

const data = [
    {
        image: iphone_frame,
        name: 'iPhone 15 pro',
    },
    {
        image: pixel_frame,
        name: 'Pixel 7',
    },
]

export function FrameGallery() {
    const [active, setActive] = React.useState(0)

    return (
        <div
            className={`grid w-full gap-8 rounded-3xl bg-[#282828] p-4 md:gap-12 md:p-8 lg:gap-16 lg:p-12`}
        >
            <div className="relative aspect-[1]">
                <Image
                    className="object-contain"
                    src={data[active].image}
                    sizes={'(max-width: 735px) 100vw, 50vw'}
                    fill={true}
                    priority={true}
                    alt=""
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {data.map(({ image, name }, index) => (
                    <div
                        className="flex cursor-pointer flex-col items-center gap-2 p-1 md:gap-4 md:p-2 lg:gap-8 lg:p-4"
                        key={index}
                        style={{
                            border:
                                active === index
                                    ? '1px solid #757575'
                                    : '1px solid transparent',
                            borderRadius: '8px',
                        }}
                    >
                        <div
                            className="relative h-20 w-full md:h-28 lg:h-32"
                            onClick={() => setActive(index)}
                        >
                            <Image
                                src={image}
                                fill={true}
                                priority={true}
                                className="object-contain"
                                sizes={
                                    '(max-width: 735px) 33vw, (max-width: 1069px) 12.5vw , 10vw'
                                }
                                alt="gallery-image"
                            />
                        </div>
                        <p className="text-center text-[12px] !font-normal !tracking-tight md:text-[14px] lg:text-[16px]">
                            {name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
