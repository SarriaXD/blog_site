import { HeroSection } from './components/HeroSection.tsx'
import { ProjectListSection } from './components/ProjectListSection.tsx'

export default function Page() {
    return (
        <main>
            <HeroSection />
            <ProjectListSection />
            <section className="h-[2000px]" />
        </main>
    )
}
