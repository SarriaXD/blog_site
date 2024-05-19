import {
    motion,
    MotionValue,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import React, { useRef, useState } from 'react'
import { ipadPro, iphone, macbookPro } from '../../assets/video'
import { Typography } from '@material-tailwind/react'
import { useMediaQuery } from 'react-responsive'

interface VideoProps {
    video: string
    enterProgress: MotionValue<number>
    stayProgress: MotionValue<number>
    leavingProgress: MotionValue<number>
}

const useVideoAnimation = (
    enterProgress: MotionValue<number>,
    leavingProgress: MotionValue<number>
) => {
    const y = useTransform(enterProgress, [0, 1], ['-50vh', '0vh'])
    const opacity = useTransform(leavingProgress, [0, 0.45], [1, 0])
    const scale = useTransform(enterProgress, [0, 1], [0.8, 1])
    return { y, opacity, scale }
}

const Video = ({
    video,
    enterProgress,
    stayProgress,
    leavingProgress,
}: VideoProps) => {
    const videoRef: React.LegacyRef<HTMLVideoElement> = useRef(null)
    const { y, opacity, scale } = useVideoAnimation(
        enterProgress,
        leavingProgress
    )
    stayProgress.on('change', (value) => {
        if (videoRef.current) {
            const duration = videoRef.current.duration
            if (duration) {
                videoRef.current.currentTime = value * duration
            }
        }
    })

    return (
        <div className="flex-1 h-full flex items-center justify-center">
            <motion.video
                ref={videoRef}
                src={video}
                preload="auto"
                className="max-h-full max-w-full object-contain rounded-3xl border-2 border-gray-600"
                style={{
                    y,
                    opacity,
                    scale,
                }}
            />
        </div>
    )
}

interface IntroductionProps {
    stayProgress: MotionValue<number>
    leavingProgress: MotionValue<number>
}

const list = [
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Framer Motion',
    'Material Tailwind',
]

const IntroductionVariants = {
    hidden: (isMobile: boolean) => ({
        opacity: 0,
        width: isMobile ? '100%' : '0%',
        height: isMobile ? '0%' : '100%',
        transition: {
            height: { duration: 0.3, delay: 0.3 },
            width: { duration: 0.3, delay: 0.3 },
            opacity: { duration: 0.1 },
        },
    }),
    visible: (isMobile: boolean) => ({
        opacity: 1,
        width: isMobile ? '100%' : '33%',
        height: isMobile ? '50%' : '100%',
        transition: {
            height: { duration: 0.6, ease: 'easeInOut' },
            width: { duration: 0.6, ease: 'easeInOut' },
            opacity: { duration: 0.6, delay: 0.6 },
        },
    }),
}

const useIntroductionAnimation = (leavingProgress: MotionValue<number>) => {
    const opacity = useTransform(leavingProgress, [0, 0.2], [1, 0])
    return { opacity }
}

interface IntroductionTextProps {
    text: string
    progress: MotionValue<number>
    index: number
    totalSize: number
}
const IntroductionText = ({
    text,
    progress,
    index,
    totalSize,
}: IntroductionTextProps) => {
    const low = index / totalSize
    const high = (index + 1) / totalSize
    const opacity = useTransform(progress, [low, high], [0, 1])
    return (
        <motion.div
            style={{
                opacity,
            }}
        >
            <Typography variant="h4" color="orange" textGradient={true}>
                {text}
            </Typography>
        </motion.div>
    )
}

const Introduction = ({ stayProgress, leavingProgress }: IntroductionProps) => {
    const { opacity } = useIntroductionAnimation(leavingProgress)
    const [isVisible, setVisible] = useState(false)
    const isMobile = useMediaQuery({ query: '(max-width: 720px)' })
    useMotionValueEvent(stayProgress, 'change', (value) => {
        if (value > 0.15 && !isVisible) {
            setVisible(true)
        }
        if (value <= 0.15 && isVisible) {
            setVisible(false)
        }
    })

    return (
        <motion.div
            className={`flex flex-col items-center justify-center`}
            custom={isMobile}
            variants={IntroductionVariants}
            animate={isVisible ? 'visible' : 'hidden'}
            transition={{
                width: { duration: 1, ease: 'easeInOut', delay: 1 },
                opacity: { duration: 1 },
            }}
        >
            <motion.div
                style={{
                    opacity,
                }}
            >
                {list.map((item, index) => {
                    return (
                        <IntroductionText
                            key={index}
                            text={item}
                            progress={stayProgress}
                            index={index}
                            totalSize={list.length}
                        />
                    )
                })}
            </motion.div>
        </motion.div>
    )
}

interface ProjectProps {
    leavingProgress: MotionValue<number>
    progress: MotionValue<number>
    video: string
    reverse: boolean
}

const Project = ({
    progress,
    video,
    leavingProgress,
    reverse,
}: ProjectProps) => {
    const enterProgress = useTransform(progress, [0, 1 / 5], [0, 1])
    const stayProgress = useTransform(progress, [1 / 5, 1], [0, 1])
    return (
        <>
            <div className="w-full h-full flex flex-col md:flex-row justify-center  items-center p-4 md:p-8 xl:p-16">
                {reverse ? (
                    <Video
                        video={video}
                        enterProgress={enterProgress}
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                ) : (
                    <Introduction
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                )}
                {reverse ? (
                    <Introduction
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                ) : (
                    <Video
                        video={video}
                        enterProgress={enterProgress}
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                )}
            </div>
        </>
    )
}

interface ProjectItemProps {
    progress: MotionValue<number>
    leavingProgress: MotionValue<number>
    className: string
    video: string
    reverse: boolean
}

const ProjectItem = ({
    progress,
    leavingProgress,
    className,
    video,
    reverse,
}: ProjectItemProps) => {
    return (
        <>
            <div className={`${className} sticky top-0 h-[100vh] w-full pt-20`}>
                <Project
                    video={video}
                    progress={progress}
                    leavingProgress={leavingProgress}
                    reverse={reverse}
                />
            </div>
            <div className="h-[400vh]" />
        </>
    )
}

export const ProjectListSection = () => {
    const target = useRef(null)
    const { scrollYProgress } = useScroll({
        target,
        offset: ['start end', 'end end'],
    })
    // entering and staying progress
    const scrollRatio = 1 / 5
    const size = 3
    const ratio = 1 / size
    const basicStep = scrollRatio / size
    const firstProgress = useTransform(scrollYProgress, [0, ratio], [0, 1])
    const secondProgress = useTransform(
        scrollYProgress,
        [ratio, ratio * 2],
        [0, 1]
    )
    const thirdProgress = useTransform(scrollYProgress, [ratio * 2, 1], [0, 1])

    // Leaving progress
    const firstLeavingProgress = useTransform(
        scrollYProgress,
        [ratio, ratio + basicStep],
        [0, 1]
    )
    const secondLeavingProgress = useTransform(
        scrollYProgress,
        [ratio * 2, ratio * 2 + basicStep],
        [0, 1]
    )
    const { scrollYProgress: leavingScrollYProgress } = useScroll({
        target,
        offset: ['end end', 'end start'],
    })
    return (
        <>
            <motion.div ref={target}>
                <ProjectItem
                    progress={firstProgress}
                    leavingProgress={firstLeavingProgress}
                    className="bg-night-shift"
                    video={ipadPro}
                    reverse={true}
                />
                <ProjectItem
                    progress={secondProgress}
                    leavingProgress={secondLeavingProgress}
                    className="bg-night-club"
                    video={iphone}
                    reverse={false}
                />
                <ProjectItem
                    progress={thirdProgress}
                    leavingProgress={leavingScrollYProgress}
                    className="bg-worker-day"
                    video={macbookPro}
                    reverse={true}
                />
            </motion.div>
        </>
    )
}
