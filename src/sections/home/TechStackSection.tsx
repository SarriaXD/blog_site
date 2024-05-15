import { Typography } from '@material-tailwind/react'
import { myTechData } from '../../data/MyTechData'
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
    wrap,
} from 'framer-motion'
import { useRef } from 'react'

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
    img: string
    title: string
    subtitle: string
    link: string
    onSelected: (isSelected: boolean) => void
}

const TechCard = ({ img, title, link, onSelected }: TechCardProps) => {
    return (
        <motion.li
            variants={itemVariants}
            className="flex-shrink-0 rounded-2xl
             py-2
             mx-2 md:mx-4 lg:mx-6
             px-2 md:px-4 lg:px-6
             "
            whileHover="selected"
            whileTap="selected"
            onHoverStart={() => onSelected(true)}
            onHoverEnd={() => onSelected(false)}
            onTapStart={() => onSelected(true)}
            onTap={() => onSelected(false)}
        >
            <a href={link}>
                <div className="flex items-center flex-col gap-4 xl:flex-row">
                    <img
                        src={img}
                        alt="card image"
                        className="size-32 md:size-48 xl:size-72 object-contain"
                    />
                    <Typography variant="h3">{title}</Typography>
                </div>
            </a>
        </motion.li>
    )
}

const useScrollToHide = () => {
    const target = useRef(null)
    const { scrollYProgress } = useScroll({
        target: target,
        offset: ['start 80px', 'end start'],
    })
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.6])
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    return { target, scale, opacity }
}

const useVelocityFactor = () => {
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    })
    return useTransform(smoothVelocity, [0, 1000], [0, 30], {
        clamp: false,
    })
}

const baseVelocity = 1
const selectedVelocity = 0.3

export const TechStackSection = () => {
    const baseX = useMotionValue(0)
    const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)
    const isSelecting = useRef(false)
    const { target, scale, opacity } = useScrollToHide()
    const velocityFactor = useVelocityFactor()
    useAnimationFrame((_, delta) => {
        let moveBy = -baseVelocity * (delta / 1000)
        if (velocityFactor.get() > 0) {
            moveBy += velocityFactor.get() * moveBy
        } else if (isSelecting.current) {
            moveBy = -selectedVelocity * (delta / 1000)
        }
        if (scale.get() < 0.85) {
            moveBy = 0
        }
        baseX.set(baseX.get() + moveBy)
    })
    return (
        <>
            <motion.section
                ref={target}
                animate={{
                    opacity: [0, 1],
                    y: [100, 0],
                    transition: {
                        type: 'tween',
                        duration: 0.6,
                        delay: 1,
                    },
                }}
                style={{
                    scale,
                    opacity,
                }}
                className="w-11/12 mx-auto py-8 md:py-12 xl:py-16"
            >
                <div className="w-full flex justify-end">
                    <Typography
                        as="a"
                        href="#"
                        variant="h6"
                        color="gray"
                        className="uppercase text-xs md:text-lg xl:text-xl flex items-center gap-2 hover:gap-4 hover:text-gray-300 hover:pr-4 transition-all"
                    >
                        Find Me
                        <i className="fa-solid fa-angle-right" />
                    </Typography>
                </div>
                <div className="py-8 md:py-12 xl:py-16 overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-50px),transparent_100%)] xl:[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-150px),transparent_100%)]">
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
