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
}

const ChatIntroduction = ({ progress }: ChatIntroductionProps) => {
    const introduction = useIntroduction(progress)
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 150,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                type: 'tween',
                duration: 0.5,
            }}
            className="w-[200px] capitalize md:w-[250px] xl:w-[300px]"
        >
            <h4 className="hidden text-2xl text-gray-400 md:block">
                {introduction.title}
            </h4>
            <h3 className="text-xl text-gray-600 md:mt-2">
                {introduction.description}
            </h3>
        </motion.div>
    )
}

export default ChatIntroduction
