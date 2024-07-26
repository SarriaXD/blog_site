'use client'

import {
    Avatar,
    Card,
    CardBody,
    Chip,
    Typography,
} from '@material-tailwind/react'
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    wrap,
} from 'framer-motion'
import Image, { StaticImageData } from 'next/image'
import { StaticImageColor } from '../utils.ts'
import { useRef } from 'react'
import {
    frameworkTechData,
    languageTechData,
    techIntroductions,
} from '../data/TechStackData.ts'
import { useMediaQuery } from '../Hooks.ts'

interface CarouselItemProps {
    color: StaticImageColor
    image: StaticImageData
    name: string
}

const CarouselItem = ({ color, image, name }: CarouselItemProps) => {
    const gradientBackground = `linear-gradient(to top, ${color.mainColor}, ${color.secondaryColor})`
    return (
        <li className="rounded-2xl px-4 py-2">
            <div className="flex flex-col items-center gap-2">
                <div className="relative size-20">
                    <Image
                        src={image}
                        alt={`Logo of ${name}`}
                        fill={true}
                        className="relative z-10 object-contain"
                    />
                    {/* background shadow */}
                    <div className="absolute inset-x-[5%] -bottom-[20%] h-[20%] blur-[6px]">
                        <div
                            className="h-full w-full rounded-full"
                            style={{
                                background: gradientBackground,
                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                            }}
                        ></div>
                    </div>
                </div>
                <Typography variant="h6" className="relative z-10 text-xs">
                    {name}
                </Typography>
            </div>
        </li>
    )
}

const CarouseEmptyItem = () => {
    return (
        <span
            className="block size-12
             "
        />
    )
}

interface CarouselProps {
    colorsMap: Map<string, StaticImageColor>
    data: { name: string; image: StaticImageData }[]
    title: string
    subtitle: string
    reversed: boolean
}

const Carousel = ({
    colorsMap,
    title,
    subtitle,
    data,
    reversed,
}: CarouselProps) => {
    const baseX = useMotionValue(0)
    const speed = 0.06
    const delta = reversed ? -speed : speed
    const x = useTransform(baseX, (v) => `${wrap(-33.33333333333333, 0, v)}%`)
    useAnimationFrame(() => {
        baseX.set(baseX.get() + delta)
    })
    return (
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#1F1F1F]">
            <div className="mask-gradient w-full overflow-hidden">
                <motion.ul
                    className="flex w-[max-content]"
                    style={{
                        x,
                    }}
                >
                    {data.map((item, index) => (
                        <CarouselItem
                            color={colorsMap.get(item.image.src)!}
                            key={index}
                            {...item}
                        />
                    ))}
                    <CarouseEmptyItem />
                    {data.map((item, index) => (
                        <CarouselItem
                            color={colorsMap.get(item.image.src)!}
                            key={index}
                            {...item}
                        />
                    ))}
                    <CarouseEmptyItem />
                    {data.map((item, index) => (
                        <CarouselItem
                            color={colorsMap.get(item.image.src)!}
                            key={index}
                            {...item}
                        />
                    ))}
                    <CarouseEmptyItem />
                </motion.ul>
            </div>
            <div className="flex flex-col gap-4 p-6">
                <Typography variant="h5">{title}</Typography>
                <Typography
                    variant="paragraph"
                    className="text-xl text-[#989898]"
                >
                    {subtitle}
                </Typography>
            </div>
        </div>
    )
}

interface TechStackSectionProps {
    colorsMap: Map<string, StaticImageColor>
}

const TechTackSectionTitle = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['end end', 'start start'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const titleScale = useTransform(smoothScrollYProgress, [0, 0.6], [0.8, 1])
    const titleY = useTransform(smoothScrollYProgress, [0, 0.6], [50, 0])
    const titleOpacity = useTransform(smoothScrollYProgress, [0, 0.6], [0, 1])
    const subtitleScale = useTransform(
        smoothScrollYProgress,
        [0.6, 1],
        [1.2, 0.8]
    )
    const subtitleY = useTransform(smoothScrollYProgress, [0.3, 1], [-100, 0])
    return (
        <>
            <motion.div
                ref={ref}
                className="self-center"
                style={{
                    scale: titleScale,
                    opacity: titleOpacity,
                    y: titleY,
                }}
            >
                <Typography
                    variant={'h1'}
                    className="text-center text-[#E9E9E9]"
                >
                    Frameworks & Languages
                </Typography>
            </motion.div>
            <motion.div
                className="sticky top-3/4 z-50 self-center rounded-full bg-gray-100 bg-opacity-30 p-8 backdrop-blur-md"
                style={{
                    scale: subtitleScale,
                    y: subtitleY,
                }}
            >
                <Typography variant={'h4'} className="text-center">
                    My Code Engines
                </Typography>
            </motion.div>
        </>
    )
}

function chunkArray(
    array: {
        images: StaticImageData[]
        names: string[]
        introduction: string
    }[],
    chunkSize: number
): {
    images: StaticImageData[]
    names: string[]
    introduction: string
}[][] {
    const result = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

interface TechIntroductionItemProps {
    images: StaticImageData[]
    names: string[]
    introduction: string
}

const TechIntroductionItem = ({
    images,
    names,
    introduction,
}: TechIntroductionItemProps) => {
    return (
        <Card color={'gray'}>
            <CardBody className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {images.map((image, techIndex) => (
                        <Avatar key={techIndex} src={image.src} />
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {names.map((tech, techIndex) => (
                        <Chip
                            key={techIndex}
                            size="md"
                            value={tech}
                            color="blue"
                        />
                    ))}
                </div>
                <Typography variant="paragraph">{introduction}</Typography>
            </CardBody>
        </Card>
    )
}

interface TechIntroductionsProps {
    techIntroductions: {
        images: StaticImageData[]
        names: string[]
        introduction: string
    }[]
}

const TechIntroduction = ({ techIntroductions }: TechIntroductionsProps) => {
    const isMobile = useMediaQuery('(max-width: 720px)')
    const columns = isMobile ? 1 : 2
    const chunkedTechIntroduction = chunkArray(
        techIntroductions,
        Math.floor(techIntroductions.length / columns)
    )
    return (
        <div className="flex gap-4">
            {chunkedTechIntroduction.map((techIntroduction, index) => (
                <div key={index} className="flex flex-1 flex-col gap-4">
                    {techIntroduction.map((techIntroduction, index) => (
                        <TechIntroductionItem
                            key={index}
                            {...techIntroduction}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export const TechStackSection = ({ colorsMap }: TechStackSectionProps) => {
    return (
        <>
            <section className="bg-black px-8 py-16">
                <div className="mx-auto flex min-h-[100vh] flex-col gap-8 lg:max-w-[1080px]">
                    <TechTackSectionTitle />
                    <div className="flex flex-col gap-4 md:flex-row">
                        <Carousel
                            colorsMap={colorsMap}
                            {...frameworkTechData}
                            reversed={false}
                        />
                        <Carousel
                            colorsMap={colorsMap}
                            {...languageTechData}
                            reversed={true}
                        />
                    </div>
                    <TechIntroduction techIntroductions={techIntroductions} />
                    <div className="h-[200px]" />
                </div>
            </section>
        </>
    )
}
