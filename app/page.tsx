import { HeroSection } from './components/HeroSection.tsx'
// import { ProjectListSection } from './components/ProjectListSection.tsx'
import { TechStackSection } from './components/TechStackSection.tsx'
import { getAllStaticImageColors } from './utils.ts'

export default async function Page() {
    const colorsMap = await getAllStaticImageColors()
    return (
        <main>
            <HeroSection colorsMap={colorsMap} />
            <TechStackSection colorsMap={colorsMap} />
            {/*<ProjectListSection />*/}
        </main>
    )
}
