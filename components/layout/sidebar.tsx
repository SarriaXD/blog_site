import { useEffect } from 'react'
import { Glass, IconButton } from '@components/ui/ui-kit.tsx'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Close, Dog, Email, Github, Linkedin } from '@public/icons'
import { useMediaQuery } from '@hooks/hooks.ts'

const slideEase: [number, number, number, number] = [0.76, 0, 0.24, 1]

const itemVariants = {
    initial: { x: '-100%', opacity: 0 },
    enter: (i: number) => ({
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: slideEase,
            delay: 0.05 * i,
        },
    }),
    exit: (i: number) => ({
        x: '-100%',
        opacity: 0,
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

const backdropVariants = {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.6, delay: 0.2 } },
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
            return <Email className="size-7 text-white" />
        case 'linkedin':
            return <Linkedin className="size-7 text-white" />
        case 'github':
            return <Github className="size-7 text-white" />
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
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-white/10 active:bg-white/15"
            >
                <span className="text-lg font-semibold text-white">{text}</span>
                {icon && (
                    <span className="ml-auto opacity-80">
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
                        key="backdrop"
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-[#04050a]/55 backdrop-blur-[6px]"
                    />
                )}
                {open && (
                    <motion.div
                        key="slide"
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={sideBarVariants}
                        className="fixed inset-y-0 left-0 z-[51] w-[min(86vw,22rem)] p-3 will-change-transform"
                    >
                        <Glass
                            tint="neutral"
                            band={22}
                            className="h-full rounded-[32px] [--lg-blur:30px]"
                            contentClassName="flex flex-col"
                        >
                            <div className="flex items-center justify-between p-3">
                                <Link href="/">
                                    <IconButton
                                        size="lg"
                                        tone="neutral"
                                        variant="ghost"
                                        refraction={false}
                                        aria-label="Back To Home"
                                        className="shadow-none [--lg-tint:transparent]"
                                        onClick={onClose}
                                    >
                                        <Dog className="size-8 text-white" />
                                    </IconButton>
                                </Link>
                                <IconButton
                                    aria-label="Close Side Bar"
                                    variant="ghost"
                                    tone="neutral"
                                    refraction={false}
                                    onClick={onClose}
                                >
                                    <Close className="size-6 text-white" />
                                </IconButton>
                            </div>
                            <ul className="flex flex-col gap-1 px-2 pb-4">
                                {links.map((link, index) => (
                                    <LinkItem
                                        key={link.text}
                                        {...link}
                                        index={index}
                                        onClose={onClose}
                                    />
                                ))}
                            </ul>
                            <p className="mt-auto px-6 pb-5 text-xs text-white/45">
                                © {new Date().getFullYear()} Qi Wang · Winnipeg,
                                MB
                            </p>
                        </Glass>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
