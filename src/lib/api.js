export async function analyzeCapture(image, memo, history) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, memo, history })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '서버 오류가 발생했습니다' }))
    throw new Error(err.error)
  }

  return res.json()
}
