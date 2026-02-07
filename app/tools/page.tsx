import { Header } from '@ui/header.tsx'
import MainContent from '@ui/tools/main-content.tsx'
import { Footer } from '@ui/footer.tsx'
import { Container, MainLayout, Section } from '@ui/ui-kit.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <MainLayout className="bg-[#101010]">
                <Section className="py-16 md:py-24">
                    <Container>
                    <MainContent />
                    </Container>
                </Section>
            </MainLayout>
            <Footer />
        </>
    )
}
