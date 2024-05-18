import { IntroductionSection } from './IntroductionSection.tsx'
import { TechStackSection } from './TechStackSection.tsx'

export const HeroSection = () => {
    return (
        <>
            <section className="bg-hero-section-gradient min-h-[80vh] md:min-h-[120vh] xl:min-h-[150vh]">
                <div className="h-20" />
                <IntroductionSection />
                <TechStackSection />
            </section>
        </>
    )
}
