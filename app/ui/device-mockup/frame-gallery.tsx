import Image from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'

interface FrameGallery {
    image: StaticImport
    name: string
    cornerRadius: number
}

interface FrameGalleryProps {
    data: FrameGallery[]
    current: number
    onCurrentChange: (index: number) => void
}

export function FrameGallery({
    data,
    current,
    onCurrentChange,
}: FrameGalleryProps) {
    return (
        <div
            className={`grid w-full gap-8 rounded-3xl bg-[#262626] p-4 md:gap-12 md:p-8 lg:gap-16 lg:p-12`}
        >
            <div className="relative aspect-[1]">
                <Image
                    className="object-contain"
                    src={data[current].image}
                    sizes={'(max-width: 735px) 100vw, 50vw'}
                    fill={true}
                    priority={true}
                    alt=""
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {data.map(({ image, name }, index) => (
                    <div
                        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl p-1 md:gap-4 md:p-2 lg:gap-8 lg:p-4"
                        key={index}
                        style={{
                            border:
                                current === index
                                    ? '1px solid rgba(255, 255, 255, 0.5)'
                                    : '1px solid transparent',
                        }}
                    >
                        <div
                            className="relative h-20 w-full md:h-28 lg:h-32"
                            onClick={() => onCurrentChange(index)}
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
                        <p
                            className="text-center text-[12px] !font-semibold !tracking-tight transition-colors md:text-[14px] lg:text-[16px]"
                            style={{
                                color:
                                    current === index ? '#ffffff' : '#757575',
                            }}
                        >
                            {name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
