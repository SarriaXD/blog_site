import { useEffect } from 'react'
import { IconButton } from '@components/ui/ui-kit.tsx'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Close, Dog, Email, Github, Linkedin } from '@public/icons'
import { useMediaQuery } from '@hooks/hooks.ts'

const slideEase: [number, number, number, number] = [0.76, 0, 0.24, 1]

const itemVariants = {
    initial: { x: '-100%' },
    enter: (i: number) => ({
        x: 0,
        transition: {
            duration: 0.8,
            ease: slideEase,
            delay: 0.05 * i,
        },
    }),
    exit: (i: number) => ({
        x: '-100%',
        transition: {
            duration: 0.8,
            ease: slideEase,
            delay: 0.05 * i,
        },
    }),
}

const sideBarVariants = {
    initial: { x: '-100%' },
    enter: { x: 0, transition: { duration: 0.8, ease: slideEase } },
    exit: {
        x: '-100%',
        transition: { duration: 0.8, ease: slideEase },
    },
}

const links: {
    href: string
    icon?: 'email' | 'linkedin' | 'github' | undefined
    newTab: boolean
    text: string
}[] = [
    { href: '/articles', text: 'Articles', newTab: false },
    { href: '/design-system', text: 'Design', newTab: false },
    {
        href: 'https://github.com/SarriaXD?tab=repositories',
        text: 'Projects',
        newTab: true,
    },
    { href: '/tools', text: 'Tools', newTab: false },
    {
        href: 'mailto:sarria.qi.wang@gmail.com',
        icon: 'email',
        newTab: false,
        text: 'Email me',
    },
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        icon: 'linkedin',
        newTab: true,
        text: 'LinkedIn',
    },
    {
        href: 'https://github.com/SarriaXD',
        icon: 'github',
        newTab: true,
        text: 'GitHub',
    },
]
const LinkIcon = ({ icon }: { icon: 'email' | 'linkedin' | 'github' }) => {
    switch (icon) {
        case 'email':
            return <Email className="size-8 text-white" />
        case 'linkedin':
            return <Linkedin className="size-8 text-white" />
        case 'github':
            return <Github className="size-8 text-white" />
    }
}

interface LinkItemProps {
    text: string
    href: string
    icon?: 'email' | 'linkedin' | 'github' | undefined
    newTab: boolean
    index: number
    onClose: () => void
}

const LinkItem = ({
    text,
    href,
    icon,
    newTab,
    index,
    onClose,
}: LinkItemProps) => {
    const linkProps = {
        href,
        onClick: onClose,
        ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    }
    return (
        <motion.li
            className="list-none"
            variants={itemVariants}
            custom={index}
            initial="initial"
            animate="enter"
            exit="exit"
        >
            <Link
                {...linkProps}
                className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-white/10"
            >
                <span className="text-base text-white">{text}</span>
                {icon && (
                    <span className="ml-auto">
                        <LinkIcon icon={icon} />
                    </span>
                )}
            </Link>
        </motion.li>
    )
}

interface SideBarProps {
    open: boolean
    onClose: () => void
}

export function Sidebar({ open, onClose }: SideBarProps) {
    const isMobile = useMediaQuery('(max-width: 735px)')
    useEffect(() => {
        if (!isMobile) onClose()
    }, [onClose, isMobile])
    return (
        <nav>
            <AnimatePresence mode="wait">
                {open && (
                    <motion.div
                        key="slide"
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={sideBarVariants}
                        onClick={onClose}
                        className="fixed left-0 top-0 z-50 h-screen w-full bg-[#05070b]/72 backdrop-blur-[20px] will-change-transform"
                    >
                        <div className="flex items-center justify-between p-4">
                            <Link href="/">
                                <IconButton
                                    size="lg"
                                    tone="neutral"
                                    aria-label="Back To Home"
                                    className="bg-transparent"
                                    onClick={onClose}
                                >
                                    <Dog className="size-8 text-white" />
                                </IconButton>
                            </Link>
                            <IconButton
                                aria-label="Close Side Bar"
                                variant="ghost"
                                tone="neutral"
                                onClick={onClose}
                            >
                                <Close className="size-6 text-white" />
                            </IconButton>
                        </div>
                        <ul className="flex flex-col gap-1 px-2">
                            {links.map((link, index) => (
                                <LinkItem
                                    key={link.text}
                                    {...link}
                                    index={index}
                                    onClose={onClose}
                                />
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
