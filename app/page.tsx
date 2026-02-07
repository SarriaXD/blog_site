import { HeroSection } from '@app/_components/sections/hero-section.tsx'
import { TechStackSection } from '@app/_components/sections/tech-stack-section.tsx'
import { getAllNeedColorImageColors } from '@lib/utils/utils.ts'
import { FlutterProjectSection } from '@app/_components/sections/flutter-project-section.tsx'
import { flutterProjectData } from '@lib/data/flutter-project-data.ts'
import { Header } from '@components/layout/header.tsx'
import { Footer } from '@components/layout/footer.tsx'
import ChatbotSection from '@app/_components/sections/chatbot-section/chatbot-section.tsx'
import { MainLayout } from '@components/ui/ui-kit.tsx'

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
