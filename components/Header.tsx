import { Button, IconButton } from './Material.tsx'
import Link from 'next/link'

interface InternalLinkProps {
    href: string
    text: string
}

const internalLinks: InternalLinkProps[] = [
    { href: '/articles', text: 'Articles' },
    { href: 'https://github.com/SarriaXD?tab=repositories', text: 'Projects' },
]

const InternalLink = ({ href, text }: InternalLinkProps) => {
    return (
        <li>
            <Link href={href}>
                <Button
                    variant="text"
                    size="lg"
                    color="white"
                    className="normal-case"
                >
                    {text}
                </Button>
            </Link>
        </li>
    )
}

const externalLinks: ExternalLinkProps[] = [
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        className: 'fa-brands fa-linkedin',
    },
    { href: 'https://github.com/SarriaXD', className: 'fa-brands fa-github' },
]

interface ExternalLinkProps {
    href: string
    className: string
}

const ExternalLink = ({ href, className }: ExternalLinkProps) => {
    return (
        <li>
            <Link href={href}>
                <IconButton>
                    <i className={`${className} text-2xl`} />
                </IconButton>
            </Link>
        </li>
    )
}

export const Header = () => {
    return (
        <header>
            <nav
                className="fixed
              left-0 right-0 top-0
              z-50
              flex items-center justify-between
              gap-4 bg-[#050C0F]
              bg-opacity-60 py-2 pl-4 pr-8
              backdrop-blur
              md:px-12
              "
            >
                <IconButton size="lg" className="md:hidden">
                    <i className="fa-solid fa-bars fa-lg" />
                </IconButton>
                <Link href="/">
                    <i className="fa-solid fa-dog text-2xl text-gray-200" />
                </Link>
                <ul className="hidden gap-2 md:flex md:items-center">
                    {internalLinks.map((link) => (
                        <InternalLink key={link.text} {...link} />
                    ))}
                    {externalLinks.map((link) => (
                        <ExternalLink key={link.href} {...link} />
                    ))}
                </ul>
            </nav>
        </header>
    )
}
