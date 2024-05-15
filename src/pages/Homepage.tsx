import { HeroSection } from '../sections/home/HeroSection.tsx'
import { TechStackSection } from '../sections/home/TechStackSection.tsx'
import { ProjectListSection } from '../sections/home/ProjectListSection.tsx'

export function Homepage() {
    return (
        <>
            <HeroSection />
            <TechStackSection />
            <ProjectListSection />
            <section className="h-[2000px]" />
        </>
    )
}
