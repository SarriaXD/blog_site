import {
    motion,
    MotionValue,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { ipadPro, iphone, macbookPro } from '../../assets/video'
import { Typography } from '@material-tailwind/react'

const useStayProgress = (stayProgress: MotionValue<number>) => {
    const [progressState, setProgress] = useState(0)
    useMotionValueEvent(stayProgress, 'change', () => {
        setProgress(stayProgress.get())
    })
    return progressState
}

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
    const y = useTransform(enterProgress, [0, 1], ['-50%', '0%'])
    const opacity = useTransform(leavingProgress, [0, 0.45], [1, 0])
    const scale = useTransform(enterProgress, [0, 1], [1.12, 1])
    return { y, opacity, scale }
}

const Video = ({
    video,
    enterProgress,
    stayProgress,
    leavingProgress,
}: VideoProps) => {
    const videoRef: React.LegacyRef<HTMLVideoElement> = useRef(null)
    const progress = useStayProgress(stayProgress)
    const { y, opacity, scale } = useVideoAnimation(
        enterProgress,
        leavingProgress
    )
    useEffect(() => {
        if (videoRef.current) {
            const duration = videoRef.current.duration
            if (duration) {
                videoRef.current.currentTime = progress * duration
            }
        }
    }, [progress])

    return (
        <div className="flex-1 h-full flex items-center justify-center">
            <motion.video
                ref={videoRef}
                src={video}
                preload="auto"
                className="max-h-full max-w-full object-contain rounded-3xl border-2"
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
    reverse: boolean
}

const list = [
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Framer Motion',
    'Material Tailwind',
]

const textByProgress = (progress: number) => {
    const index = Math.floor(progress * list.length)
    return list[index]
}

const IntroductionVariants = {
    hidden: {
        opacity: 0,
        width: '0%',
        transition: {
            width: { duration: 0.3, delay: 0.3 },
            opacity: { duration: 0.1 },
        },
    },
    visible: {
        opacity: 1,
        width: '33%',
        transition: {
            width: { duration: 0.5, ease: 'easeInOut' },
            opacity: { duration: 0.5, delay: 0.5 },
        },
    },
}

const useIntroductionAnimation = (leavingProgress: MotionValue<number>) => {
    const opacity = useTransform(leavingProgress, [0, 0.2], [1, 0])
    return { opacity }
}

const Introduction = ({
    stayProgress,
    leavingProgress,
    reverse,
}: IntroductionProps) => {
    const { opacity } = useIntroductionAnimation(leavingProgress)
    const reversedAlign = reverse ? 'justify-start' : 'justify-end'
    const progress = useStayProgress(stayProgress)
    const [isVisible, setVisible] = useState(false)
    useMotionValueEvent(stayProgress, 'change', (value) => {
        if (value > 0 && !isVisible) {
            setVisible(true)
        }
        if (value === 0 && isVisible) {
            setVisible(false)
        }
    })

    return (
        <motion.div
            className={`md:w-[33%] flex flex-col ${reversedAlign} items-center md:justify-center`}
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
                <Typography variant="h2">Project Title</Typography>
                <Typography>{`${textByProgress(progress)}`}</Typography>
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
    const enterProgress = useTransform(progress, [0, 1 / 3], [0, 1])
    const stayProgress = useTransform(progress, [1 / 3, 1], [0, 1])
    return (
        <>
            <div className="w-full h-full flex flex-col md:flex-row items-center p-4 md:p-8 xl:p-16">
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
                        reverse={reverse}
                    />
                )}
                {reverse ? (
                    <Introduction
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                        reverse={reverse}
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
            <div className="h-[300vh]" />
        </>
    )
}

export const ProjectListSection = () => {
    const target = useRef(null)
    const { scrollYProgress } = useScroll({
        target,
        offset: ['start end', 'end end'],
    })
    const scrollRatio = 1 / 3
    const size = 3
    const ratio = 1 / size
    const basicStep = scrollRatio / size
    const firstProgress = useTransform(scrollYProgress, [0, ratio], [0, 1])
    const firstLeavingProgress = useTransform(
        scrollYProgress,
        [ratio, ratio + basicStep],
        [0, 1]
    )
    const secondProgress = useTransform(
        scrollYProgress,
        [ratio, ratio * 2],
        [0, 1]
    )
    const secondLeavingProgress = useTransform(
        scrollYProgress,
        [ratio * 2, ratio * 2 + basicStep],
        [0, 1]
    )
    const thirdProgress = useTransform(scrollYProgress, [ratio * 2, 1], [0, 1])
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
                    reverse={false}
                />
                <ProjectItem
                    progress={secondProgress}
                    leavingProgress={secondLeavingProgress}
                    className="bg-night-club"
                    video={iphone}
                    reverse={true}
                />
                <ProjectItem
                    progress={thirdProgress}
                    leavingProgress={leavingScrollYProgress}
                    className="bg-worker-day"
                    video={macbookPro}
                    reverse={false}
                />
            </motion.div>
        </>
    )
}
