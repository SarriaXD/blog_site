import { Header } from '@components/Header.tsx'
import MainContent from '../components/MainContent.tsx'
import { Footer } from '@components/Footer.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <main className="bg-black py-32">
                <div className="mx-auto min-h-screen bg-[#1A1A1A] md:max-w-[908px] md:rounded-3xl lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </main>
            <Footer />
        </>
    )
}
