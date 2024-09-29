import { MotionValue } from 'framer-motion'
import { useState } from 'react'
import { motion } from 'framer-motion'

const useIntroduction = (progress: MotionValue<number>) => {
    const introductions = [
        {
            title: 'Multimodal Support',
            description: 'Analyse your Text, and images, PDFs, and more.',
        },
        {
            title: 'Search Engine',
            description: 'Online search engine capabilities for latest news.',
        },
        {
            title: 'Weather Forecast',
            description: 'Get the latest weather condition and forecast. ',
        },
    ]
    const [index, setIndex] = useState(0)
    progress.on('change', (latest) => {
        if (latest < 0.33) {
            setIndex(0)
        } else if (latest < 0.66) {
            setIndex(1)
        } else if (latest < 1) {
            setIndex(2)
        }
    })
    return introductions[index]
}

interface ChatIntroductionProps {
    progress: MotionValue<number>
    inView: boolean
}

const ChatIntroduction = ({ progress, inView }: ChatIntroductionProps) => {
    const introduction = useIntroduction(progress)
    return (
        <motion.div
            animate={{
                opacity: inView ? 1 : 0,
            }}
            transition={{
                type: 'tween',
                delay: 0.5,
                duration: 0.5,
            }}
            className="max-w-[300px] capitalize"
        >
            <h3 className="text-3xl text-gray-400 md:text-2xl">
                {introduction.title}
            </h3>
            <h4 className="mt-2 hidden text-xl text-gray-600 md:block">
                {introduction.description}
            </h4>
        </motion.div>
    )
}

export default ChatIntroduction
