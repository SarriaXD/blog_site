import { HeroSection } from './components/HeroSection.tsx'
// import { ProjectListSection } from './components/ProjectListSection.tsx'
import { TechStackSection } from './components/TechStackSection.tsx'
import { getAllNeedColorImageColors } from './utils.ts'

export default async function Page() {
    const colorsMap = await getAllNeedColorImageColors()
    return (
        <main>
            <HeroSection colorsMap={colorsMap} />
            <TechStackSection colorsMap={colorsMap} />
            {/*<ProjectListSection />*/}
        </main>
    )
}
