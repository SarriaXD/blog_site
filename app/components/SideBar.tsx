import React from 'react'
import { Drawer, IconButton } from './Material.tsx'
import {
    List,
    ListItem,
    ListItemSuffix,
    Typography,
} from '@material-tailwind/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { faDog, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

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
}

const InternalLink = ({ href, text }: InternalLinkProps) => {
    return (
        <Link href={href}>
            <ListItem>
                <Typography variant="h6" color="white">
                    {text}
                </Typography>
            </ListItem>
        </Link>
    )
}

const externalLinks = [
    {
        href: 'mailto:sarria.qi.wang@gmail.com',
        icon: faEnvelope,
        text: 'Email me',
    },
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        icon: faLinkedin,
        text: 'LinkedIn',
    },
    {
        href: 'https://github.com/SarriaXD',
        icon: faGithub,
        text: 'GitHub',
    },
]

interface ExternalLinkProps {
    href: string
    icon: IconDefinition
    text: string
    index: number
    open: boolean
}

const ExternalLink = ({ href, icon, text, index, open }: ExternalLinkProps) => {
    return (
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
            <Link href={href}>
                <ListItem>
                    <Typography variant="h6" color="white">
                        {text}
                    </Typography>
                    <ListItemSuffix>
                        <FontAwesomeIcon icon={icon} />
                    </ListItemSuffix>
                </ListItem>
            </Link>
        </motion.div>
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
                    <Link href="/">
                        <FontAwesomeIcon icon={faDog} size="xl" />
                    </Link>
                    <IconButton variant="text" color="white" onClick={onClose}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </IconButton>
                </div>
                <List>
                    {internalLinks.map((link) => (
                        <InternalLink key={link.text} {...link} />
                    ))}
                    {externalLinks.map((link) => (
                        <ExternalLink
                            key={link.text}
                            {...link}
                            index={externalLinks.indexOf(link)}
                            open={open}
                        />
                    ))}
                </List>
            </Drawer>
        </nav>
    )
}
