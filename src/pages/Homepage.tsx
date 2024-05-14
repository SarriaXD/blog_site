import { HeroSection } from '../sections/home/HeroSection.tsx'
import { TechStackSection } from '../sections/home/TechStackSection.tsx'

export function Homepage() {
    return (
        <>
            <HeroSection />
            <TechStackSection />
            <section className="h-[2000px]" />
        </>
    )
}
