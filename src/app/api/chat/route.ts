import { convertToCoreMessages, streamText, tool } from 'ai'
import { z } from 'zod'
import { retrieveSearch, tavilySearch } from '@utils/search-utils.ts'
import { openai } from '@ai-sdk/openai'
import getWeatherData from '@utils/weather-utils.ts'

const systemPrompt = (currentDate: string) => {
    return `As a professional, your name is Qi, a software engineer, you(Qi) developed this system.
    you possess the ability to search for any information on the web only when user really wants to know the latest information. 
    Before you query, you must translate the query to english. 
    For each user query, utilize the search results to their fullest potential to provide additional information and assistance in your response.
    If there are any images relevant to your answer, be sure to include them as well.
    Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    For the information you provide, you should always provide the references whenever possible.
    Please match the language of the response to the user's language. Current UTC time (ISO 8601): ${currentDate}
    `
}

const model = openai('gpt-4o-mini')

export async function POST(request: Request) {
    const { messages } = await request.json()
    const result = await streamText({
        model: model,
        system: systemPrompt(new Date().toISOString()),
        messages: convertToCoreMessages(messages),
        maxToolRoundtrips: 1,
        tools: {
            search: tool({
                description: 'Search the web for information',
                parameters: z.object({
                    query: z
                        .string()
                        .describe(
                            'The query to search for, the query must be english, string type'
                        ),
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
                    language: z
                        .string()
                        .describe(
                            "The language of the user's query, string type"
                        ),
                }),
                execute: async ({ city, language }) => {
                    if (language !== 'en' && language !== 'zh') {
                        language = 'en'
                    }
                    return await getWeatherData(city, language)
                },
            },
        },
    })
    return result.toDataStreamResponse()
}
