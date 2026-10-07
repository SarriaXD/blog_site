'use client'

import {
    Container,
    Glass,
    HEADER_CLASS,
    IconButton,
    Tooltip,
    cn,
} from '@components/ui/ui-kit.tsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from './sidebar.tsx'
import { useState } from 'react'
import { BurgerMenu, Dog, Email, Github, Linkedin } from '@public/icons'

const internalLinks = [
    { href: '/articles', text: 'Articles', newTab: false },
    { href: '/design-system', text: 'Design', newTab: false },
    {
        href: 'https://github.com/SarriaXD?tab=repositories',
        text: 'Projects',
        newTab: true,
    },
    { href: '/tools', text: 'Tools', newTab: false },
]

const NavLink = ({
    href,
    text,
    newTab,
    active,
}: {
    href: string
    text: string
    newTab: boolean
    active: boolean
}) => {
    const linkProps = {
        href,
        ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    }
    return (
        <li className="relative">
            <Link
                {...linkProps}
                className={cn(
                    'relative z-10 inline-flex min-h-10 items-center rounded-full px-4 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-300',
                    active
                        ? 'text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]'
                        : 'text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] hover:text-white'
                )}
            >
                {active && (
                    <motion.span
                        layoutId="nav-active-pill"
                        transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 34,
                        }}
                        className="absolute inset-0 -z-10 rounded-full bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(255,255,255,0.08),0_6px_18px_-8px_rgba(0,0,0,0.6)]"
                    />
                )}
                {text}
            </Link>
        </li>
    )
}

const socialLinks = [
    {
        href: 'mailto:sarria.qi.wang@gmail.com',
        label: 'Email Me',
        tooltip: 'Contact me via email',
        Icon: Email,
        newTab: false,
    },
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        label: 'View My Linkedin',
        tooltip: 'Connect with me on LinkedIn',
        Icon: Linkedin,
        newTab: true,
    },
    {
        href: 'https://github.com/SarriaXD',
        label: 'View My Github',
        tooltip: 'Check out my GitHub',
        Icon: Github,
        newTab: true,
    },
]

export const Header = () => {
    const [open, setOpen] = useState(false)
    const onClose = () => setOpen(false)
    const pathname = usePathname()
    return (
        <>
            <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
                <Container className="pt-3 md:pt-5">
                    <Glass
                        as="nav"
                        tint="dark"
                        aberration
                        band={14}
                        strength={0.8}
                        className={cn(
                            'pointer-events-auto mx-auto rounded-full px-2 [--lg-blur:26px] [--lg-sat:1.9] md:px-3',
                            HEADER_CLASS
                        )}
                        contentClassName="flex items-center justify-between gap-2"
                        aria-label="Primary"
                    >
                        <IconButton
                            size="md"
                            tone="neutral"
                            className="md:hidden"
                            aria-label="Open sidebar"
                            onClick={() => setOpen(true)}
                        >
                            <BurgerMenu className="size-6 text-white" />
                        </IconButton>
                        <Link
                            href="/"
                            className="flex items-center"
                            aria-label="Back To Home"
                        >
                            <IconButton
                                size="md"
                                tone="neutral"
                                variant="ghost"
                                refraction={false}
                                aria-label="Back To Home"
                                className="shadow-none [--lg-tint:transparent]"
                            >
                                <Dog className="size-8 text-white" />
                            </IconButton>
                        </Link>
                        <ul className="hidden md:flex md:items-center md:gap-1">
                            {internalLinks.map((link) => (
                                <NavLink
                                    key={link.href}
                                    {...link}
                                    active={
                                        !link.newTab && pathname === link.href
                                    }
                                />
                            ))}
                            <li
                                aria-hidden="true"
                                className="mx-1 h-6 w-px bg-white/15"
                            />
                            {socialLinks.map(
                                ({ href, label, tooltip, Icon, newTab }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            {...(newTab
                                                ? {
                                                      target: '_blank',
                                                      rel: 'noopener noreferrer',
                                                  }
                                                : {})}
                                        >
                                            <Tooltip content={tooltip}>
                                                <IconButton
                                                    tone="neutral"
                                                    size="sm"
                                                    refraction={false}
                                                    aria-label={label}
                                                >
                                                    <Icon className="size-5 text-white" />
                                                </IconButton>
                                            </Tooltip>
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                        <span
                            className="size-11 md:hidden"
                            aria-hidden="true"
                        />
                    </Glass>
                </Container>
            </header>
            <Sidebar open={open} onClose={onClose} />
        </>
    )
}
