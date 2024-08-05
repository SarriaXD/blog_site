'use client'

import Image from 'next/image'
import { flutter_project_1 } from '../../public/images'
import { Button, Typography } from './Material.tsx'
import Link from 'next/link'
import { ArrowRight } from '../../public/icons'
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import { useRef, useState } from 'react'

const FlutterProjectTitle = () => {
    return (
        <div className="mx-auto w-[300px] md:w-[578px] lg:w-[735px]">
            <Typography
                variant={'h3'}
                className="text-4xl text-[#86868b] md:text-7xl lg:text-8xl"
            >
                Diver Test App.
            </Typography>
            <Typography
                variant={'h4'}
                className="text-4xl md:text-7xl lg:text-8xl"
            >
                Power by Flutter. <br />
                Material Design.
            </Typography>
        </div>
    )
}

const FlutterProjectFindMore = () => {
    return (
        <div className="absolute top-0 h-full w-full">
            <div
                className="sticky z-50 flex items-center justify-center py-4"
                style={{
                    top: 'calc(100vh - 5rem)',
                }}
            >
                <Link href={'/'}>
                    <Button
                        size="lg"
                        className="flex items-center gap-3 rounded-full bg-gray-900 bg-opacity-80 backdrop-blur"
                    >
                        Find More about This Project
                        <ArrowRight className="size-10 rounded-full bg-gray-800 p-2 text-white" />
                    </Button>
                </Link>
            </div>
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
    const scale = useTransform(scrollYProgress, [0, 1], [2, 1])
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress === 1 && !isInView) {
            setIsInView(true)
        }
        if (progress < 1 && isInView) {
            setIsInView(false)
        }
    })
    return {
        ref,
        scale,
        isInView,
    }
}

const FlutterProjectImageGallery = () => {
    const { ref, scale, isInView } = useFlutterProjectImageListAnimation()
    return (
        <div
            ref={ref}
            className="flex w-[92%] items-center justify-between md:w-full"
            style={{
                perspective: '2000px',
            }}
        >
            <motion.div
                className="z-0"
                animate={{
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 20,
                }}
                transition={{
                    type: 'spring',
                    duration: 1.2,
                }}
            >
                <Image
                    src={flutter_project_1}
                    quality="100"
                    alt="flutter project image 1"
                />
            </motion.div>
            <motion.div
                className="z-10"
                style={{
                    scale,
                    transformOrigin: 'top',
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                <Image
                    src={flutter_project_1}
                    quality="100"
                    alt="flutter project image 1"
                />
            </motion.div>
            <motion.div
                className="z-0"
                animate={{
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 20,
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
            >
                <Image
                    src={flutter_project_1}
                    quality="100"
                    alt="flutter project image 1"
                />
            </motion.div>
        </div>
    )
}

const useFlutterProjectIntroductionAnimation = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end end'],
    })
    const [isInView, setIsInView] = useState(false)
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress === 1 && !isInView) {
            setIsInView(true)
        }
        if (progress < 1 && isInView) {
            setIsInView(false)
        }
    })
    return {
        ref,
        isInView,
    }
}

const FlutterProjectIntroduction = () => {
    const { ref, isInView } = useFlutterProjectIntroductionAnimation()
    return (
        <motion.div
            ref={ref}
            animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : 20,
            }}
            transition={{
                type: 'spring',
                duration: 1.2,
            }}
            className="p-8"
        >
            <Typography variant={'h1'} className={'text-2xl'}>
                Dynamic Color Theme
            </Typography>
            <Typography variant={'paragraph'} className={'mt-4 font-semibold'}>
                You can use Dark and Light theme in this app. You can choose the
                color theme that you like.
            </Typography>
        </motion.div>
    )
}

const FlutterProject = () => {
    return (
        <div className="sticky top-0 mx-auto h-[100vh] md:w-[692px] lg:w-[900px]">
            <FlutterProjectFindMore />
            <div className="mx-auto flex h-full max-w-[530px] flex-col items-center justify-center py-20 md:max-w-full lg:px-[8.33333333%]">
                <FlutterProjectImageGallery />
                <FlutterProjectIntroduction />
            </div>
            <div className="h-20" />
        </div>
    )
}

export const FlutterProjectSection = () => {
    return (
        <section>
            <div className="mx-auto h-[400vh] bg-[#101010] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                <FlutterProjectTitle />
                <FlutterProject />
            </div>
        </section>
    )
}
