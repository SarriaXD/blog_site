'use client'
import { Typography } from '@material-tailwind/react'
import { myTechData } from '../data/MyTechData.ts'
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    wrap,
} from 'framer-motion'
import { useRef } from 'react'
import Image, { StaticImageData } from 'next/image'

// Duplicate the data to make looping easier
const cardData = [...myTechData, ...myTechData]

const itemVariants = {
    selected: {
        scale: 1.05,
        border: '1px solid var(--tw-ring-color)',
        boxShadow: '0 0 1rem var(--tw-ring-color)',
    },
}

interface TechCardProps {
    image: StaticImageData
    title: string
    subtitle: string
    link: string
    onSelected: (isSelected: boolean) => void
}

const TechCard = ({ image, title, link, onSelected }: TechCardProps) => {
    return (
        <motion.li
            variants={itemVariants}
            className="mx-2 flex-shrink-0
             rounded-2xl
             px-2 py-2 md:mx-4
             md:px-4 lg:mx-6 lg:px-6
             "
            whileHover="selected"
            whileTap="selected"
            onHoverStart={() => onSelected(true)}
            onHoverEnd={() => onSelected(false)}
            onTapStart={() => onSelected(true)}
            onTap={() => onSelected(false)}
        >
            <a href={link}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative size-32 md:size-44 xl:size-64">
                        <Image
                            src={image}
                            alt={`Logo of ${title}`}
                            fill={true}
                            className="object-contain"
                        />
                    </div>
                    <Typography variant="h3">{title}</Typography>
                </div>
            </a>
        </motion.li>
    )
}

export const TechStackSection = () => {
    const baseX = useMotionValue(0)
    const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)
    const isSelecting = useRef(false)
    useAnimationFrame(() => {
        if (isSelecting.current) return
        baseX.set(baseX.get() + -0.013)
    })
    return (
        <>
            <motion.section
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: [0, 1],
                    y: [100, 0],
                    transition: {
                        type: 'tween',
                        duration: 0.6,
                        delay: 1,
                    },
                }}
                className="mx-auto w-11/12 py-8 md:py-12 xl:py-16"
            >
                <div className="overflow-hidden py-8 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-50px),transparent_100%)] md:py-12 xl:py-16 xl:[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-150px),transparent_100%)]">
                    <motion.ul
                        className="flex w-[max-content] flex-nowrap whitespace-nowrap"
                        style={{
                            x,
                        }}
                    >
                        {cardData.map((tech, index) => (
                            <TechCard
                                key={index}
                                {...tech}
                                onSelected={(isSelected) => {
                                    isSelecting.current = isSelected
                                }}
                            />
                        ))}
                    </motion.ul>
                </div>
            </motion.section>
        </>
    )
}
