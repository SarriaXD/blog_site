import ChatContent from './components/ChatContent.tsx'
import ChatTextField from './components/ChatTextField.tsx'

export default function Page() {
    return (
        <main>
            <section className="bg-[#02040A] pb-32 pt-24">
                <div className="mx-auto px-8 md:max-w-[600px] lg:max-w-[800px]">
                    <ChatContent />
                </div>
                <div className="fixed bottom-0 left-0 right-0 mx-auto px-8 md:max-w-[600px] lg:max-w-[800px]">
                    <ChatTextField />
                </div>
            </section>
        </main>
    )
}
