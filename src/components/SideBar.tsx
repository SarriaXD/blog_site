import React from 'react'
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemSuffix,
} from '@components/Material.tsx'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Close, Dog, Email, Github, Linkedin } from '@public/icons'

interface SideBarProps {
    open: boolean
    onClose: () => void
}

const internalLinks = [
    { href: '/articles', text: 'Articles', newTab: false },
    {
        href: 'https://github.com/SarriaXD?tab=repositories',
        text: 'Projects',
        newTab: true,
    },
    { href: '/tools', text: 'Tools', newTab: false },
]

interface InternalLinkProps {
    href: string
    text: string
    newTab: boolean
    onClose: () => void
}

const InternalLink = ({ href, text, newTab, onClose }: InternalLinkProps) => {
    const linkProps = {
        href,
        onClick: onClose,
        ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    }
    return (
        <Link {...linkProps}>
            <ListItem>
                <span className="text-base text-white">{text}</span>
            </ListItem>
        </Link>
    )
}

const externalLinks: {
    href: string
    icon: 'email' | 'linkedin' | 'github'
    newTab: boolean
    text: string
}[] = [
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

interface ExternalLinkProps {
    href: string
    icon: 'email' | 'linkedin' | 'github'
    text: string
    newTab: boolean
    index: number
    open: boolean
    onClose: () => void
}

const ExternalIcon = ({ icon }: { icon: 'email' | 'linkedin' | 'github' }) => {
    switch (icon) {
        case 'email':
            return <Email className="size-8 text-white" />
        case 'linkedin':
            return <Linkedin className="size-8 text-white" />
        case 'github':
            return <Github className="size-8 text-white" />
    }
}

const ExternalLink = ({
    href,
    icon,
    text,
    newTab,
    index,
    open,
    onClose,
}: ExternalLinkProps) => {
    const linkProps = {
        href,
        onClick: onClose,
        ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    }
    return (
        <Link {...linkProps}>
            <motion.div
                animate={{
                    x: open ? 0 : '-100%',
                }}
                transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 12,
                    delay: index * 0.2,
                }}
            >
                <ListItem>
                    <span className="text-base text-white">{text}</span>
                    <ListItemSuffix>
                        <ExternalIcon icon={icon} />
                    </ListItemSuffix>
                </ListItem>
            </motion.div>
        </Link>
    )
}

export function SideBar({ open, onClose }: SideBarProps) {
    return (
        <nav>
            <Drawer
                open={open}
                onClose={onClose}
                size={720}
                overlay={false}
                className="bg-gray-900 bg-opacity-80 backdrop-blur-md will-change-transform"
            >
                <div className="flex items-center justify-between p-4">
                    <Link href="/">
                        <IconButton
                            size="lg"
                            aria-label="Back To Home"
                            className="bg-transparent"
                            onClick={onClose}
                        >
                            <Dog className="size-8 text-white" />
                        </IconButton>
                    </Link>
                    <IconButton
                        aria-label="Close Side Bar"
                        variant="text"
                        onClick={onClose}
                    >
                        <Close className="size-6 text-white" />
                    </IconButton>
                </div>
                <List>
                    {internalLinks.map((link) => (
                        <InternalLink
                            key={link.text}
                            {...link}
                            onClose={onClose}
                        />
                    ))}
                    {externalLinks.map((link) => (
                        <ExternalLink
                            key={link.text}
                            {...link}
                            index={externalLinks.indexOf(link)}
                            open={open}
                            onClose={onClose}
                        />
                    ))}
                </List>
            </Drawer>
        </nav>
    )
}
