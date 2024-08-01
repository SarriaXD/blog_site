'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import { StaticImageColor } from '../utils.ts'
import { useMediaQuery } from '../hooks.ts'
import { Typography } from './Material.tsx'
import { hero_backend, hero_mobile, hero_web } from '../../public/images'

const useIntroductionAnimation = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 96px', 'end 96px'],
    })
    const titleOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const titleY = useTransform(scrollYProgress, [0, 1], [0, -50])
    const subtitleOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -30])
    return {
        ref,
        titleOpacity,
        titleY,
        subtitleOpacity,
        subtitleY,
    }
}

export const Introduction = () => {
    const { ref, titleOpacity, subtitleOpacity, titleY, subtitleY } =
        useIntroductionAnimation()
    return (
        <div
            ref={ref}
            className="flex flex-col gap-4 py-8 text-center md:gap-8 md:py-12 xl:gap-12 xl:py-16"
        >
            <motion.div
                initial={{
                    opacity: 0,
                    y: 50,
                }}
                animate={{
                    opacity: [0, 1],
                    y: [50, 0],
                }}
                style={{ opacity: titleOpacity, y: titleY }}
                transition={{
                    type: 'spring',
                    duration: 1,
                    delay: 0.3,
                }}
            >
                <Typography
                    variant={'h1'}
                    color="white"
                    className="text-4xl md:text-6xl xl:text-8xl"
                >
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
                </Typography>
            </motion.div>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 50,
                }}
                animate={{
                    opacity: [0, 1],
                    y: [50, 0],
                }}
                transition={{
                    type: 'spring',
                    delay: 0.5,
                    duration: 1,
                }}
                style={{ opacity: subtitleOpacity, y: subtitleY }}
            >
                <Typography
                    variant="h2"
                    color="gray"
                    className="text-4xl md:text-5xl xl:text-6xl"
                >
                    A full-stack developer.
                </Typography>
            </motion.div>
        </div>
    )
}

const heroImageWithIntroductionData = [
    {
        image: hero_mobile,
        alt: 'Building Cross-Platform Apps',
        title: 'Building Cross-Platform Apps',
        subtitle: 'Mobile Developer & Innovator',
        content:
            'I create high-performance apps for iOS and Android using Flutter. For native Android, I leverage Jetpack Compose, ensuring smooth animations and optimal performance.',
        reversed: true,
    },
    {
        image: hero_web,
        alt: 'Building Fast Web Apps',
        title: 'Building Fast Web Apps',
        subtitle: 'Experienced React Developer',
        content:
            'I create smooth single-page applications with React, focusing on performance and cool animations.',
        reversed: false,
    },
    {
        image: hero_backend,
        alt: 'Building Robust Backend Systems',
        title: 'Building Robust Backend Systems',
        subtitle: 'Backend Developer & Cloud Enthusiast',
        content:
            'I develop high-performance backend services using Spring Boot, ensuring scalable and reliable applications. With expertise in AWS deployments and CI/CD pipelines, I deliver optimized backend solutions tailored to your needs.',
    },
]

interface HeroImageWithIntroductionProps {
    color: StaticImageColor
    image: StaticImageData
    alt: string
    title: string
    subtitle: string
    content: string
    reversed: boolean
}

const HeroImageWithIntroduction = ({
    color,
    image,
    alt,
    title,
    subtitle,
    content,
    reversed,
}: HeroImageWithIntroductionProps) => {
    const introductionProps = {
        title,
        subtitle,
        content,
    }
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 50,
            }}
            animate={{
                opacity: [0, 1],
                y: [50, 0],
            }}
            transition={{
                type: 'tween',
                duration: 0.6,
                delay: 1,
            }}
        >
            <div className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:gap-32">
                {reversed && <HeroImageIntroduction {...introductionProps} />}
                <HeroImage image={image} color={color} alt={alt} />
                {!reversed && <HeroImageIntroduction {...introductionProps} />}
            </div>
        </motion.div>
    )
}

interface HeroImageProps {
    image: StaticImageData
    color: StaticImageColor
    alt: string
}

const HeroImage = ({ image, color, alt }: HeroImageProps) => {
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
            className="flex-1"
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
                    priority={true}
                    alt={alt}
                    className="relative z-10"
                />
                <div
                    className="absolute inset-x-0 -bottom-[15%] h-3/4 rounded-b-full blur-3xl"
                    style={{
                        background: gradientBackground,
                    }}
                />
            </motion.div>
        </div>
    )
}

interface HeroImageIntroductionProps {
    title: string
    subtitle: string
    content: string
}

const HeroImageIntroduction = ({
    title,
    subtitle,
    content,
}: HeroImageIntroductionProps) => {
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
            className="flex flex-1 flex-col p-4"
        >
            <Typography
                variant={'lead'}
                className="font-semibold text-gray-200"
            >
                {title}
            </Typography>
            <Typography
                variant={'h1'}
                className="text-4xl md:text-5xl xl:text-6xl"
            >
                {subtitle}
            </Typography>
            <Typography
                variant={'paragraph'}
                className="pt-4 text-xl font-semibold text-gray-300"
            >
                {content}
            </Typography>
        </motion.div>
    )
}

interface HeroSectionProps {
    colorsMap: Map<string, StaticImageColor>
}

export const HeroSection = ({ colorsMap }: HeroSectionProps) => {
    const isMobile = useMediaQuery('(max-width: 960px)', true)
    return (
        <>
            <section
                style={{
                    backgroundImage:
                        'linear-gradient(180deg,#000000 0%,rgba(0,0,0,0) 100%), radial-gradient(200% 100% at -66% 36%, #0b014a 40%, rgb(0, 73, 184) 80%, rgb(50, 100, 227) 90%, rgb(0, 204, 255) 100%)',
                }}
            >
                <div className="container mx-auto px-4 pb-32 pt-24 md:px-8 xl:px-12">
                    <Introduction />
                    <div className="flex flex-col gap-24">
                        {heroImageWithIntroductionData.map((data, index) => {
                            const preReverse = index % 2 !== 0
                            const reversed = isMobile ? false : preReverse
                            return (
                                <HeroImageWithIntroduction
                                    key={index}
                                    color={colorsMap.get(data.image.src)!}
                                    {...data}
                                    reversed={reversed}
                                />
                            )
                        })}
                    </div>
                </div>
            </section>
        </>
    )
}
