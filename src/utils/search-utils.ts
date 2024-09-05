import * as process from 'node:process'

export type SearchResults = {
    images: SearchResultImage[]
    results: SearchResultItem[]
    number_of_results?: number
    query: string
}

export type SearchResultImage =
    | string
    | {
          url: string
          description: string
          number_of_results?: number
      }

export type SearchResultItem = {
    title: string
    url: string
    content: string
}

/**
 * Sanitizes a URL by replacing spaces with '%20'
 * @param url - The URL to sanitize
 * @returns The sanitized URL
 */
export function sanitizeUrl(url: string): string {
    return url.replace(/\s+/g, '%20')
}

async function tavilySearch(
    query: string,
    maxResults: number = 10,
    searchDepth: 'basic' | 'advanced' = 'basic',
    includeDomains: string[] = [],
    excludeDomains: string[] = []
): Promise<SearchResults> {
    try {
        const apiKey = process.env.TAVILY_API_KEY
        if (!apiKey) {
            throw new Error(
                'TAVILY_API_KEY is not set in the environment variables'
            )
        }
        const includeImageDescriptions = true
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                max_results: maxResults,
                search_depth: searchDepth,
                include_images: true,
                include_image_descriptions: includeImageDescriptions,
                include_answers: true,
                include_domains: includeDomains,
                exclude_domains: excludeDomains,
            }),
        })
        if (!response.ok) {
            throw new Error(
                `Tavily API error: ${response.status} ${response.statusText}`
            )
        }

        const data = await response.json()
        const processedImages = includeImageDescriptions
            ? data.images
                  .map(
                      ({
                          url,
                          description,
                      }: {
                          url: string
                          description: string
                      }) => ({
                          url: sanitizeUrl(url),
                          description,
                      })
                  )
                  .filter(
                      (
                          image: SearchResultImage
                      ): image is { url: string; description: string } =>
                          typeof image === 'object' &&
                          image.description !== undefined &&
                          image.description !== ''
                  )
            : data.images.map((url: string) => sanitizeUrl(url))
        return {
            ...data,
            images: processedImages,
        }
    } catch (error) {
        return {
            images: [],
            results: [],
            query,
        }
    }
}

const retrieveSearch = async (url: string) => {
    let hasError = false

    let results: SearchResults | undefined
    try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-With-Generated-Alt': 'true',
            },
        })
        const json = await response.json()
        if (!json.data || json.data.length === 0) {
            hasError = true
        } else {
            // Limit the content to 5000 characters
            if (json.data.content.length > 5000) {
                json.data.content = json.data.content.slice(0, 5000)
            }
            results = {
                results: [
                    {
                        title: json.data.title,
                        content: json.data.content,
                        url: json.data.url,
                    },
                ],
                query: '',
                images: [],
            }
        }
    } catch (error) {
        hasError = true
    }

    if (hasError || !results) {
        return results
    }

    return results
}

export { tavilySearch, retrieveSearch }
