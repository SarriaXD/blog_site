import { Button, IconButton } from '@material-tailwind/react'

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

export const Nav = () => {
    return (
        <>
            <nav
                className="fixed
              top-0 left-0 right-0
              z-50
              pl-4 pr-8 py-2
              bg-[#050C0F] bg-opacity-60
              flex justify-between items-center gap-4
              backdrop-blur
              md:px-12
              "
            >
                <IconButton size="lg" className="md:hidden">
                    <i className="fa-solid fa-bars fa-lg" />
                </IconButton>
                <i className="fa-solid fa-dog text-gray-200 text-2xl" />
                <ul className="hidden md:flex md:items-center gap-2">
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
        </>
    )
}
