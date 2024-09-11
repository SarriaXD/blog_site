import { HeroSection } from './components/HeroSection.tsx'
import { TechStackSection } from './components/TechStackSection.tsx'
import { getAllNeedColorImageColors } from '@utils/utils.ts'
import { FlutterProjectSection } from './components/FlutterProjectSection.tsx'
import { flutterProjectData } from '@data/flutterProjectData.ts'
import { Header } from '@components/Header.tsx'
import { Footer } from '@components/Footer.tsx'

export default async function Page() {
    const colorsMap = await getAllNeedColorImageColors()
    const flutterProjectColors = flutterProjectData.map(
        ({ images }) => colorsMap.get(images[1].src)!
    )
    return (
        <>
            <Header />
            <main>
                <HeroSection colorsMap={colorsMap} />
                <TechStackSection colorsMap={colorsMap} />
                <FlutterProjectSection colors={flutterProjectColors} />
            </main>
            <Footer />
        </>
    )
}
