import {
    motion,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'
import { useRef, useState } from 'react'

// interface ProjectItemProps {
// firstHalfProgress: MotionValue<number>
// secondHalfProgress: MotionValue<number>
// }

const useMotionAnimation = () => {
    const target = useRef(null)
    const { scrollYProgress } = useScroll({
        target,
        offset: ['start end', 'end end'],
    })
    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 400,
        damping: 50,
    })
    const scale = useTransform(smoothScrollYProgress, [0, 1 / 3], [0.6, 1])
    const opacity = useTransform(smoothScrollYProgress, [0, 1 / 3], [0, 1])
    const stepProgress = useTransform(scrollYProgress, [1 / 3, 1], [0, 1])
    return { target, scale, opacity, stepProgress }
}

const ProjectItem = () => {
    const { target, scale, opacity, stepProgress } = useMotionAnimation()
    const [progress, setProgress] = useState(0)
    useMotionValueEvent(stepProgress, 'change', (latest) => setProgress(latest))
    return (
        <>
            <div ref={target} className="relative h-[300vh]">
                <motion.div
                    className="sticky top-0 h-[100vh] w-full flex justify-center items-center"
                    style={{
                        opacity: opacity,
                        scale: scale,
                    }}
                >
                    {progress}
                </motion.div>
            </div>
        </>
    )
}

export const ProjectListSection = () => {
    return (
        <>
            <div>
                <ProjectItem />
                <ProjectItem />
                <ProjectItem />
            </div>
        </>
    )
}
