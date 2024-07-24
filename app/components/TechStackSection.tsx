'use client'

import { Typography } from '@material-tailwind/react'
import {
    frameworkTechData,
    languageTechData,
    TechDataItem,
} from '../data/TechStackData.ts'
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    wrap,
} from 'framer-motion'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { StaticImageColor } from '../utils.ts'

// Duplicate the data to make looping easier
const frameworksCarouselData = [...frameworkTechData]

const languagesCarouselData = [...languageTechData]

interface CarouselItemProps {
    color: StaticImageColor
    image: StaticImageData
    title: string
    subtitle: string
    link: string
}

const CarouselItem = ({ color, image, title, link }: CarouselItemProps) => {
    const gradientBackground = `linear-gradient(to top, ${color.mainColor}, ${color.secondaryColor})`
    return (
        <li
            className="mx-2 flex-shrink-0
             rounded-2xl
             px-2 py-2 md:mx-4
             md:px-4 lg:mx-6 lg:px-6
             "
        >
            <Link href={link}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative size-16 md:size-24 xl:size-32">
                        <Image
                            src={image}
                            alt={`Logo of ${title}`}
                            fill={true}
                            className="relative z-10 object-contain"
                        />
                        <div className="absolute inset-x-[5%] -bottom-[30%] h-[20%] blur-md md:blur-lg">
                            <div
                                className="h-full w-full rounded-full"
                                style={{
                                    background: gradientBackground,
                                    clipPath:
                                        'polygon(50% 0%, 0% 100%, 100% 100%)',
                                }}
                            ></div>
                        </div>
                    </div>
                    <Typography
                        variant="h6"
                        className="text-xs md:text-sm xl:text-lg"
                    >
                        {title}
                    </Typography>
                </div>
            </Link>
        </li>
    )
}

const CarouseEmptyItem = () => {
    return (
        <span
            className="block size-16 flex-shrink-0 md:size-24 xl:size-32
             "
        />
    )
}

interface CarouselProps {
    colorsMap: Map<string, StaticImageColor>
    data: TechDataItem[]
    reversed: boolean
}

const Carousel = ({ colorsMap, data, reversed }: CarouselProps) => {
    const baseX = useMotionValue(0)
    const speed = 0.035
    const delta = reversed ? -speed : speed
    const x = useTransform(baseX, (v) => `${wrap(-33.33333333333333, 0, v)}%`)
    useAnimationFrame(() => {
        baseX.set(baseX.get() + delta)
    })
    return (
        <div
            className="flex w-full
         flex-col items-start"
        >
            <div className="mask-gradient w-full overflow-x-hidden">
                <motion.ul
                    className="flex w-[max-content] py-8 md:py-16 lg:py-24"
                    style={{
                        x,
                    }}
                >
                    {data.map((tech, index) => (
                        <CarouselItem
                            color={colorsMap.get(tech.image.src)!}
                            key={index}
                            {...tech}
                        />
                    ))}
                    <CarouseEmptyItem />
                    {data.map((tech, index) => (
                        <CarouselItem
                            color={colorsMap.get(tech.image.src)!}
                            key={index}
                            {...tech}
                        />
                    ))}
                    <CarouseEmptyItem />
                    {data.map((tech, index) => (
                        <CarouselItem
                            color={colorsMap.get(tech.image.src)!}
                            key={index}
                            {...tech}
                        />
                    ))}
                    <CarouseEmptyItem />
                </motion.ul>
            </div>
            {/*<Typography variant="h6" className="mt-2 text-center text-xs">*/}
            {/*    {`${reversed ? 'Languages' : 'Frameworks'} I've worked with`}*/}
            {/*</Typography>*/}
        </div>
    )
}

interface TechStackSectionProps {
    colorsMap: Map<string, StaticImageColor>
}

export const TechStackSection = ({ colorsMap }: TechStackSectionProps) => {
    return (
        <>
            <motion.section
                initial={{
                    opacity: 0,
                    y: 100,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    type: 'tween',
                    duration: 0.6,
                    delay: 1,
                }}
                className="mx-auto w-11/12 py-8 md:py-12 xl:py-16"
            >
                <Carousel
                    colorsMap={colorsMap}
                    data={frameworksCarouselData}
                    reversed={false}
                />
                <div className="mt-8" />
                <Carousel
                    colorsMap={colorsMap}
                    data={languagesCarouselData}
                    reversed={true}
                />
            </motion.section>
        </>
    )
}
