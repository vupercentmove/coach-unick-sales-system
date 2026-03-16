import { useState } from 'react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      {copied ? '복사됨' : '복사'}
    </button>
  )
}

function DiagnosisSection({ diagnosis }) {
  if (!diagnosis) return null

  const stageColors = {
    '초기탐색': 'bg-gray-100 text-gray-700',
    '비교검토': 'bg-yellow-100 text-yellow-700',
    '결정직전': 'bg-green-100 text-green-700'
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-900">고객 진단</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-500 text-xs">예산 규모</span>
          <p className="font-medium">{diagnosis.estimatedBudget}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-500 text-xs">불만 유형</span>
          <p className="font-medium">{diagnosis.painType}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-500 text-xs">구매 단계</span>
          <p>
            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${stageColors[diagnosis.buyingStage] || 'bg-gray-100'}`}>
              {diagnosis.buyingStage}
            </span>
          </p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-500 text-xs">예상 객단가</span>
          <p className="font-medium">{diagnosis.expectedValue}</p>
        </div>
      </div>
      {diagnosis.reasoning && (
        <p className="text-xs text-gray-500 mt-1">{diagnosis.reasoning}</p>
      )}
    </div>
  )
}

function ResponseSection({ responses }) {
  if (!responses) return null

  const [activeTone, setActiveTone] = useState('soft')

  const tones = [
    { key: 'soft', label: '부드러운' },
    { key: 'professional', label: '전문적' },
    { key: 'closing', label: '클로징' }
  ]

  const activeResponse = responses[activeTone] || ''

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-900">추천 응대</h3>
      <div className="flex gap-1">
        {tones.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTone(key)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${activeTone === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed relative">
        <p className="whitespace-pre-wrap pr-10">{activeResponse}</p>
        <div className="absolute top-2 right-2">
          <CopyButton text={activeResponse} />
        </div>
      </div>
    </div>
  )
}

function NextActionSection({ nextActions, upsellTiming }) {
  if (!nextActions) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-900">다음 액션</h3>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 font-bold text-xs mt-0.5 shrink-0">1순위</span>
          <p>{nextActions.primary}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 font-bold text-xs mt-0.5 shrink-0">2순위</span>
          <p>{nextActions.secondary}</p>
        </div>
        {nextActions.warning && (
          <div className="flex items-start gap-2 bg-red-50 rounded p-2">
            <span className="text-red-500 text-xs mt-0.5 font-bold shrink-0">주의</span>
            <p className="text-red-700 text-xs">{nextActions.warning}</p>
          </div>
        )}
      </div>
      {upsellTiming && (
        <div className="bg-green-50 rounded p-2 text-xs text-green-700">
          <span className="font-bold">업셀:</span> {upsellTiming}
        </div>
      )}
    </div>
  )
}

export default function AnalysisResult({ result, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 mt-3">대화를 분석하고 있어요...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-4">
        <p className="text-sm text-red-600">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
        <p className="text-sm text-gray-400">대화 캡처를 올리면 분석 결과가 여기에 표시됩니다</p>
      </div>
    )
  }

  const { parsed, raw } = result

  if (!parsed) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">분석 결과</h3>
        <p className="text-sm whitespace-pre-wrap">{raw}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <DiagnosisSection diagnosis={parsed.diagnosis} />
      <hr className="border-gray-100" />
      <ResponseSection responses={parsed.responses} />
      <hr className="border-gray-100" />
      <NextActionSection
        nextActions={parsed.nextActions}
        upsellTiming={parsed.upsellTiming}
      />
    </div>
  )
}
