import { ProjectListSection } from '../sections/home/ProjectListSection.tsx'
import { HeroSection } from '../sections/home/HeroSection.tsx'

export function Homepage() {
    return (
        <>
            <HeroSection />
            <ProjectListSection />
            <section className="h-[2000px]" />
        </>
    )
}
