import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { useScrapingStore } from '../../stores/scrapingStore'
import { ScrapingResult } from '../../types'
import { 
  FileText, 
  Brain, 
  Database, 
  Info, 
  Copy, 
  Download,
  ExternalLink,
  Clock,
  Globe,
  BarChart3,
  CheckCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface ScrapingResultDisplayProps {
  jobId: string
  onClose?: () => void
}

export const ScrapingResultDisplay: React.FC<ScrapingResultDisplayProps> = ({ jobId, onClose }) => {
  const { results, fetchResults, loading, jobs } = useScrapingStore()
  const [activeTab, setActiveTab] = useState<'extracted' | 'raw' | 'analysis' | 'metadata'>('extracted')
  
  const job = jobs.find(j => j.id === jobId)
  const result = results.find(r => r.job_id === jobId)

  useEffect(() => {
    fetchResults(jobId)
  }, [jobId, fetchResults])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading results...</span>
      </div>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            {job?.status === 'completed' 
              ? 'Results are being processed and will appear shortly.'
              : 'This job hasn\'t completed yet or failed to produce results.'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    { id: 'extracted', label: 'Extracted Data', icon: Database },
    { id: 'analysis', label: 'AI Analysis', icon: Brain },
    { id: 'raw', label: 'Raw Content', icon: FileText },
    { id: 'metadata', label: 'Metadata', icon: Info },
  ] as const

  const renderJsonData = (data: any, title: string) => {
    if (!data) return <p className="text-gray-500 italic">No data available</p>
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadAsJson(data, `${title.toLowerCase().replace(' ', '_')}_${jobId}`)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  const renderExtractedData = () => {
    const data = result.extracted_data
    if (!data) return renderJsonData(data, 'Extracted Data')

    return (
      <div className="space-y-6">
        {data.title && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Page Title</h4>
            <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{data.title}</p>
          </div>
        )}
        
        {data.headings && data.headings.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Headings</h4>
            <ul className="space-y-2">
              {data.headings.map((heading: string, index: number) => (
                <li key={index} className="bg-gray-50 p-2 rounded border-l-4 border-primary-500">
                  {heading}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {data.paragraphs && data.paragraphs.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Content Paragraphs</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.paragraphs.map((paragraph: string, index: number) => (
                <p key={index} className="bg-gray-50 p-3 rounded text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {data.links && data.links.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Links Found</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.links.map((link: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-gray-700">{link.text}</span>
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            className="mr-2"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy All Data
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadAsJson(data, `extracted_data_${jobId}`)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
        </div>
      </div>
    )
  }

  const renderAiAnalysis = () => {
    const analysis = result.ai_analysis
    if (!analysis) return renderJsonData(analysis, 'AI Analysis')

    return (
      <div className="space-y-6">
        {analysis.summary && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Summary
            </h4>
            <p className="bg-blue-50 p-4 rounded-lg text-gray-800 border-l-4 border-blue-500">
              {analysis.summary}
            </p>
          </div>
        )}
        
        {analysis.keyTopics && analysis.keyTopics.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Key Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keyTopics.map((topic: string, index: number) => (
                <span 
                  key={index}
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {analysis.sentiment && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sentiment Analysis</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {analysis.sentiment}
              </span>
              {analysis.confidence && (
                <span className="ml-3 text-gray-600">
                  Confidence: {(analysis.confidence * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}
        
        {analysis.extractedInfo && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Extracted Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(analysis.extractedInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(analysis, null, 2))}
            className="mr-2"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Analysis
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadAsJson(analysis, `ai_analysis_${jobId}`)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Job Information Header */}
      {job && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Scraping Results</h3>
                  <p className="text-sm text-gray-600">{job.url}</p>
                </div>
              </div>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-sm text-gray-600">Status: Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </span>
              </div>
              {result.metadata?.processingTime && (
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Processed in {result.metadata.processingTime}s
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {activeTab === 'extracted' && renderExtractedData()}
          {activeTab === 'analysis' && renderAiAnalysis()}
          {activeTab === 'raw' && renderJsonData(result.raw_content, 'Raw Content')}
          {activeTab === 'metadata' && renderJsonData(result.metadata, 'Metadata')}
        </CardContent>
      </Card>
    </div>
  )
}