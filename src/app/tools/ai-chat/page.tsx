import ChatContent from './components/ChatContent.tsx'
import ChatTextField from './components/ChatTextField.tsx'

const MainContent = () => {
    return (
        <div className="h-full overflow-y-scroll">
            <ChatContent />
            <ChatTextField />
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <section className="bg-[#0D1116] py-24">
                <div className="mx-auto md:max-w-[600px] lg:max-w-[800px]">
                    <MainContent />
                </div>
            </section>
        </main>
    )
}
