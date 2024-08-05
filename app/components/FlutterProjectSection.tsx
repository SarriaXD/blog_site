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

const FlutterProjectImageList = () => {
    const { ref, scale, isInView } = useFlutterProjectImageListAnimation()
    return (
        <div
            ref={ref}
            className="flex items-center justify-center px-2"
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
                    alt="flutter project image 1"
                    // className="md:h-auto md:w-[220px] lg:w-[245px]"
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
                    alt="flutter project image 1"
                    // className="md:h-auto md:w-[219px] lg:w-[245px]"
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
                    alt="flutter project image 1"
                    // className="md:h-auto md:w-[220px] lg:w-[245px]"
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
            className="max-w-[735px] px-6"
            animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : 20,
            }}
            transition={{
                type: 'spring',
                duration: 1.2,
            }}
        >
            <Typography variant={'h1'} className={'text-2xl'}>
                Flutter Project
            </Typography>
            <Typography variant={'paragraph'} className={'mt-4 font-semibold'}>
                This is a project I did using Flutter. It is a mobile
                application that helps users to track their daily expenses and
                income. Users can add transactions, view their history, and see
                a summary of their financial status. This is a project I did
                using Flutter. This is a project I did using Flutter. It is a
                mobile application that helps users to track their daily
                expenses and income. Users can add transactions, view their
                history, and see a summary of their financial status. This is a
                project I did using Flutter.
            </Typography>
        </motion.div>
    )
}

const FlutterProject = () => {
    return (
        <div className="custom-container sticky top-0 mx-auto h-[100vh]">
            <FlutterProjectTitle />
            <div className="flex h-full flex-col items-center justify-center py-20">
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
            <Typography variant={'h1'} className={'text-4xl'}>
                Flutter Project
            </Typography>
            <FlutterProject />
        </section>
    )
}
