import { MotionValue } from 'framer-motion'
import { useState } from 'react'

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
        <div className="max-w-[300px] capitalize">
            <h4 className="text-2xl text-gray-400">{introduction.title}</h4>
            <h3 className="mt-2 hidden text-xl text-gray-600 md:block">
                {introduction.description}
            </h3>
        </div>
    )
}

export default ChatIntroduction
