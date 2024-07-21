'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Typography } from '@material-tailwind/react'
import { useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import { hero_mobile, hero_web } from '../../assets/images'
import { useMediaQuery } from 'react-responsive'

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
        title: 'Build Mobile Apps',
        subtitle: 'A mobile developer',
        content:
            'Use Flutter to build multi-platform apps, including iOS and Android. Use Jetpack Compose to build native Android apps.',
        reversed: true,
    },
    {
        image: hero_web,
        alt: 'Hero Section',
        title: 'Build Websites',
        subtitle: 'A web developer',
        content:
            'Use React to build single-page applications. Use Spring Boot to build back-end services.',
        reversed: false,
    },
]

interface HeroImageWithIntroductionProps {
    image: StaticImageData
    alt: string
    title: string
    subtitle: string
    content: string
    reversed: boolean
}

const HeroImageWithIntroduction = ({
    image,
    alt,
    title,
    subtitle,
    content,
    reversed,
}: HeroImageWithIntroductionProps) => {
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
            className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16 xl:gap-32"
        >
            {reversed && (
                <div className="gap flex flex-1 flex-col gap-4 p-4">
                    <Typography variant={'h4'}>{title}</Typography>
                    <Typography variant={'h1'}>{subtitle}</Typography>
                    <Typography variant={'paragraph'} className="text-lg">
                        {content}
                    </Typography>
                </div>
            )}
            <div className="flex-1">
                <Image src={image} alt={alt} />
            </div>
            {!reversed && (
                <div className="gap flex flex-1 flex-col gap-4 p-4">
                    <Typography variant={'h4'}>{title}</Typography>
                    <Typography variant={'h1'}>{subtitle}</Typography>
                    <Typography variant={'paragraph'} className="text-lg">
                        {content}
                    </Typography>
                </div>
            )}
        </motion.div>
    )
}

export const HeroSection = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 720px)' })
    return (
        <>
            <section className="bg-hero-section-gradient ">
                <div
                    className="container mx-auto
                 flex flex-col items-stretch gap-24
                 px-4 py-24 md:px-8 xl:px-12"
                >
                    <Introduction />
                    <HeroImageWithIntroduction
                        {...heroImageWithIntroductionData[0]}
                        reversed={false}
                    />
                    <HeroImageWithIntroduction
                        {...heroImageWithIntroductionData[1]}
                        reversed={!isMobile}
                    />
                </div>
            </section>
        </>
    )
}
