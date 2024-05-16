import { IntroductionSection } from './IntroductionSection.tsx'
import { TechStackSection } from './TechStackSection.tsx'

export const HeroSection = () => {
    return (
        <>
            <section className="bg-hero-section-gradient">
                <div className="h-20" />
                <IntroductionSection />
                <TechStackSection />
            </section>
        </>
    )
}
