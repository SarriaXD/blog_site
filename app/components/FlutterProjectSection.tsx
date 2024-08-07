'use client'

import Image from 'next/image'
import { flutter_project_1 } from '../../public/images'
import { Button } from './Material.tsx'
import Link from 'next/link'
import { ArrowRight } from '../../public/icons'
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import { useRef, useState } from 'react'

const Title = () => {
    return (
        <div className="mx-auto max-w-[290px] md:w-[578px] md:max-w-full lg:w-[735px]">
            <h3 className="text-3xl text-[#86868b] md:text-6xl lg:text-8xl">
                Driving Test App.
            </h3>
            <h4 className="text-3xl text-[#F5F5F7] md:text-6xl lg:text-8xl">
                Powered by Flutter.
            </h4>
        </div>
    )
}

const ExploreStickyButton = () => {
    return (
        <div className="absolute top-0 h-full w-full">
            <div
                className="sticky z-50 mx-8 flex items-center justify-center py-4"
                style={{
                    top: 'calc(100vh - 100px)',
                }}
            >
                <Link href={'/'}>
                    <Button
                        size="sm"
                        className="flex items-center gap-3 rounded-full bg-gray-900 bg-opacity-80 backdrop-blur"
                    >
                        Explore This Project
                        <ArrowRight className="size-10 rounded-full bg-gray-800 p-2 text-white" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

const useFlutterProjectImageGalleryAnimation = () => {
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

const ImageGallery = () => {
    const { ref, scale, isInView } = useFlutterProjectImageGalleryAnimation()
    return (
        <div
            ref={ref}
            className="relative z-10 mx-auto mt-8 flex w-[92%] items-center justify-between gap-4 md:mt-0 md:w-full md:gap-6 lg:gap-8"
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
                <Image src={flutter_project_1} alt="flutter project image 1" />
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
                <Image src={flutter_project_1} alt="flutter project image 1" />
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
                <Image src={flutter_project_1} alt="flutter project image 1" />
            </motion.div>
        </div>
    )
}

const useFlutterProjectIntroductionAnimation = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'start 80%'],
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

const Introduction = () => {
    const { ref, isInView } = useFlutterProjectIntroductionAnimation()
    return (
        <motion.div
            ref={ref}
            animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : 50,
            }}
            transition={{
                type: 'spring',
                delay: isInView ? 0.5 : 0,
                duration: 1.2,
            }}
            className="relative z-0 p-8"
        >
            <div className="mx-auto mt-8 flex w-[90%] flex-col items-stretch gap-2 md:w-full md:flex-row md:justify-around">
                <h4 className="w-full text-3xl md:w-[45%] md:text-4xl">
                    Dynamic Color Theme
                </h4>
                <p className="w-full text-lg font-semibold text-[#86868b] md:w-[45%] md:text-xl">
                    You can use Dark and Light theme in this app. You can choose
                    the color theme that you like.
                </p>
                <div className="my-8 h-1 rounded bg-gray-600 md:my-0 md:h-auto md:w-1">
                    <ProgressBar />
                </div>
            </div>
        </motion.div>
    )
}

const ProgressBar = () => {
    return (
        <div className="relative h-2 w-full rounded-full bg-gray-800">
            <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#ff5f6d] to-[#ffc371]"
                initial={{
                    width: '0%',
                }}
                animate={{
                    width: '100%',
                }}
                transition={{
                    duration: 2,
                }}
            />
        </div>
    )
}

const MainContent = () => {
    return (
        <div className="sticky top-0 mx-auto h-[100vh] min-h-[900px] md:w-[692px] lg:w-[800px]">
            <ExploreStickyButton />
            <div className="mx-auto h-full max-w-[530px] py-20 md:max-w-full">
                <ImageGallery />
                <Introduction />
            </div>
        </div>
    )
}

export const FlutterProjectSection = () => {
    return (
        <section>
            <div className="mx-auto h-[400vh] bg-[#101010] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                <Title />
                <MainContent />
            </div>
        </section>
    )
}
