import { convertToCoreMessages, streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider'

const ollama = createOllama({
    baseURL: 'https://api.sarria.ca/ai-chat',
})

export async function POST(request: Request) {
    const { messages } = await request.json()
    const result = await streamText({
        model: ollama('llama3.1'),
        messages: convertToCoreMessages(messages),
    })
    return result.toDataStreamResponse()
}
