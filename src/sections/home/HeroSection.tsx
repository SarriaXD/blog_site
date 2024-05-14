import { Typography } from '@material-tailwind/react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

const MotionTypography = motion(Typography)

export const HeroSection = () => {
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
        <>
            <section
                ref={ref}
                className="container mx-auto p-2 text-center md:p-4 xl:p-8 flex flex-col gap-4 md:gap-8 xl:gap-12"
            >
                <MotionTypography
                    animate={{
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        y: [-50, 0],
                        transition: {
                            type: 'tween',
                            duration: 0.6,
                            delay: 0.2,
                        },
                    }}
                    style={{ y: smoothTitleY }}
                    variant="h1"
                    className="text-4xl md:text-6xl xl:text-8xl"
                >
                    <span className="text-transparent bg-clip-text bg-hero-text-gradient">
                        I'm Qi
                    </span>
                    , a software engineer based in Canada.
                </MotionTypography>
                <MotionTypography
                    animate={{
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        y: [-50, 0],
                        transition: {
                            type: 'tween',
                            duration: 0.6,
                        },
                    }}
                    style={{ y: smoothSubtitleY }}
                    variant="h2"
                    color="gray"
                    textGradient={true}
                    className="text-2xl md:text-3xl xl:text-5xl"
                >
                    I specialize in full-stack development.
                </MotionTypography>
            </section>
        </>
    )
}
