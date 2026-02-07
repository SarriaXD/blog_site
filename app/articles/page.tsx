import { Header } from '@ui/header.tsx'
import { Footer } from '@ui/footer.tsx'
import NotFoundText from '@ui/articles/not-found-text.tsx'
import NotFoundImage from '@ui/articles/not-found-image.tsx'
import { Container, MainLayout, Section } from '@ui/ui-kit.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <MainLayout className="bg-black">
                <Section className="py-16 md:py-24">
                    <Container className="flex items-center">
                        <div className="flex w-full flex-col items-center gap-8 md:flex-row md:justify-between lg:gap-24">
                        <NotFoundImage />
                        <NotFoundText />
                    </div>
                    </Container>
                </Section>
            </MainLayout>
            <Footer />
        </>
    )
}
