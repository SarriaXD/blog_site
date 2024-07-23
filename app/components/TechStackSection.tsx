'use client'

import { Typography } from '@material-tailwind/react'
import { frameworkTechData, languageTechData } from '../data/TechStackData.ts'
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    wrap,
} from 'framer-motion'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

// Duplicate the data to make looping easier
const frameworksCarouselData = [...frameworkTechData]

const languagesCarouselData = [...languageTechData]

interface CarouselItemProps {
    image: StaticImageData
    title: string
    subtitle: string
    link: string
}

const CarouselItem = ({ image, title, link }: CarouselItemProps) => {
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
                            className="object-contain"
                        />
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
    data: CarouselItemProps[]
    reversed: boolean
}

const Carousel = ({ data, reversed }: CarouselProps) => {
    const baseX = useMotionValue(0)
    const speed = 0.035
    const delta = reversed ? -speed : speed
    const x = useTransform(baseX, (v) => `${wrap(-33.33333333333333, 0, v)}%`)
    useAnimationFrame(() => {
        baseX.set(baseX.get() + delta)
    })
    return (
        <div
            className="flex h-full w-full
         flex-col
         rounded-lg
         bg-opacity-60
         p-4 md:p-6 lg:p-8"
        >
            <div className="overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-50px),transparent_100%)] xl:[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-150px),transparent_100%)]">
                <motion.ul
                    className="flex w-[max-content]"
                    style={{
                        x,
                    }}
                >
                    {data.map((tech, index) => (
                        <CarouselItem key={index} {...tech} />
                    ))}
                    <CarouseEmptyItem />
                    {data.map((tech, index) => (
                        <CarouselItem key={index} {...tech} />
                    ))}
                    <CarouseEmptyItem />
                    {data.map((tech, index) => (
                        <CarouselItem key={index} {...tech} />
                    ))}
                    <CarouseEmptyItem />
                </motion.ul>
            </div>
            <Typography variant="h6" className="mt-2 text-center text-xs">
                {`${reversed ? 'Languages' : 'Frameworks'} I've worked with`}
            </Typography>
        </div>
    )
}

export const TechStackSection = () => {
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
                <Carousel data={frameworksCarouselData} reversed={false} />
                <div className="mt-8" />
                <Carousel data={languagesCarouselData} reversed={true} />
            </motion.section>
        </>
    )
}
