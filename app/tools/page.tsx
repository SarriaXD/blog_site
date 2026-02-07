import { Header } from '@components/layout/header.tsx'
import MainContent from '@app/tools/_components/main-content.tsx'
import { Footer } from '@components/layout/footer.tsx'
import { Container, MainLayout, Section } from '@components/ui/ui-kit.tsx'

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
