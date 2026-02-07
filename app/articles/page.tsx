import { Header } from '@components/layout/header.tsx'
import { Footer } from '@components/layout/footer.tsx'
import NotFoundText from '@app/articles/_components/not-found-text.tsx'
import NotFoundImage from '@app/articles/_components/not-found-image.tsx'
import { Container, MainLayout, Section } from '@components/ui/ui-kit.tsx'

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
