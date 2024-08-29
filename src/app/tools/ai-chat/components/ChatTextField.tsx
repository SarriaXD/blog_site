const ChatTextField = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 mx-auto bg-[#0D1116] px-4 py-4 md:max-w-[600px] md:px-8 lg:max-w-[800px] lg:px-12">
            <div className="flex items-center justify-between rounded-full border border-white p-4">
                <input
                    type="text"
                    className="w-full border-none bg-transparent p-2 text-white outline-none"
                    placeholder="Type a message"
                />
                <button className="rounded-md bg-[#1E242B] p-2 text-white">
                    Send
                </button>
            </div>
        </div>
    )
}

export default ChatTextField
