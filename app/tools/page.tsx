import { Header } from '../ui/header.tsx'
import MainContent from '../ui/tools/main-content.tsx'
import { Footer } from '../ui/footer.tsx'

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
