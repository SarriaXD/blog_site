import { HeroSection } from '@ui/home/hero-section.tsx'
import { TechStackSection } from '@ui/home/tech-stack-section.tsx'
import { getAllNeedColorImageColors } from './lib/utils/utils.ts'
import { FlutterProjectSection } from '@ui/home/flutter-project-section.tsx'
import { flutterProjectData } from '@lib/data/flutter-project-data.ts'
import { Header } from '@ui/header.tsx'
import { Footer } from '@ui/footer.tsx'
import ChatbotSection from '@ui/home/chatbot-section/chatbot-section.tsx'
import { MainLayout } from '@ui/ui-kit.tsx'

export default async function Page() {
    const colorsMap = await getAllNeedColorImageColors()
    const flutterProjectColors = flutterProjectData.map(
        ({ images }) => colorsMap.get(images[1].src)!
    )
    return (
        <>
            <Header />
            <MainLayout>
                <HeroSection colorsMap={colorsMap} />
                <TechStackSection colorsMap={colorsMap} />
                <FlutterProjectSection colors={flutterProjectColors} />
                <ChatbotSection />
            </MainLayout>
            <Footer />
        </>
    )
}
