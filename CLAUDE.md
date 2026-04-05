# CLAUDE.md — Coach Unick 세일즈 코치

> 뷰퍼센트무브 내부 세일즈 분석 도구 전용 지시서.

---

## 1. 프로젝트 개요

- **이름**: Coach Unick 세일즈 코치
- **목적**: 카카오톡/DM 대화 캡처를 AI로 분석해 세일즈 코칭 피드백 제공
- **대상**: 뷰퍼센트무브 내부 전용 (접근코드 잠금)
- **배포**: Vercel (실서비스 운영 중)

---

## 2. 기술 스택

- **프론트엔드**: React 18 + Vite + Tailwind CSS v4
- **백엔드**: Vercel Serverless Function (`api/analyze.js`)
- **AI**: Anthropic Claude API (Sonnet) — 대화 캡처 분석
- **데이터**: `localStorage` (분석 히스토리)
- **폰트**: Pretendard (CDN)

---

## 3. 프로젝트 구조

```
├── api/
│   └── analyze.js         # Claude API — 캡처 분석 (sales-playbook 참조)
├── src/
│   ├── App.jsx            # 메인 앱 (잠금화면 + 분석 플로우)
│   ├── main.jsx           # 엔트리포인트
│   ├── index.css          # 글로벌 스타일
│   ├── components/
│   │   ├── ChatCapture.jsx       # 대화 캡처 입력 (이미지/텍스트/PDF)
│   │   ├── AnalysisResult.jsx    # AI 분석 결과 표시
│   │   └── ConversationHistory.jsx # 고객별 분석 히스토리
│   └── lib/
│       ├── api.js         # API 호출
│       └── storage.js     # localStorage 관리
├── docs/
│   ├── sales-playbook.md        # 세일즈 플레이북 (AI 프롬프트 참조)
│   ├── dm-scenarios.md          # DM 시나리오
│   ├── kakaotalk-scenarios.md   # 카톡 시나리오
│   ├── content-strategy.md      # 콘텐츠 전략
│   └── funnel-model.md          # 퍼널 모델
├── package.json
├── vercel.json
└── vite.config.js
```

---

## 4. 핵심 플로우

1. 접근코드 입력 → 잠금 해제
2. 카톡/DM 캡처 업로드 (이미지, 텍스트, PDF 지원)
3. `api/analyze.js`가 `docs/sales-playbook.md`를 참조해 Claude로 분석
4. 세일즈 코칭 피드백 결과 표시
5. 고객별 분석 히스토리 localStorage에 저장

---

## 5. 환경변수

| 변수 | 용도 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API 호출 |
| `MODEL_ID` | 사용 모델 (기본: claude-sonnet-4-20250514) |
| `PORT` | 로컬 서버 포트 (기본: 3001) |

---

## 6. 로컬 개발

```bash
npm install
npm run dev         # Vite + Express 동시 실행
npm run dev:client  # 프론트엔드만
npm run dev:server  # 백엔드만
npm run build       # 프로덕션 빌드
```

---

## 7. 주의사항

- `docs/sales-playbook.md`가 AI 분석의 핵심 — 수정 시 분석 결과에 직접 영향
- 접근코드는 프론트엔드 하드코딩 (내부 전용이라 서버 인증 미적용)
- 모바일 퍼스트 (카톡 캡처를 모바일에서 바로 업로드하는 유스케이스)
