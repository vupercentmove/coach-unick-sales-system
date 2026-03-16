import { useState, useMemo } from 'react'
import { getAllCustomers, getCustomerAnalyses, deleteCustomer } from '../lib/storage'

export default function ConversationHistory() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const customers = useMemo(() => {
    const all = getAllCustomers()
    if (!search) return all
    return all.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, refreshKey])

  if (customers.length === 0 && !search) {
    return null
  }

  const handleDelete = (name) => {
    if (confirm(`"${name}" 고객 데이터를 삭제할까요?`)) {
      deleteCustomer(name)
      setRefreshKey(k => k + 1)
    }
  }

  const stageLabels = {
    dm: 'DM',
    kakaotalk: '카카오톡',
    consulting: '상담 중',
    contract: '계약 완료'
  }

  return (
    <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">대화 히스토리</h2>
        <input
          type="text"
          placeholder="고객명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-xs w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {customers.map((customer) => (
          <div key={customer.name} className="border border-gray-100 rounded-lg">
            <div
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === customer.name ? null : customer.name)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{customer.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  customer.stage === 'contract' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stageLabels[customer.stage] || customer.stage}
                </span>
                <span className="text-xs text-gray-400">{customer.analysisCount}건</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {customer.lastAnalysis && new Date(customer.lastAnalysis).toLocaleDateString('ko-KR')}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(customer.name) }}
                  className="text-xs text-gray-300 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            </div>

            {expanded === customer.name && (
              <div className="border-t border-gray-100 p-2 space-y-2">
                {getCustomerAnalyses(customer.name).slice(-5).reverse().map((analysis, i) => (
                  <div key={i} className="text-xs bg-gray-50 rounded p-2">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>{new Date(analysis.timestamp).toLocaleString('ko-KR')}</span>
                    </div>
                    {analysis.diagnosis && (
                      <p>
                        {analysis.diagnosis.estimatedBudget} / {analysis.diagnosis.painType} / {analysis.diagnosis.buyingStage}
                      </p>
                    )}
                    {analysis.memo && <p className="text-gray-500 mt-1">메모: {analysis.memo}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
