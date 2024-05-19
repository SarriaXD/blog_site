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
    const scale = useTransform(enterProgress, [0, 1], [0.6, 1])
    const opacity = useTransform(leavingProgress, [0, 0.45], [1, 0])
    return { opacity, scale }
}

const Video = ({
    video,
    enterProgress,
    stayProgress,
    leavingProgress,
}: VideoProps) => {
    const videoRef: React.LegacyRef<HTMLVideoElement> = useRef(null)
    const { opacity, scale } = useVideoAnimation(enterProgress, leavingProgress)
    stayProgress.on('change', (value) => {
        if (videoRef.current) {
            const duration = videoRef.current.duration
            if (duration) {
                videoRef.current.currentTime = value * duration
            }
        }
    })

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load()
        }
    }, [videoRef])

    return (
        <div className="flex-1 h-full flex items-center justify-center">
            <motion.video
                ref={videoRef}
                preload="auto"
                className="max-h-full max-w-full object-contain rounded-3xl border-2 border-gray-600"
                style={{
                    opacity,
                    scale,
                }}
                muted={true}
                playsInline={true}
            >
                <source src={video} type="video/mp4" />
            </motion.video>
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
    const opacity = useTransform(leavingProgress, [0, 0.3], [1, 0])
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
    const isMobile = useMediaQuery({ query: '(max-width: 720px)' })
    const { opacity } = useIntroductionAnimation(leavingProgress)
    const [isVisible, setVisible] = useState(false)
    useMotionValueEvent(stayProgress, 'change', (value) => {
        if (value > 0.1 && !isVisible) {
            setVisible(true)
        }
        if (value <= 0.1 && isVisible) {
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
    const enterProgress = useTransform(progress, [0, 1 / 3], [0, 1])
    const stayProgress = useTransform(progress, [1 / 3, 1], [0, 1])
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
    index: number
    totalSize: number
    totalProgress: MotionValue<number>
    className: string
    video: string
    reverse: boolean
}

const ProjectItem = ({
    index,
    totalSize,
    totalProgress,
    className,
    video,
    reverse,
}: ProjectItemProps) => {
    const rate = 5
    const rateSize = rate * totalSize + 1
    const low = (index * rate) / rateSize
    const high = ((index + 1) * rate) / rateSize
    const ratio = 1 / rateSize
    const progress = useTransform(totalProgress, [low, high], [0, 1])
    const leavingProgress = useTransform(
        totalProgress,
        [high, high + ratio],
        [0, 1]
    )
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
            <div className={`h-[400vh]`} />
        </>
    )
}

const ProjectItemList = [
    {
        video: ipadPro,
        className: 'bg-night-shift',
        reverse: true,
    },
    {
        video: iphone,
        className: 'bg-night-club',
        reverse: false,
    },
    {
        video: macbookPro,
        className: 'bg-worker-day',
        reverse: true,
    },
]

export const ProjectListSection = () => {
    const target = useRef(null)
    const { scrollYProgress } = useScroll({
        target,
        offset: ['start end', 'end start'],
    })
    return (
        <>
            <motion.div ref={target}>
                {ProjectItemList.map((item, index) => {
                    return (
                        <ProjectItem
                            key={index}
                            index={index}
                            totalSize={ProjectItemList.length}
                            totalProgress={scrollYProgress}
                            className={item.className}
                            video={item.video}
                            reverse={item.reverse}
                        />
                    )
                })}
            </motion.div>
        </>
    )
}
