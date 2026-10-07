import DeviceMockupContent from '@app/tools/device-mockup/_components/device-mockup-content.tsx'
import { Header } from '@components/layout/header.tsx'
import { Footer } from '@components/layout/footer.tsx'
import { Container, Glass, MainLayout } from '@components/ui/ui-kit.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <MainLayout>
                <Container className="py-10 md:py-16">
                    <Glass
                        tint="clear"
                        band={34}
                        strength={0.7}
                        className="min-h-[70vh] rounded-[36px] [--lg-blur:28px]"
                    >
                        <DeviceMockupContent />
                    </Glass>
                </Container>
            </MainLayout>
            <Footer />
        </>
    )
}
