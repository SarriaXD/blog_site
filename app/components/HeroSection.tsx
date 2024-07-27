'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import { hero_backend, hero_mobile, hero_web } from '../../assets/images'
import { StaticImageColor } from '../utils.ts'
import { useMediaQuery } from '../Hooks.ts'
import { Typography } from './Material.tsx'

const MotionTypography = motion(Typography)

export const Introduction = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 80px', 'end start'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const smoothTitleY = useTransform(smoothScrollYProgress, [0, 1], [0, -300])
    const smoothSubtitleY = useTransform(
        smoothScrollYProgress,
        [0, 1],
        [0, -200]
    )
    return (
        <div
            ref={ref}
            className="flex flex-col gap-4 text-center md:gap-8 xl:gap-12"
        >
            <MotionTypography
                initial={{
                    opacity: 0,
                    y: 50,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    type: 'tween',
                    duration: 0.6,
                    delay: 0.2,
                }}
                style={{ y: smoothTitleY }}
                variant="h1"
                className="text-4xl md:text-6xl xl:text-8xl"
            >
                <span className="bg-hero-text-gradient bg-clip-text text-transparent">
                    I'm Qi
                </span>
                , a software engineer based in Canada.
            </MotionTypography>
            <MotionTypography
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
                    delay: 0.5,
                }}
                style={{ y: smoothSubtitleY }}
                variant="h3"
                color="gray"
                textGradient={true}
                className="text-xl md:text-2xl xl:text-3xl"
            >
                I specialize in full-stack development.
            </MotionTypography>
        </div>
    )
}

const heroImageWithIntroductionData = [
    {
        image: hero_mobile,
        alt: 'Hero Section',
        title: 'Building Cross-Platform Apps',
        subtitle: 'Mobile Developer & Innovator',
        content:
            'I create high-performance apps for iOS and Android using Flutter. For native Android, I leverage Jetpack Compose, ensuring smooth animations and optimal performance.',
        reversed: true,
    },
    {
        image: hero_web,
        alt: 'Hero Section',
        title: 'Building Fast Web Apps',
        subtitle: 'Experienced React Developer',
        content:
            'I create smooth single-page applications with React, focusing on performance and cool animations.',
        reversed: false,
    },
    {
        image: hero_backend,
        alt: 'Hero Section',
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
                opacity: 1,
                y: 0,
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
        offset: ['start end', 'start center'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const y = useTransform(smoothScrollYProgress, [0, 1], ['50%', '0%'])
    const rotateX = useTransform(
        smoothScrollYProgress,
        [0, 1],
        ['60deg', '0deg']
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
                className="relative"
            >
                <Image src={image} alt={alt} className="relative z-10" />
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
            <Typography variant={'h5'}>{title}</Typography>
            <Typography variant={'h1'}>{subtitle}</Typography>
            <Typography variant={'paragraph'} className="pt-4 text-xl">
                {content}
            </Typography>
        </motion.div>
    )
}

interface HeroSectionProps {
    colorsMap: Map<string, StaticImageColor>
}

export const HeroSection = ({ colorsMap }: HeroSectionProps) => {
    const isMobile = useMediaQuery('(max-width: 960px)')
    return (
        <>
            <section className="bg-hero-section-gradient ">
                <div className="container mx-auto flex flex-col items-stretch gap-8 px-4 pb-32 pt-24 md:gap-16 md:px-8 xl:gap-24 xl:px-12">
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
