import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const playbook = readFileSync(join(__dirname, '..', 'docs', 'sales-playbook.md'), 'utf-8')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, memo, history } = req.body

    if (!image) {
      return res.status(400).json({ error: '파일이 필요합니다' })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const userContent = []

    if (image.type === 'text') {
      userContent.push({
        type: 'text',
        text: `[파일: ${image.fileName || '텍스트파일'}]\n\n${image.content}`
      })
    } else if (image.type === 'document') {
      userContent.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: image.mediaType || 'application/pdf',
          data: image.data
        }
      })
    } else {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mediaType || 'image/png',
          data: image.data
        }
      })
    }

    let textPrompt = '위 대화 내용을 분석하고, 플레이북에 따라 JSON 형식으로 응답해주세요.'
    if (memo) {
      textPrompt += `\n\n추가 컨텍스트: ${memo}`
    }
    if (history) {
      textPrompt += `\n\n이전 대화 히스토리:\n${history}`
    }
    userContent.push({ type: 'text', text: textPrompt })

    const response = await client.messages.create({
      model: process.env.MODEL_ID || 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: playbook,
      messages: [{ role: 'user', content: userContent }]
    })

    const text = response.content[0].text

    let parsed
    try {
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (codeBlockMatch) {
        parsed = JSON.parse(codeBlockMatch[1])
      } else {
        const start = text.indexOf('{')
        if (start !== -1) {
          let depth = 0
          let end = start
          for (let i = start; i < text.length; i++) {
            if (text[i] === '{') depth++
            else if (text[i] === '}') depth--
            if (depth === 0) { end = i; break }
          }
          parsed = JSON.parse(text.substring(start, end + 1))
        }
      }
    } catch {
      parsed = null
    }

    res.json({
      raw: text,
      parsed,
      usage: response.usage
    })
  } catch (error) {
    console.error('Analysis error:', error.message)
    res.status(500).json({ error: '분석에 실패했습니다. 다시 시도해주세요.' })
  }
}
