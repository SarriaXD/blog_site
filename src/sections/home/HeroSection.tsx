import { Typography } from '@material-tailwind/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const MotionTypography = motion(Typography)

export const HeroSection = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 80px', 'end start'],
    })
    const titleY = useTransform(scrollYProgress, [0, 1], [0, -300])
    const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -200])
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
                        transition: { duration: 1.5 },
                    }}
                    style={{ y: titleY }}
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
                        transition: { duration: 1.5, delay: 0.5 },
                    }}
                    style={{ y: subtitleY }}
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
