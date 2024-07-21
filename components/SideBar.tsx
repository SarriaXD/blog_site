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
        className: 'fa-solid fa-envelope',
        text: 'Email me',
    },
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        className: 'fa-brands fa-linkedin',
        text: 'LinkedIn',
    },
    {
        href: 'https://github.com/SarriaXD',
        className: 'fa-brands fa-github',
        text: 'GitHub',
    },
]

interface ExternalLinkProps {
    href: string
    className: string
    text: string
    index: number
    open: boolean
}

const ExternalLink = ({
    href,
    className,
    text,
    index,
    open,
}: ExternalLinkProps) => {
    const animation = open
        ? {
              x: 0,
              opacity: 1,
          }
        : {
              x: '-100%',
              opacity: 0,
          }
    return (
        <motion.div
            animate={animation}
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
                        <i className={`${className} text-2xl text-white`} />
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
                        <i className="fa-solid fa-dog text-2xl text-gray-200" />
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
