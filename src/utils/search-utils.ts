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
            max_results: Math.max(maxResults, 5),
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
}

export default tavilySearch
