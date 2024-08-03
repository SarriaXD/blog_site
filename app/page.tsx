import { HeroSection } from './components/HeroSection.tsx'
import { TechStackSection } from './components/TechStackSection.tsx'
import { getAllNeedColorImageColors } from './utils.ts'
import { FlutterProjectSection } from './components/FlutterProjectSection.tsx'

export default async function Page() {
    const colorsMap = await getAllNeedColorImageColors()
    return (
        <main>
            <HeroSection colorsMap={colorsMap} />
            <TechStackSection colorsMap={colorsMap} />
            <FlutterProjectSection />
        </main>
    )
}
