import { useState, useRef, useEffect } from 'react'
import ChatCapture from './components/ChatCapture'
import AnalysisResult from './components/AnalysisResult'
import ConversationHistory from './components/ConversationHistory'
import { analyzeCapture } from './lib/api'
import { saveAnalysis, getCustomerAnalyses } from './lib/storage'

const ACCESS_CODE = 'viewpercent2026'

function LockScreen({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code === ACCESS_CODE) {
      localStorage.setItem('coach_access', 'granted')
      onUnlock()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-lg font-bold text-gray-900 text-center mb-1">
          Coach Unick 세일즈 코치
        </h1>
        <p className="text-xs text-gray-400 text-center mb-6">뷰퍼센트무브 내부 전용</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="접근 코드 입력"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          />
          {error && (
            <p className="text-xs text-red-500 text-center">코드가 올바르지 않습니다</p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            입장
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastRequest = useRef(null)

  useEffect(() => {
    if (localStorage.getItem('coach_access') === 'granted') {
      setAuthenticated(true)
    }
  }, [])

  if (!authenticated) {
    return <LockScreen onUnlock={() => setAuthenticated(true)} />
  }

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
