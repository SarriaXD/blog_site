'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Typography } from '@material-tailwind/react'
import { useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import { hero_mobile, hero_web } from '../../assets/images'

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
            {/* for desktop layout */}
            <div className="hidden items-center justify-center lg:flex lg:flex-row lg:gap-40 ">
                {reversed && <HeroImageIntroduction {...introductionProps} />}
                <HeroImage image={image} alt={alt} />
                {!reversed && <HeroImageIntroduction {...introductionProps} />}
            </div>
            {/* for mobile layout */}
            <div className="flex flex-col items-center justify-center gap-2 lg:hidden">
                <HeroImage image={image} alt={alt} />
                <HeroImageIntroduction {...introductionProps} />
            </div>
        </motion.div>
    )
}

interface HeroImageProps {
    image: StaticImageData
    alt: string
}

const HeroImage = ({ image, alt }: HeroImageProps) => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end end'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    const y = useTransform(smoothScrollYProgress, [0, 1], [200, 0])
    return (
        <motion.div ref={ref} className="flex-1" style={{ y }}>
            <Image src={image} alt={alt} />
        </motion.div>
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
    return (
        <div className="flex flex-1 flex-col p-4">
            <Typography variant={'h5'}>{title}</Typography>
            <Typography variant={'h1'}>{subtitle}</Typography>
            <Typography variant={'paragraph'} className="pt-4 text-xl">
                {content}
            </Typography>
        </div>
    )
}

export const HeroSection = () => {
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
                        reversed={true}
                    />
                </div>
            </section>
        </>
    )
}
