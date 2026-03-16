import { useState, useRef } from 'react'
import ChatCapture from './components/ChatCapture'
import AnalysisResult from './components/AnalysisResult'
import ConversationHistory from './components/ConversationHistory'
import { analyzeCapture } from './lib/api'
import { saveAnalysis, getCustomerAnalyses } from './lib/storage'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastRequest = useRef(null)

  const handleAnalyze = async (image, memo, customerName) => {
    setLoading(true)
    setError(null)
    setResult(null)
    lastRequest.current = { image, memo, customerName }

    try {
      let history = ''
      if (customerName) {
        const prev = getCustomerAnalyses(customerName)
        if (prev.length > 0) {
          const last = prev[prev.length - 1]
          history = `이전 진단: ${last.diagnosis?.estimatedBudget || ''}, ${last.diagnosis?.painType || ''}, ${last.diagnosis?.buyingStage || ''}`
        }
      }

      const data = await analyzeCapture(image, memo, history)
      setResult(data)

      if (data.parsed && customerName) {
        saveAnalysis(customerName, {
          memo,
          diagnosis: data.parsed.diagnosis,
          suggestedResponses: data.parsed.responses,
          nextActions: data.parsed.nextActions
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastRequest.current) {
      const { image, memo, customerName } = lastRequest.current
      handleAnalyze(image, memo, customerName)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">
          Coach Unick 세일즈 코치
        </h1>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChatCapture onAnalyze={handleAnalyze} loading={loading} />
          <AnalysisResult result={result} loading={loading} error={error} onRetry={handleRetry} />
        </div>

        <ConversationHistory />
      </main>
    </div>
  )
}
