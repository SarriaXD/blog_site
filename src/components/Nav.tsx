interface LinkProps {
    href: string
    text: string
}

const links: LinkProps[] = [
    { href: '/', text: 'Home' },
    { href: '/', text: 'My Projects' },
]

export const Nav = () => {
    return (
        <>
            <nav
                className="fixed
              top-0 left-0 right-0
              z-50
              h-20 w-full
              pl-4
              bg-[#141E38] bg-opacity-95
              flex justify-start items-center gap-4
              backdrop-blur
              sm:justify-between sm:gap-0
              sm:px-24
              "
            >
                <img className="h-full px-8 py-4" src="/logo.png" alt="logo" />
                <ul className="flex justify-center items-center h-full">
                    {links.map((link) => (
                        <li key={link.text} className="h-full">
                            <a
                                className="flex items-center
                            h-full px-4
                            hover:bg-black hover:bg-opacity-20
                            sm:px-8"
                                href={link.href}
                            >
                                {link.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="h-20"></div>
        </>
    )
}
