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
                className="flex flex-col items-center gap-4
             p-8 text-center
             md:py-8 md:gap-8
             xl:py-20 xl:gap-12"
            >
                <MotionTypography
                    animate={{
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        transition: { duration: 1.5 },
                    }}
                    style={{ y: titleY }}
                    variant="h1"
                    className="text-4xl
                    md:text-6xl md:max-w-screen-sm
                    xl:text-8xl xl:max-w-screen-lg"
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
                    className="text-2xl max-w-[60%]
                    md:text-3xl
                    xl:text-4xl"
                >
                    I specialize in full-stack development.
                </MotionTypography>
            </section>
        </>
    )
}
