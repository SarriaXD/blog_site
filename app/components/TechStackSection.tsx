'use client'

import { Card, CardBody, Chip, Typography } from './Material.tsx'
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
                        sizes={'5rem'}
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

const useCarouselAnimation = (index: number) => {
    const isMobile = useMediaQuery('(max-width: 720px)')
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end end'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    let startX = index % 2 === 0 ? '60%' : '-60%'
    startX = isMobile ? '0%' : startX
    const x = useTransform(smoothScrollYProgress, [0, 1], [startX, '0%'])
    let startScale = index % 2 === 0 ? 0.6 : 0.8
    startScale = isMobile ? 0.8 : startScale
    const scale = useTransform(smoothScrollYProgress, [0, 1], [startScale, 1])
    let startY = index % 2 === 0 ? 200 : 50
    startY = isMobile ? 0 : startY
    const y = useTransform(smoothScrollYProgress, [0, 1], [startY, 0])
    return { ref, x, y, scale }
}

const useCarouselScrollAnimation = (reversed: boolean) => {
    const baseX = useMotionValue(0)
    const speed = 0.06
    const delta = reversed ? -speed : speed
    const x = useTransform(baseX, (v) => `${wrap(-33.33333333333333, 0, v)}%`)
    useAnimationFrame(() => {
        baseX.set(baseX.get() + delta)
    })
    return x
}

interface CarouselProps {
    index: number
    colorsMap: Map<string, StaticImageColor>
    data: { name: string; image: StaticImageData }[]
    title: string
    subtitle: string
    reversed: boolean
}

const Carousel = ({
    index,
    colorsMap,
    title,
    subtitle,
    data,
    reversed,
}: CarouselProps) => {
    const scrollX = useCarouselScrollAnimation(reversed)
    const { ref, x, y, scale } = useCarouselAnimation(index)
    return (
        <motion.div
            ref={ref}
            className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#1F1F1F] bg-black"
            style={{
                x,
                y,
                scale,
            }}
        >
            <div className="mask-gradient w-full overflow-hidden">
                <motion.ul
                    className="flex w-[max-content]"
                    style={{
                        x: scrollX,
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
        </motion.div>
    )
}

interface TechStackSectionProps {
    colorsMap: Map<string, StaticImageColor>
}

const useTechTackSectionTitleAnimation = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['end end', 'start start'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const titleScale = useTransform(smoothScrollYProgress, [0, 0.3], [0.8, 1])
    const titleY = useTransform(smoothScrollYProgress, [0, 0.3], [-100, 0])
    const titleOpacity = useTransform(smoothScrollYProgress, [0, 0.3], [0, 1])
    const subtitleScale = useTransform(
        smoothScrollYProgress,
        [0.3, 1],
        [1.3, 0.9]
    )
    return { ref, titleScale, titleY, titleOpacity, subtitleScale }
}

const TechTackSectionTitle = () => {
    const { ref, titleScale, titleY, titleOpacity, subtitleScale } =
        useTechTackSectionTitleAnimation()
    return (
        <>
            <motion.div
                className="sticky top-[75vh] z-50 self-center rounded-full bg-gray-600 bg-opacity-30 p-8 backdrop-blur-md"
                style={{
                    scale: subtitleScale,
                }}
            >
                <Typography variant={'h4'} className="text-center">
                    Code Engines
                </Typography>
            </motion.div>
            <motion.div
                ref={ref}
                className="mb-8 self-center"
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
                    Frameworks & Languages I Master
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

const useTechIntroductionAnimation = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end end'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const scale = useTransform(smoothScrollYProgress, [0, 1], [0.9, 1])
    return { ref, scale }
}

const TechIntroductionItem = ({
    images,
    names,
    introduction,
}: TechIntroductionItemProps) => {
    const { ref, scale } = useTechIntroductionAnimation()
    return (
        <motion.div
            ref={ref}
            style={{
                scale,
            }}
        >
            <Card color={'gray'}>
                <CardBody className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {images.map((image, techIndex) => (
                            <div key={techIndex} className="relative size-12">
                                <Image
                                    src={image}
                                    fill={true}
                                    sizes={'3rem'}
                                    alt={`${names[techIndex]} image`}
                                    className="object-contain"
                                />
                            </div>
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
        </motion.div>
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
                            index={0}
                            colorsMap={colorsMap}
                            {...frameworkTechData}
                            reversed={false}
                        />
                        <Carousel
                            index={1}
                            colorsMap={colorsMap}
                            {...languageTechData}
                            reversed={true}
                        />
                    </div>
                    <TechIntroduction techIntroductions={techIntroductions} />
                    <div className="h-[10vh]" />
                </div>
            </section>
        </>
    )
}
