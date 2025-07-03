interface FirecrawlScrapeResponse {
  success: boolean
  data?: {
    content: string
    markdown: string
    html: string
    metadata: {
      title: string
      description: string
      language: string
      sourceURL: string
      [key: string]: any
    }
    links?: Array<{
      text: string
      href: string
    }>
  }
  error?: string
}

interface FirecrawlCrawlResponse {
  success: boolean
  jobId?: string
  data?: any[]
  error?: string
}

class FirecrawlClient {
  private apiKey: string
  private baseUrl = 'https://api.firecrawl.dev/v0'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async scrapeUrl(url: string, options: {
    formats?: string[]
    includeTags?: string[]
    excludeTags?: string[]
    onlyMainContent?: boolean
    timeout?: number
  } = {}): Promise<FirecrawlScrapeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: options.formats || ['markdown', 'html'],
          includeTags: options.includeTags,
          excludeTags: options.excludeTags,
          onlyMainContent: options.onlyMainContent ?? true,
          timeout: options.timeout || 30000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Firecrawl scrape error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async crawlWebsite(url: string, options: {
    crawlerOptions?: {
      includes?: string[]
      excludes?: string[]
      maxDepth?: number
      limit?: number
    }
    pageOptions?: {
      onlyMainContent?: boolean
      includeHtml?: boolean
    }
  } = {}): Promise<FirecrawlCrawlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url,
          crawlerOptions: {
            maxDepth: 1,
            limit: 10,
            ...options.crawlerOptions,
          },
          pageOptions: {
            onlyMainContent: true,
            includeHtml: false,
            ...options.pageOptions,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Firecrawl crawl error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async getCrawlStatus(jobId: string): Promise<FirecrawlCrawlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/crawl/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Firecrawl status check error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// Create and export Firecrawl client instance
const getFirecrawlClient = () => {
  const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY
  
  if (!apiKey) {
    console.warn('Firecrawl API key not found in environment variables')
    return null
  }
  
  return new FirecrawlClient(apiKey)
}

export { FirecrawlClient, getFirecrawlClient }
export type { FirecrawlScrapeResponse, FirecrawlCrawlResponse }