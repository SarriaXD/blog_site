import ChatContent from './components/ChatContent.tsx'
import { Header } from '@components/Header.tsx'
export default function Page() {
    return (
        <>
            <Header />
            <main className="size-full bg-[#212121]">
                <ChatContent />
            </main>
        </>
    )
}
