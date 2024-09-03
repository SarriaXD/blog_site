import { streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider'

const remoteOllama = createOllama({
    baseURL: 'https://api.sarria.ca/ai-chat',
})

export async function POST(request: Request) {
    const { messages } = await request.json()
    const result = await streamText({
        model: remoteOllama('llama3.1'),
        messages: messages,
    })
    return result.toTextStreamResponse()
}
