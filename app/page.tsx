import { HeroSection } from './components/HeroSection.tsx'
import { ProjectListSection } from './components/ProjectListSection.tsx'
import { TechStackSection } from './components/TechStackSection.tsx'

export default async function Page() {
    return (
        <main>
            <HeroSection />
            <TechStackSection />
            <ProjectListSection />
        </main>
    )
}
