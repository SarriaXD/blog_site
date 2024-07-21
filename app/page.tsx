import { HeroSection } from './components/HeroSection.tsx'
import { ProjectListSection } from './components/ProjectListSection.tsx'
import { TechStackSection } from './components/TechStackSection.tsx'

export default function Page() {
    return (
        <main>
            <HeroSection />
            <TechStackSection />
            <ProjectListSection />
            <section className="h-[2000px]" />
        </main>
    )
}
