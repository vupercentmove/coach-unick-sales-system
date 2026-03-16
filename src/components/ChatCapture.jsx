import { useState, useRef, useCallback } from 'react'

export default function ChatCapture({ onAnalyze, loading }) {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [memo, setMemo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return

    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하로 올려주세요.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      setPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      setImage({ data: base64, mediaType: file.type })
    }
    reader.readAsDataURL(file)
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
    setImage(null)
    setPreview(null)
    setMemo('')
    setCustomerName('')
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
        onClick={() => !preview && fileRef.current?.click()}
        tabIndex={0}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors min-h-[200px] flex items-center justify-center
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${preview ? 'cursor-default' : ''}
        `}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="대화 캡처" className="max-h-[400px] rounded" />
            <button
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
            >
              X
            </button>
          </div>
        ) : (
          <div className="text-gray-500">
            <p className="text-sm font-medium">대화 캡처를 올려주세요</p>
            <p className="text-xs mt-1">드래그 & 드롭, 클릭, 또는 Ctrl+V</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
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
        onClick={() => image && onAnalyze(image, memo, customerName)}
        disabled={!image || loading}
        className={`
          w-full py-2.5 rounded-lg font-medium text-sm transition-colors
          ${image && !loading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
        `}
      >
        {loading ? '분석 중...' : '분석하기'}
      </button>
    </div>
  )
}
