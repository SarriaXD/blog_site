const ChatTextField = () => {
    return (
        <div className="flex items-center justify-between rounded-full border border-white bg-[#0D1116] p-4">
            <input
                type="text"
                className="w-full border-none bg-transparent p-2 text-white outline-none"
                placeholder="Type a message"
            />
            <button className="rounded-md bg-[#1E242B] p-2 text-white">
                Send
            </button>
        </div>
    )
}

export default ChatTextField
