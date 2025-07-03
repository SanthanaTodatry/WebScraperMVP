interface OpenAIAnalysisRequest {
  content: string
  prompt: string
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo'
}

interface OpenAIAnalysisResponse {
  extractedData: any
  summary: string
  insights: string[]
  confidence: number
  processingTime: number
}

class OpenAIClient {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async analyzeContent(request: OpenAIAnalysisRequest): Promise<OpenAIAnalysisResponse> {
    const startTime = Date.now()
    
    try {
      const systemPrompt = `You are an expert content analyzer. Your task is to analyze web content and extract meaningful information based on the user's specific requirements.

Please provide your response in the following JSON format:
{
  "extractedData": {
    // Specific data extracted based on the user's prompt
  },
  "summary": "A concise summary of the main content",
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "confidence": 0.85 // Your confidence level in the analysis (0-1)
}

Focus on accuracy and relevance to the user's request.`

      const userPrompt = `Content to analyze:
${request.content}

User's specific request:
${request.prompt}

Please analyze this content and extract the requested information.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      // Try to parse the JSON response
      let analysisResult
      try {
        analysisResult = JSON.parse(content)
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        analysisResult = {
          extractedData: { rawResponse: content },
          summary: content.substring(0, 200) + '...',
          insights: ['Analysis completed but response format was not structured'],
          confidence: 0.7
        }
      }

      const processingTime = (Date.now() - startTime) / 1000

      return {
        extractedData: analysisResult.extractedData || {},
        summary: analysisResult.summary || 'No summary available',
        insights: analysisResult.insights || [],
        confidence: analysisResult.confidence || 0.8,
        processingTime
      }
    } catch (error) {
      console.error('OpenAI analysis error:', error)
      const processingTime = (Date.now() - startTime) / 1000
      
      // Return a fallback response
      return {
        extractedData: { error: 'Analysis failed', originalPrompt: request.prompt },
        summary: 'AI analysis could not be completed due to an error.',
        insights: ['Analysis failed - please check your OpenAI API configuration'],
        confidence: 0,
        processingTime
      }
    }
  }
}

// Create and export OpenAI client instance
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    console.warn('OpenAI API key not found in environment variables')
    return null
  }
  
  return new OpenAIClient(apiKey)
}

export { OpenAIClient, getOpenAIClient }
export type { OpenAIAnalysisRequest, OpenAIAnalysisResponse }