import { useState, useRef, useCallback } from 'react'

const ACCEPTED_TYPES = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'application/pdf': 'document',
  'text/plain': 'text',
  'text/csv': 'text',
}

const MAX_SIZE = 10 * 1024 * 1024

function getFileCategory(file) {
  if (ACCEPTED_TYPES[file.type]) return ACCEPTED_TYPES[file.type]
  if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) return 'text'
  if (file.name.endsWith('.pdf')) return 'document'
  if (file.type.startsWith('image/')) return 'image'
  return null
}

export default function ChatCapture({ onAnalyze, loading }) {
  const [fileData, setFileData] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [memo, setMemo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const processFile = useCallback((file) => {
    if (!file) return

    const category = getFileCategory(file)
    if (!category) {
      alert('지원하는 파일: 이미지(PNG/JPG/GIF/WebP), PDF, 텍스트(TXT/CSV)')
      return
    }

    if (file.size > MAX_SIZE) {
      alert('파일 크기는 10MB 이하로 올려주세요.')
      return
    }

    setFileName(file.name)

    if (category === 'text') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        setPreview(null)
        setFileData({ type: 'text', content, fileName: file.name })
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target.result
        const base64 = dataUrl.split(',')[1]
        if (category === 'image') {
          setPreview(dataUrl)
        } else {
          setPreview(null)
        }
        setFileData({ type: category, data: base64, mediaType: file.type, fileName: file.name })
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        processFile(item.getAsFile())
        break
      }
    }
  }, [processFile])

  const handleClear = () => {
    setFileData(null)
    setPreview(null)
    setFileName('')
    setMemo('')
    setCustomerName('')
  }

  const renderPreview = () => {
    if (!fileData) {
      return (
        <div className="text-gray-500">
          <p className="text-sm font-medium">대화 캡처 / 파일을 올려주세요</p>
          <p className="text-xs mt-1">이미지, PDF, 텍스트 파일 지원</p>
          <p className="text-xs mt-0.5 text-gray-400">드래그 & 드롭, 클릭, 또는 Ctrl+V</p>
        </div>
      )
    }

    if (preview) {
      return (
        <div className="relative">
          <img src={preview} alt="대화 캡처" className="max-h-[400px] rounded" />
          <button
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
          >
            X
          </button>
        </div>
      )
    }

    // PDF or text file preview
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">
            {fileData.type === 'document' ? '📄' : '📝'}
          </span>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">
              {fileData.type === 'document' ? 'PDF 문서' : '텍스트 파일'}
            </p>
            {fileData.type === 'text' && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {fileData.content.substring(0, 200)}...
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            className="bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70 shrink-0"
          >
            X
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <input
        type="text"
        placeholder="고객명 / 브랜드명 (선택)"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onPaste={handlePaste}
        onClick={() => !fileData && fileRef.current?.click()}
        tabIndex={0}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors min-h-[200px] flex items-center justify-center
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${fileData ? 'cursor-default' : ''}
        `}
      >
        {renderPreview()}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.txt,.csv"
          onChange={(e) => processFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <textarea
        placeholder="추가 메모 (선택) — 예: 현재 타 대행사 사용 중, 월 광고비 2천만원"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={() => fileData && onAnalyze(fileData, memo, customerName)}
        disabled={!fileData || loading}
        className={`
          w-full py-2.5 rounded-lg font-medium text-sm transition-colors
          ${fileData && !loading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
        `}
      >
        {loading ? '분석 중...' : '분석하기'}
      </button>
    </div>
  )
}
