import { Typography } from '@material-tailwind/react'

export const HeroSection = () => {
    return (
        <>
            <section
                className="flex flex-col justify-center items-center gap-4
             py-4 px-20 text-center
             md:py-8 md:gap-8
             xl:py-20 xl:gap-12"
            >
                <Typography
                    variant="h1"
                    className="text-4xl
                    md:text-6xl md:max-w-screen-sm
                    xl:text-8xl xl:max-w-screen-lg"
                >
                    <span className="text-transparent bg-clip-text bg-hero-text-gradient">
                        I'm Qi
                    </span>
                    , a software engineer based in Canada.
                </Typography>
                <Typography
                    variant="h2"
                    color="gray"
                    textGradient={true}
                    className="text-2xl max-w-[60%]
                    md:text-3xl
                    xl:text-4xl"
                >
                    I specialize in full-stack development.
                </Typography>
            </section>
        </>
    )
}
