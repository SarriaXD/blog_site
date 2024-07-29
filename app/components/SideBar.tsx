import React from 'react'
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemSuffix,
    Typography,
} from './Material.tsx'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Close, Dog, Email, Github, Linkedin } from '../../assets/icons'

interface SideBarProps {
    open: boolean
    onClose: () => void
}

const internalLinks = [
    { href: '/articles', text: 'Articles' },
    { href: 'https://github.com/SarriaXD?tab=repositories', text: 'Projects' },
]

interface InternalLinkProps {
    href: string
    text: string
    onClose: () => void
}

const InternalLink = ({ href, text, onClose }: InternalLinkProps) => {
    return (
        <Link href={href} onClick={onClose}>
            <ListItem>
                <Typography variant="h6" color="white">
                    {text}
                </Typography>
            </ListItem>
        </Link>
    )
}

const externalLinks: {
    href: string
    icon: 'email' | 'linkedin' | 'github'
    text: string
}[] = [
    {
        href: 'mailto:sarria.qi.wang@gmail.com',
        icon: 'email',
        text: 'Email me',
    },
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        icon: 'linkedin',
        text: 'LinkedIn',
    },
    {
        href: 'https://github.com/SarriaXD',
        icon: 'github',
        text: 'GitHub',
    },
]

interface ExternalLinkProps {
    href: string
    icon: 'email' | 'linkedin' | 'github'
    text: string
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
    index,
    open,
    onClose,
}: ExternalLinkProps) => {
    return (
        <Link href={href} onClick={onClose}>
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
                    <Typography variant="h6" color="white">
                        {text}
                    </Typography>
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
                className="bg-gray-900 bg-opacity-80 backdrop-blur-md"
            >
                <div className="flex items-center justify-between p-4">
                    <Link
                        href="/"
                        className="rounded-lg p-2 hover:bg-gray-900"
                        onClick={onClose}
                    >
                        <Dog
                            className="size-8 text-white"
                            aria-label="Back To Home"
                        />
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
