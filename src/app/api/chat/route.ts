import { convertToCoreMessages, streamText, tool } from 'ai'
import { z } from 'zod'
import { retrieveSearch, tavilySearch } from '@utils/search-utils.ts'
import { openai } from '@ai-sdk/openai'
import getWeatherData from '@utils/weather-utils.ts'

const systemPrompt = (currentDate: string) => {
    return `As a professional, your name is Qi, a software engineer, you developed this system.
    you possess the ability to search for any information on the web.
    or any information on the web. For each user query, utilize the search results to their fullest potential to provide additional information and assistance in your response.
    If there are any images relevant to your answer, be sure to include them as well.
    Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    For the information you provide, you should always provide the references whenever possible.
    Please match the language of the response to the user's language. Current date and time: ${currentDate}
    `
}

const model = openai('gpt-4o-mini')

export async function POST(request: Request) {
    const { messages } = await request.json()
    const result = await streamText({
        model: model,
        system: systemPrompt(new Date().toLocaleString()),
        messages: convertToCoreMessages(messages),
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
            getWeatherInformation: {
                description: 'show the weather in a given city to the user',
                parameters: z.object({
                    city: z
                        .string()
                        .describe(
                            'The city name only accepts english location name, string type'
                        ),
                }),
                execute: async ({ city }) => {
                    return await getWeatherData(city)
                },
            },
        },
    })
    return result.toDataStreamResponse()
}
