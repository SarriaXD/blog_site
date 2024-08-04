'use client'

import Image from 'next/image'
import { flutter_project_1, iphone_frame } from '../../public/images'
import { Button, Typography } from './Material.tsx'
import Link from 'next/link'
import { ArrowRight } from '../../public/icons'
import { CSSProperties, useRef, useState } from 'react'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'

const FlutterProjectTitle = () => {
    return (
        <div className="absolute top-0 h-full w-full">
            <div
                className="sticky z-50 flex items-center justify-center py-4"
                style={{
                    top: 'calc(100vh - 5rem)',
                }}
            >
                <Link href={'/'}>
                    <Button className="flex items-center gap-3 rounded-full bg-gray-900 bg-opacity-80 backdrop-blur">
                        Find More about This Project
                        <ArrowRight className="size-8 rounded-full bg-gray-800 p-1 text-white" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

interface FlutterProjectImageProps {
    src: string | StaticImport
    alt: string
    className?: string | undefined
    style?: CSSProperties | undefined
}

const FlutterProjectImage = ({
    src,
    alt,
    className,
    style,
}: FlutterProjectImageProps) => {
    return (
        <div className={`relative inline-block ${className}`} style={style}>
            <Image
                src={src}
                alt={alt}
                className="absolute inset-x-0 z-0 h-full w-full rounded-3xl p-2 md:rounded-[2rem] md:p-3 xl:rounded-[3rem] xl:p-4"
            />
            <Image
                src={iphone_frame}
                alt="iphone frame"
                className="relative z-10"
            />
        </div>
    )
}

const useFlutterProjectImageListAnimation = () => {
    const ref = useRef(null)
    const [isInView, setIsInView] = useState(false)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['center end', 'center center'],
    })
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress === 1 && !isInView) {
            setIsInView(true)
        }
        if (progress < 1 && isInView) {
            setIsInView(false)
        }
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 20,
    })
    return {
        ref,
        smoothScrollYProgress,
        isInView,
    }
}

const FlutterProjectImageList = () => {
    const { ref, smoothScrollYProgress, isInView } =
        useFlutterProjectImageListAnimation()
    const mainImageScale = useTransform(smoothScrollYProgress, [0, 1], [1.5, 1])
    return (
        <div
            ref={ref}
            className="flex items-center justify-center gap-2 md:gap-4 xl:gap-8"
            style={{
                perspective: '2000px',
            }}
        >
            <motion.div
                className="z-0"
                animate={{
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 50,
                }}
                style={{
                    scale: 0.85,
                    rotateY: '-15deg',
                    transformOrigin: 'right 70%',
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                <FlutterProjectImage
                    src={flutter_project_1}
                    alt="flutter project image 1"
                />
            </motion.div>
            <motion.div
                className="z-10 h-auto w-auto"
                style={{
                    scale: mainImageScale,
                    transformOrigin: 'bottom',
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                <FlutterProjectImage
                    src={flutter_project_1}
                    alt="flutter project image 1"
                    className="h-full"
                />
            </motion.div>
            <motion.div
                className="z-0"
                animate={{
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 50,
                }}
                style={{
                    rotateY: '15deg',
                    scale: 0.85,
                    transformOrigin: 'left 70%',
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                <FlutterProjectImage
                    src={flutter_project_1}
                    alt="flutter project image 1"
                />
            </motion.div>
        </div>
    )
}

const FlutterProjectIntroduction = () => {
    return (
        <div>
            <Typography variant={'h1'} className={'text-2xl'}>
                Flutter Project
            </Typography>
            <Typography variant={'paragraph'} className={'mt-4'}>
                This is a project I did using Flutter. It is a mobile
                application that helps users to track their daily expenses and
                income. Users can add transactions, view their history, and see
                a summary of their financial status. This is a project I did
                using Flutter.
            </Typography>
        </div>
    )
}

const FlutterProject = () => {
    return (
        <div className="container sticky top-0 mx-auto h-[100vh]">
            <FlutterProjectTitle />
            <div className="flex h-full flex-col items-center justify-center xl:flex-row">
                <FlutterProjectImageList />
                <FlutterProjectIntroduction />
            </div>
            <div className="h-20" />
        </div>
    )
}

export const FlutterProjectSection = () => {
    return (
        <section className="h-[400vh]">
            <FlutterProject />
        </section>
    )
}
