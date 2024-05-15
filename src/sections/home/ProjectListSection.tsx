import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import { useRef, useState } from 'react'

// interface ProjectItemProps {
// firstHalfProgress: MotionValue<number>
// secondHalfProgress: MotionValue<number>
// }

const ProjectItem = () => {
    const target = useRef(null)
    const { scrollYProgress: firstHalfProgress } = useScroll({
        target,
        offset: ['start end', '33.3333333% end'],
    })
    const { scrollYProgress: secondHalfProgress } = useScroll({
        target,
        offset: ['33.3333333% end', 'end end'],
    })

    const scale = useTransform(firstHalfProgress, [0, 1], [0.6, 1])
    const [progress, setProgress] = useState(0)
    useMotionValueEvent(secondHalfProgress, 'change', (latest) =>
        setProgress(latest)
    )
    return (
        <>
            <div ref={target} className="relative h-[300vh]">
                <motion.div
                    className="sticky top-0 h-[100vh] w-full bg-red-900 flex justify-center items-center"
                    style={{
                        opacity: firstHalfProgress,
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
