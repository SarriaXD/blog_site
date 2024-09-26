import { HeroSection } from '@ui/home/hero-section.tsx'
import { TechStackSection } from '@ui/home/tech-stack-section.tsx'
import { getAllNeedColorImageColors } from './lib/utils/utils.ts'
import { FlutterProjectSection } from '@ui/home/flutter-project-section.tsx'
import { flutterProjectData } from './lib/data/flutterProjectData.ts'
import { Header } from '@ui/header.tsx'
import { Footer } from '@ui/footer.tsx'
import AiChatbotSection from '@ui/home/ai-chatbot-section/ai-chatbot-section.tsx'

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
                <AiChatbotSection />
            </main>
            <Footer />
        </>
    )
}
