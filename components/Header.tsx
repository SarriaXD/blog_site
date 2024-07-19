import { Button, IconButton } from './Material.tsx'

interface LinkProps {
    href: string
    text: string
}

const links: LinkProps[] = [
    { href: '#', text: 'Home' },
    { href: '#', text: 'Articles' },
    { href: '#', text: 'Projects' },
]

const NavLink = ({ href, text }: LinkProps) => {
    return (
        <li>
            <a href={href}>
                <Button
                    variant="text"
                    size="lg"
                    color="white"
                    className="normal-case"
                >
                    {text}
                </Button>
            </a>
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
                <i className="fa-solid fa-dog text-2xl text-gray-200" />
                <ul className="hidden gap-2 md:flex md:items-center">
                    {links.map((link) => (
                        <NavLink
                            key={link.text}
                            href={link.href}
                            text={link.text}
                        />
                    ))}
                    <li>
                        <IconButton>
                            <i className="fa-brands fa-github text-2xl" />
                        </IconButton>
                    </li>
                </ul>
            </nav>
        </header>
    )
}
