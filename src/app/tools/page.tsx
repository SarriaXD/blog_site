import { Header } from '@components/Header.tsx'
import MainContent from './components/MainContent.tsx'
import { Footer } from '@components/Footer.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <main className="size-full bg-[#101010] py-24">
                <div className="mx-auto size-full py-24 md:max-w-[908px] lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </main>
            <Footer />
        </>
    )
}
