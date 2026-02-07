'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import { StaticImageColor } from '@lib/utils/utils.ts'
import { useMediaQuery } from '@lib/hooks/hooks.ts'
import { hero_backend, hero_mobile, hero_web } from '@public/images'
import { Container, Section, Stack } from '@ui/ui-kit.tsx'

const Introduction = () => {
    return (
        <div className="mx-auto flex max-w-[460px] flex-col gap-4 py-8 text-center md:w-[519px] md:max-w-full md:gap-8 md:py-12 lg:w-[980px] lg:gap-12 lg:py-16">
            <motion.div
                initial={{
                    opacity: 0.01,
                    y: 50,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                <h1 color="white" className="text-4xl md:text-7xl lg:text-8xl">
                    <span
                        className="bg-clip-text text-transparent"
                        style={{
                            backgroundImage:
                                'linear-gradient(90deg, #e8867c, #f5af19, #f12711)',
                        }}
                    >
                        I'm Qi
                    </span>
                    , a software engineer based in Canada.
                </h1>
            </motion.div>
            <motion.div
                initial={{
                    opacity: 0.01,
                    y: 50,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    type: 'spring',
                    delay: 0.2,
                    duration: 1,
                }}
            >
                <h2 className="text-2xl text-gray-600 md:text-3xl lg:text-4xl">
                    A full-stack developer.
                </h2>
            </motion.div>
        </div>
    )
}

const galleryData = [
    {
        image: hero_mobile,
        alt: 'Building Cross-Platform Apps',
        title: 'Building Cross-Platform Apps',
        subtitle: 'Mobile Developer & Innovator',
        content:
            'Developing fast, cross-platform apps with Flutter. Expertise in native Android using Jetpack Compose for optimized UI and performance.',
        reversed: true,
    },
    {
        image: hero_web,
        alt: 'Building Fast Web Apps',
        title: 'Building Fast Web Apps',
        subtitle: 'Experienced React Developer',
        content:
            'Crafting high-performance React SPAs with sleek animations. Implementing SSR for faster load times and optimizing for SEO to boost visibility.',
        reversed: false,
    },
    {
        image: hero_backend,
        alt: 'Building Robust Backend Systems',
        title: 'Building Robust Backend Systems',
        subtitle: 'Backend Developer & Cloud Enthusiast',
        content:
            'Delivering high-performance Spring Boot services with AWS expertise. Specializing in scalable backend solutions and efficient CI/CD pipelines.',
    },
]

interface ImageGalleryProps {
    color: StaticImageColor
    image: StaticImageData
    alt: string
    title: string
    subtitle: string
    content: string
    reversed: boolean
    priority: boolean
}

const ImageGallery = ({
    color,
    image,
    alt,
    title,
    subtitle,
    content,
    reversed,
    priority,
}: ImageGalleryProps) => {
    const introductionProps = {
        title,
        subtitle,
        content,
    }
    return (
        <motion.div
            initial={{
                opacity: 0.01,
                y: 50,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                type: 'tween',
                duration: 0.5,
                delay: 0.5,
            }}
        >
            <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12 lg:gap-16">
                {reversed && <GalleryIntroduction {...introductionProps} />}
                <GalleryImage
                    image={image}
                    color={color}
                    alt={alt}
                    priority={priority}
                />
                {!reversed && <GalleryIntroduction {...introductionProps} />}
            </div>
        </motion.div>
    )
}

interface GalleryImageProps {
    image: StaticImageData
    color: StaticImageColor
    alt: string
    priority: boolean
}

const GalleryImage = ({ image, color, alt, priority }: GalleryImageProps) => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 70%', 'start 25%'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })

    const y = useTransform(smoothScrollYProgress, [0, 1], ['10%', '0%'])
    const rotateX = useTransform(
        smoothScrollYProgress,
        [0, 1],
        ['20deg', '0deg']
    )
    const gradientBackground = `linear-gradient(to top, ${color.mainColor}, ${color.secondaryColor}, transparent)`
    return (
        <div
            className="max-w-[460px] flex-1 md:max-w-full"
            style={{
                perspective: 1200,
            }}
        >
            <motion.div
                ref={ref}
                style={{
                    transformOrigin: 'bottom',
                    rotateX,
                    y,
                }}
            >
                <Image
                    src={image}
                    priority={priority}
                    alt={alt}
                    sizes={'(max-width: 735px) 100vw, 50vw'}
                    className="relative z-10"
                />
                <div
                    className="absolute inset-x-0 -bottom-[15%] h-3/4 rounded-b-full blur-3xl will-change-transform"
                    style={{
                        background: gradientBackground,
                    }}
                />
            </motion.div>
        </div>
    )
}

interface GalleryIntroductionProps {
    title: string
    subtitle: string
    content: string
}

const GalleryIntroduction = ({
    title,
    subtitle,
    content,
}: GalleryIntroductionProps) => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end end'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const y = useTransform(smoothScrollYProgress, [0, 1], ['30%', '0%'])
    const opacity = useTransform(smoothScrollYProgress, [0, 1], [0, 1])
    return (
        <motion.div
            ref={ref}
            style={{
                opacity,
                y,
            }}
            className="max-w-[420px] flex-1 flex-col md:max-w-full"
        >
            <strong className="text-lg text-gray-200">{title}</strong>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-6xl">
                {subtitle}
            </h1>
            <p className="pt-4 text-base text-gray-300 md:text-lg">{content}</p>
        </motion.div>
    )
}

interface HeroSectionProps {
    colorsMap: Map<string, StaticImageColor>
}

export const HeroSection = ({ colorsMap }: HeroSectionProps) => {
    const isMobile = useMediaQuery('(max-width: 735px)', true)
    return (
        <Section
            className="pb-20 pt-10 md:pb-28 md:pt-14"
            style={{
                backgroundImage:
                    'linear-gradient(180deg,#000000 0%,rgba(0,0,0,0) 100%), radial-gradient(200% 100% at -66% 36%, #0b014a 40%, rgb(0, 73, 184) 80%, rgb(50, 100, 227) 90%, rgb(0, 204, 255) 100%)',
            }}
        >
            <Container>
                <Stack space="lg" className="pb-4">
                    <Introduction />
                    <div className="flex flex-col gap-20 md:gap-24">
                        {galleryData.map((data, index) => {
                            const preReverse = index % 2 !== 0
                            const reversed = isMobile ? false : preReverse
                            return (
                                <ImageGallery
                                    key={index}
                                    color={colorsMap.get(data.image.src)!}
                                    {...data}
                                    priority={index === 0}
                                    reversed={reversed}
                                />
                            )
                        })}
                    </div>
                </Stack>
            </Container>
        </Section>
    )
}
