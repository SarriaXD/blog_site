import DeviceMockupContent from '@app/tools/device-mockup/_components/device-mockup-content.tsx'
import { Header } from '@components/layout/header.tsx'
import { Footer } from '@components/layout/footer.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <main className="bg-black py-32">
                <div className="mx-auto min-h-screen bg-[#1A1A1A] md:max-w-[908px] md:rounded-3xl lg:max-w-[1120px]">
                    <DeviceMockupContent />
                </div>
            </main>
            <Footer />
        </>
    )
}
