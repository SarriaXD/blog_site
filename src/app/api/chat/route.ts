import {
    convertToCoreMessages,
    generateText,
    streamText,
    tool,
    ToolResultPart,
} from 'ai'
import { createOllama } from 'ollama-ai-provider'
import { z } from 'zod'
import { retrieveSearch, tavilySearch } from '@utils/search-utils.ts'

const ollama = createOllama({
    baseURL: 'https://api.sarria.ca/ai-chat/api',
})

const systemPrompt = (currentDate: string) => {
    return `As a professional search expert and chinese language expert.
    your name is Qi, your first language is Chinese you should answer in Chinese, unless user speak English. 
    you possess the ability to search for any information on the web.
    or any information on the web.
    For each user query, utilize the search results to their fullest potential to provide additional information and assistance in your response.
    If there are any images relevant to your answer, be sure to include them as well.
    Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    For the information you provide, you should always provide the references.
    Whenever quoting or referencing information from a specific URL, always explicitly cite the source URL using the [[number]](url) format. Multiple citations can be included as needed, e.g., [[number]](url), [[number]](url).
    The number must always match the order of the search results.
    The retrieve tool can only be used with URLs provided by the user. URLs from search results cannot be used.
    If it is a domain instead of a URL, specify it in the include_domains of the search tool.
    Please match the language of the response to the user's language. Current date and time: ${currentDate}
    `
}

export async function POST(request: Request) {
    const { messages } = await request.json()
    const convertedMessages = convertToCoreMessages(messages)
    const firstResult = await generateText({
        // model: ollama('mistral-nemo'),
        model: ollama('sam4096/qwen2tools'),
        system: systemPrompt(new Date().toLocaleString()),
        tools: {
            search: tool({
                description: 'Search the web for information',
                parameters: z.object({
                    query: z
                        .string()
                        .describe('The query to search for, string type'),
                }),
                execute: async ({ query }) => {
                    return await tavilySearch(query)
                },
            }),
            retrieve: tool({
                description: 'Retrieve content from the web',
                parameters: z.object({
                    url: z
                        .string()
                        .describe('The url to retrieve, string type'),
                }),
                execute: async ({ url }) => {
                    return await retrieveSearch(url)
                },
            }),
        },
        toolChoice: 'auto', // force the model to call a tool
        messages: convertedMessages,
    })
    if (firstResult.toolResults && firstResult.toolResults.length > 0) {
        // if we find tool results, we need to make a second call to the model
        const toolResults: ToolResultPart[] = firstResult.toolResults.map(
            (toolResult) => {
                return {
                    type: 'tool-result',
                    toolCallId: toolResult.toolCallId,
                    toolName: toolResult.toolName,
                    result: toolResult.result,
                }
            }
        )
        convertedMessages.push({
            role: 'tool',
            content: toolResults,
        })
        const secondResult = await streamText({
            model: ollama('sam4096/qwen2tools'),
            system: systemPrompt(new Date().toLocaleString()),
            messages: convertedMessages,
        })
        return secondResult.toTextStreamResponse()
    } else {
        return new Response(streamString(firstResult.text))
    }
}

function streamString(str: string): ReadableStream {
    return new ReadableStream({
        start(controller: ReadableStreamDefaultController) {
            const encoder = new TextEncoder()
            for (const char of str) {
                controller.enqueue(encoder.encode(char))
            }
            controller.close()
        },
    })
}
