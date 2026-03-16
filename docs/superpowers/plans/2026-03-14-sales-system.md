# Coach Unick 세일즈 시스템 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인스타그램 기반 세일즈 퍼널 전략 문서 5종 + AI 세일즈 코치 챗봇 웹앱 구축

**Architecture:** Phase 1에서 전략 문서 5종을 작성하고, 이 중 sales-playbook.md가 Phase 2 챗봇의 AI 시스템 프롬프트로 사용됨. Phase 2는 Vite+React+Tailwind 프론트엔드 + Express 프록시 서버로 구성. Claude API 멀티모달 호출로 대화 캡처 이미지를 분석.

**Tech Stack:** Vite, React 18, Tailwind CSS, Express, @anthropic-ai/sdk, claude-sonnet-4-20250514

**Spec:** `docs/superpowers/specs/2026-03-14-sales-system-design.md`

---

## File Structure

### Phase 1: Strategy Documents
```
docs/
├── funnel-model.md            # 퍼널 3단계 모델 + 목표 역산 계산
├── content-strategy.md        # 주간 콘텐츠 캘린더 + CTA 설계
├── dm-scenarios.md            # DM 응대 분기 시나리오 전체
├── kakaotalk-scenarios.md     # 카카오톡 상담 4단계 플로우
└── sales-playbook.md          # 위 4개 통합 + AI 시스템 프롬프트용 최적화본
```

### Phase 2: Chatbot Web App
```
server.js                      # Express 프록시 (/api/analyze 엔드포인트)
src/
├── main.jsx                   # React 진입점
├── App.jsx                    # 메인 레이아웃 (2컬럼 ↔ 1컬럼 반응형)
├── components/
│   ├── ChatCapture.jsx        # 이미지 드래그&드롭 + 텍스트 메모 입력 + 분석 버튼
│   ├── AnalysisResult.jsx     # 진단 + 응대 멘트 + 다음 액션 통합 표시
│   └── ConversationHistory.jsx # 고객별 분석 히스토리 목록 + 검색
├── lib/
│   ├── api.js                 # fetch /api/analyze 래퍼
│   └── storage.js             # localStorage CRUD (고객, 분석 결과)
public/
└── index.html                 # Vite HTML 엔트리
.env.local                     # ANTHROPIC_API_KEY, MODEL_ID
package.json
vite.config.js
tailwind.config.js
```

**설계 결정:**
- `CustomerDiagnosis`, `ResponseSuggestion`, `NextAction`을 `AnalysisResult` 하나로 통합 — AI 응답이 한 번에 오므로 분리할 이유 없음
- `PlaybookViewer` 제거 — 플레이북은 AI 컨텍스트로만 사용, 별도 UI 불필요
- `prompts/` 디렉토리 제거 — `docs/sales-playbook.md`를 빌드 타임 import

---

## Chunk 1: Phase 1 — Strategy Documents

### Task 1: 퍼널 모델 문서

**Files:**
- Create: `docs/funnel-model.md`

- [ ] **Step 1: funnel-model.md 작성**

```markdown
# 퍼널 모델: 3단계 압축

## 현황 (2026-03 기준)
- 인스타 팔로워: 6,000명
- 월 DM 문의: 3~5건
- 카카오톡 전환율: 30~50% (추정)
- 계약 전환율: 20~30% (추정)

## 퍼널 3단계

### 병목1: 콘텐츠 → DM 유입
- 현재: 월 3~5건
- 목표: 월 18~22건
- 핵심 레버: 단일 키워드 CTA ("DM으로 '진단' 보내세요")
- 측정: 주간 DM 유입 수 트래킹

### 병목2: DM → 카카오톡 전환
- 현재: 30~50%
- 목표: 70%
- 핵심 레버: DM 3회 이내 카카오톡 전환
- 측정: DM 문의 중 카카오톡 전환 비율

### 병목3: 카카오톡 → 계약
- 현재: 20~30%
- 목표: 40%
- 핵심 레버: 구조화된 상담 4단계 (진단→공감→제안→클로징)
- 측정: 상담 건 중 계약 전환 비율

## 월간 목표 역산 (월 매출 2,000만원)

| 상품 | 유지 고객 | 신규 (월) | 건당 매출 | 소계 |
|------|----------|----------|----------|------|
| 광고대행 3,000만원급 | 2건 | 2건 | 300만원 | 1,200만원 |
| 월 구독 코칭 | 2건 | 1건 | 100만원 | 300만원 |
| 프로젝트 | - | 2건 | 200만원 | 400만원 |
| 1회 코칭 (리드 전환) | - | 3건 | 30만원 | 90만원 |
| **합계** | **4건** | **8건** | - | **1,990만원+α** |

핵심 신규 계약 목표: 월 5건 (1회 코칭 제외)

### 필요 활동량
- 카카오톡 상담: 월 12~15건 (계약률 40%)
- DM 문의: 월 18~22건 (카카오톡 전환률 70%)
- 콘텐츠 발행: 주 5건

## 주간 KPI 체크리스트
- [ ] 콘텐츠 5건 발행했는가?
- [ ] DM 유입 4~5건 이상인가?
- [ ] 카카오톡 전환 3건 이상인가?
- [ ] 상담 진행 2건 이상인가?
```

- [ ] **Step 2: Commit**

```bash
git add docs/funnel-model.md
git commit -m "docs: 퍼널 3단계 모델 + 월간 목표 역산"
```

---

### Task 2: 콘텐츠 전략 문서

**Files:**
- Create: `docs/content-strategy.md`

- [ ] **Step 1: content-strategy.md 작성**

```markdown
# 콘텐츠 전략: @coach_unick

## 타겟 고객 페르소나

### P1: 광고대행 타겟
- 월 광고비 1,000만원+ 집행 중인 에이블리 입점 여성의류 브랜드 대표
- 고민: ROAS 정체, 광고비 대비 효율 의문, 자체 운영 한계

### P2: 코칭 타겟
- 현 대행사에 불만족한 대표
- 고민: ROAS 안 나옴, 소통 안 됨, 데이터 공유 안 됨, 기준 없음

## 주간 콘텐츠 캘린더

| 요일 | 유형 | 목적 | 타겟 | CTA |
|------|------|------|------|-----|
| 월 | 캐러셀: 에이블리 광고 팁 | 전문성 입증 | P1 | DM "진단" |
| 화 | 릴스: 클라이언트 성과 B/A | 사회적 증거 | P1+P2 | DM "진단" |
| 수 | 스레드: 업계 인사이트 | 도달 확장 | P1+P2 | 프로필 유도 |
| 목 | 캐러셀: 대행사 선택 기준 | 코칭 니즈 자극 | P2 | DM "진단" |
| 금 | 스토리: 주간 성과 요약 | 직접 전환 | P1+P2 | DM "진단" |

## 콘텐츠 유형별 템플릿

### 캐러셀 (전환용 핵심, 5~7장)
1. 후킹: 질문 or 충격적 수치 ("에이블리 ROAS 300% 넘기는 브랜드의 공통점")
2~5. 핵심 내용: 데이터 기반, 장당 1개 포인트
6. 요약 + 저장/공유 유도
7. CTA: "DM으로 '진단' 한 글자만 보내주세요"

### 릴스 (도달 확장, 15~30초)
- 구조: 후킹(3초) → Before(5초) → After(5초) → 핵심 인사이트(10초) → CTA(5초)
- 자막 필수 (음소거 시청 대응)
- 성과 수치 화면에 크게 표시

### 스레드 (브랜딩/도달)
- 에이블리/지그재그 시장 인사이트
- CPC, ROAS 트렌드, 키워드 광고 팁
- 300자 이내, 핵심만

### 스토리 (직접 전환)
- 이번 주 운영 성과 스크린샷
- "이런 결과 원하시면 DM 주세요"
- 24시간 한정 긴급성

## CTA 설계 원칙

**단일 키워드**: "DM으로 '진단' 보내세요"
- 진입 장벽 최소화 (한 단어)
- 모든 콘텐츠에 동일 CTA → 반복 노출로 각인
- 변형: "진단", "상담", "무료" (A/B 테스트용)

## 콘텐츠 주제 뱅크

### 에이블리 광고 팁 (캐러셀용)
- 에이블리 키워드 광고 세팅 체크리스트
- CPC 낮추는 3가지 방법
- ROAS 300% 넘기는 상품 선정 기준
- 광고 예산 배분 공식 (검색 vs 디스플레이)
- 시즌별 광고 전략 (S/S, F/W 전환기)

### 대행사 선택/평가 (캐러셀용)
- 좋은 대행사 vs 나쁜 대행사 구분법
- 대행사에게 꼭 요구해야 할 데이터 5가지
- 대행사 바꿔야 할 때 시그널 3가지
- 대행 수수료 구조별 장단점

### 성과 사례 (릴스용)
- 월 매출 X배 성장 사례
- ROAS X% → Y% 개선 사례
- 광고비 최적화로 이익률 개선 사례
```

- [ ] **Step 2: Commit**

```bash
git add docs/content-strategy.md
git commit -m "docs: 콘텐츠 전략 - 주간 캘린더 + 유형별 템플릿 + CTA 설계"
```

---

### Task 3: DM 응대 시나리오

**Files:**
- Create: `docs/dm-scenarios.md`

- [ ] **Step 1: dm-scenarios.md 작성**

```markdown
# DM 응대 시나리오

## 응대 원칙
1. 두괄식: 핵심 먼저, 배경은 뒤
2. 부정어 연속 금지 ("안 되고", "못 하고" 연달아 X)
3. "꼭/무조건" 남용 금지
4. 3회 이내 카카오톡 전환 — DM에서 길게 끌지 않기
5. 질문 1개씩 — 한 번에 여러 질문 금지
6. 응답 시간: 1시간 이내 (영업시간 기준)

## 진입: "진단" 키워드 수신

### 1회차 응답 (즉시)
"""
안녕하세요! 에이블리 광고 진단에 관심 가져주셔서 감사합니다 :)
혹시 현재 에이블리에서 광고 운영 중이신가요?
"""

### 분기 A: "네, 운영 중이에요" → 대행 니즈 탐색

**2회차: 규모 파악**
"""
어떤 규모로 운영하고 계세요?
월 광고비가 대략 어느 정도인지 여쭤봐도 될까요?
"""

**3회차 분기 (광고비 기준):**

#### A-1: 월 1,000만원 이상 (고가치 리드) → 즉시 카카오톡 전환
"""
[광고비 규모] 정도면 최적화 여지가 충분히 있을 것 같아요.
지금 ROAS나 효율 면에서 아쉬운 부분이 있으실 텐데,
카카오톡에서 현재 세팅을 간단히 봐드릴 수 있어요.
편하실 때 여기로 연락 주세요 → [카카오톡 링크]
"""

#### A-2: 월 500~1,000만원 (중가치) → 1회 코칭 제안
"""
[규모]로 운영하고 계시는군요!
이 정도 규모에서 효율을 높이려면 세팅 점검이 중요한데요,
30분 정도 화상으로 현재 광고 세팅을 같이 봐드리는 코칭이 있어요.
관심 있으시면 카카오톡에서 안내드릴게요 → [카카오톡 링크]
"""

#### A-3: 월 500만원 미만 (저가치) → 콘텐츠 유도
"""
아직 초기 단계시군요! 광고비 규모를 키우기 전에
기본 세팅이 잘 되어 있는지가 중요해요.
저희 계정에 에이블리 광고 세팅 관련 콘텐츠가 있으니
참고하시면 도움 될 거예요. 궁금한 점 있으시면 언제든 DM 주세요!
"""

### 분기 B: "아니요, 아직이요" → 코칭 니즈 탐색

**2회차:**
"""
아, 그러시군요! 혹시 에이블리 입점을 준비 중이시거나,
다른 플랫폼에서 광고를 운영하고 계신 건가요?
"""

**3회차 (상황별):**

#### B-1: 에이블리 입점 준비 중
"""
에이블리 입점 초기에 광고 세팅을 잘 잡아두면
나중에 스케일업할 때 훨씬 수월해요.
초기 세팅 컨설팅을 카카오톡에서 안내드릴까요? → [카카오톡 링크]
"""

#### B-2: 다른 플랫폼 운영 중
"""
어떤 플랫폼에서 운영하고 계세요?
에이블리 확장을 고민 중이시라면
카카오톡에서 자세히 이야기 나눠볼 수 있어요 → [카카오톡 링크]
"""

### 분기 C: 기타 질문

**패턴: 가격 문의**
"""
구체적인 비용은 현재 상황에 따라 달라지는데요,
카카오톡에서 간단히 상황 여쭤보고 맞는 방향을 안내드릴게요.
→ [카카오톡 링크]
"""

**패턴: 대행사 불만 토로**
"""
그런 경험이 있으셨군요. 많은 대표님들이 비슷한 고민을 하세요.
정확한 상황을 들어봐야 방향을 잡을 수 있는데,
카카오톡에서 자세히 이야기 나눠볼까요? → [카카오톡 링크]
"""

**패턴: 단순 정보 요청**
"""
[질문에 대한 간단한 답변 1~2문장]
더 자세한 내용이 궁금하시면 카카오톡으로 편하게 물어봐주세요!
→ [카카오톡 링크]
"""

## 카카오톡 브릿지 원칙

1. 브릿지 멘트는 항상 "가치 제안 + 링크" 구조
2. "카카오톡에서 OO해드릴게요" — 상대가 얻을 가치를 명시
3. DM에서 가격 언급 절대 금지 — 카카오톡에서만
4. 링크 전에 한 줄 공백 — 클릭 유도
```

- [ ] **Step 2: Commit**

```bash
git add docs/dm-scenarios.md
git commit -m "docs: DM 응대 시나리오 - 키워드 진입 + 3개 분기 + 브릿지"
```

---

### Task 4: 카카오톡 상담 시나리오

**Files:**
- Create: `docs/kakaotalk-scenarios.md`

- [ ] **Step 1: kakaotalk-scenarios.md 작성**

```markdown
# 카카오톡 상담 시나리오

## 상담 4단계 (총 15~20분)

### 1단계: 현황 진단 (5분)

**오프닝:**
"""
안녕하세요! DM에서 연락 주셔서 감사합니다.
바로 본론으로 들어갈게요. 현재 상황을 좀 여쭤볼게요.
"""

**진단 질문 3개 (순서대로, 1개씩):**

Q1: "현재 에이블리 월 매출이 어느 정도 되세요?"
Q2: "광고비는 월 얼마 정도 집행하고 계세요?"
Q3: "현재 ROAS가 어떻게 나오고 있나요?"

> 질문 사이에 상대 답변을 요약 반복해서 경청 표현
> "아, 월 [X]만원 정도 매출에 광고비 [Y]만원이시군요."

### 2단계: 문제 공감 + 데이터 제시 (5분)

**공감 (상황별):**

#### 대행사 불만형
"""
[구체적 불만 내용] 때문에 고민이 많으셨겠어요.
사실 그 부분은 대행사 선택 기준에서 가장 중요한 포인트인데요.
"""

#### ROAS 정체형
"""
ROAS [X]%면 광고비 대비 효율이 아쉬우신 거죠.
같은 카테고리 브랜드들 평균이 [Y]% 정도인데,
세팅 최적화만으로도 [Z]%까지 개선된 사례가 있어요.
"""

#### 자체 운영 한계형
"""
직접 운영하시면서 많이 고민되셨을 거예요.
광고비 [X]만원 규모부터는 전문 운영이 효율이 훨씬 좋아요.
비슷한 규모에서 대행 전환 후 ROAS [Y]% 개선된 케이스가 있었어요.
"""

> **필수**: 반드시 구체적 수치 제시. "잘할 수 있어요" 같은 모호한 표현 금지.

### 3단계: 맞춤 제안 (5분)

**고객 유형별 제안 로직:**

| 월 광고비 | 1순위 제안 | 프레이밍 |
|----------|----------|---------|
| 3,000만+ | 광고대행 | "현재 대비 ROAS X% 개선 목표로 운영해드리겠습니다" |
| 1,000~3,000만 | 1회 코칭 → 대행 전환 | "먼저 현재 세팅을 진단하고, 방향이 맞으면 대행으로 전환" |
| 1,000만 미만 | 1회 코칭 or 월구독 | "효율부터 올리고 광고비를 점진적으로 늘려가는 방향" |
| 대행사 불만 | 1회 코칭 → 대행 전환 | "기준을 먼저 세우고, 맞는 대행사를 선택하거나 저희가 운영" |

**가격 제시 방식:**

광고대행:
"""
광고 운영 대행은 월 집행비의 10% 수수료 구조예요.
월 [X]만원 집행 기준이면 수수료 [Y]만원이고,
ROAS 개선으로 수수료 이상의 추가 매출이 발생하는 구조입니다.
"""

1회 코칭:
"""
30분 화상 미팅으로 현재 광고 세팅을 같이 보면서
개선 포인트를 잡아드려요. 속기록도 제공해서
미팅 후에도 참고하실 수 있어요.
비용은 30만원(부가세 별도)입니다.
"""

월 구독 코칭:
"""
월 1회 정기 미팅 + 수시 카톡 컨설팅으로
지속적으로 광고 성과를 관리해드려요.
월 100만원 기본에, 매출 증분에 대한 인센티브 구조입니다.
"""

### 4단계: 클로징 (3~5분)

**일정 확정 프레이밍:**
"""
그러면 [다음 주 X요일]부터 시작하는 걸로 진행할까요?
"""

> 핵심: "가격 어떠세요?"가 아니라 "언제 시작할까요?"

**"생각해볼게요" 대응:**
"""
그럼 [이번 주 X요일]까지 결정해주시면
첫 달 세팅비 면제로 진행해드릴게요.
결정하시기 전에 궁금한 점 있으시면 편하게 물어봐주세요!
"""

**"비싸요" 대응:**
"""
비용 대비 효과 면에서 보시면,
현재 ROAS [X]%에서 [Y]%로 개선되면
추가 매출이 월 [Z]만원 정도 발생하는 거거든요.
수수료 [W]만원 대비 충분히 ROI가 나오는 구조예요.
"""

**"다른 곳도 알아볼게요" 대응:**
"""
다른 곳도 알아보시는 거 좋습니다!
비교하실 때 꼭 확인하셔야 할 포인트가 있는데요:
1. 에이블리 전문 운영 경험이 있는지
2. 주간 리포트와 실시간 데이터 공유를 해주는지
3. 수수료 외 숨은 비용이 없는지
이 세 가지만 체크하시면 좋은 선택 하실 수 있을 거예요.
"""

## 업셀 타이밍

| 현재 상품 | 업셀 시점 | 제안 상품 | 멘트 |
|----------|----------|----------|------|
| 1회 코칭 | 코칭 완료 직후 | 월구독 or 대행 | "오늘 잡은 방향대로 실행하려면 지속 관리가 효과적" |
| 대행 | 계약 2개월 차 | 코칭 추가 | "광고만으로는 한계가 있어요, 브랜딩도 같이 잡으면" |
| 월구독 코칭 | 성과 확인 후 | 대행 전환 | "전략은 잡혔으니 실행은 저희가 맡아서" |
| 프로젝트 | 프로젝트 완료 시 | 대행 or 월구독 | "이번 프로젝트 결과를 계속 유지하려면" |
```

- [ ] **Step 2: Commit**

```bash
git add docs/kakaotalk-scenarios.md
git commit -m "docs: 카카오톡 상담 4단계 시나리오 + 업셀 타이밍"
```

---

### Task 5: 세일즈 플레이북 (AI 시스템 프롬프트용)

**Files:**
- Create: `docs/sales-playbook.md`

- [ ] **Step 1: sales-playbook.md 작성**

이 파일은 위 4개 문서의 핵심을 AI 시스템 프롬프트에 최적화한 통합본.
Claude API의 system 파라미터에 그대로 주입됨.

```markdown
# 세일즈 코치 AI 플레이북

당신은 뷰퍼센트무브(ViewPercent Move) 대표 유코치의 세일즈 코치 AI입니다.
에이블리 공식 광고대행사로서 여성의류 브랜드 대표를 대상으로 영업합니다.

## 당신의 역할
고객과의 대화 캡처(스크린샷)를 분석하고, 최적의 응대 전략을 추천합니다.

## 상품 라인
- 광고대행: 월 집행비의 10% 수수료 (타겟: 월 광고비 1,000만원+)
- 1회 코칭: 30만원(+VAT), 화상미팅+속기록 (리드 전환용)
- 월 구독 코칭: 월 100만원 + 매출증분 인센티브
- 프로젝트: 100~300만원+ (과업 규모별)

## 고객 분석 프레임워크

### 예산 규모 판단
- 월 광고비 3,000만원+ → 고가치 (광고대행 우선 제안)
- 월 광고비 1,000~3,000만원 → 중가치 (코칭→대행 전환)
- 월 광고비 500~1,000만원 → 중저가치 (1회 코칭 제안)
- 월 광고비 500만원 미만 → 저가치 (콘텐츠 유도)

### 불만 유형 분류
- ROAS 불만: 광고 효율이 안 나옴 → 데이터 기반 개선 제안
- 소통 불만: 대행사와 소통이 안 됨 → 주간 리포트/실시간 공유 강조
- 데이터 불만: 데이터를 안 보여줌 → 투명한 데이터 공유 강조
- 비용 불만: 수수료 대비 성과 의문 → ROI 계산으로 설득
- 없음/초기: 아직 구체적 불만 없음 → 진단으로 니즈 발굴

### 구매 의향 단계
- 초기탐색: 정보 수집 중, 아직 구체적 니즈 없음 → 교육/콘텐츠 제공
- 비교검토: 여러 옵션 비교 중 → 차별점 강조, 사례 제시
- 결정직전: 거의 결정, 마지막 확인 → 일정 확정, 인센티브 제시

## 응답 형식

반드시 아래 JSON 형식으로 응답하세요:

```json
{
  "diagnosis": {
    "estimatedBudget": "월 광고비 추정 (예: 월 2,000만원)",
    "painType": "불만 유형 (ROAS/소통/데이터/비용/없음)",
    "buyingStage": "구매 단계 (초기탐색/비교검토/결정직전)",
    "expectedValue": "예상 객단가 (예: 대행 200만 + 코칭 30만)",
    "confidence": "진단 확신도 (높음/중간/낮음)",
    "reasoning": "판단 근거 1~2문장"
  },
  "responses": {
    "soft": "부드러운 톤 응대 멘트 (공감 중심, 2~3문장)",
    "professional": "전문적 톤 응대 멘트 (데이터/논리 중심, 2~3문장)",
    "closing": "클로징 톤 응대 멘트 (행동 유도, 1~2문장)"
  },
  "nextActions": {
    "primary": "1순위 액션 (예: 카카오톡에서 무료 진단 제안)",
    "secondary": "2순위 액션 (예: 1회 코칭 30만원 제안)",
    "warning": "주의사항 (예: 가격 먼저 언급하지 말 것)"
  },
  "upsellTiming": "업셀 가능 여부와 타이밍 (예: 1회 코칭 후 대행 전환 제안)"
}
```

## 응대 멘트 규칙
1. 두괄식: 핵심 제안을 먼저, 배경은 뒤에
2. 부정어 연속 사용 금지 (특히 서두와 마무리에)
3. "꼭/무조건" 남용 금지
4. 상대 상황에 맞는 개인화된 메시지
5. 톤이 갑자기 높아지지 않게 자연스럽게
6. 에이블리/여성의류 시장의 구체적 용어 사용 (CPC, ROAS, 키워드광고 등)
7. DM 대화 중이면: 3회 이내 카카오톡 전환 유도
8. 카카오톡 대화 중이면: 4단계 상담 플로우 따라 진행

## 퍼널 위치 판단
- DM 대화: 병목2(카카오톡 전환) 해결에 집중
- 카카오톡 대화: 병목3(계약 전환) 해결에 집중
- 알 수 없는 채널: 대화 내용으로 추론

## 주의사항
- 이미지에서 대화 내용을 읽을 수 없으면 솔직히 말하기
- 추측이 많으면 confidence를 "낮음"으로 설정
- 고객의 개인정보(전화번호 등)가 보이면 언급하지 않기
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales-playbook.md
git commit -m "docs: 세일즈 플레이북 - AI 시스템 프롬프트용 통합본"
```

---

## Chunk 2: Phase 2 — Chatbot Web App Setup

### Task 6: 프로젝트 초기 셋업

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `public/index.html`
- Create: `src/main.jsx`
- Create: `.env.local`
- Create: `.gitignore`

- [ ] **Step 1: package.json 생성**

```json
{
  "name": "coach-unick-sales-system",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"node server.js\" \"vite\"",
    "dev:client": "vite",
    "dev:server": "node server.js",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "concurrently": "^9.1.2",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: vite.config.js 생성**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

- [ ] **Step 3: tailwind.config.js 생성**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 4: public/index.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coach Unick 세일즈 코치</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 5: src/main.jsx 생성**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 6: src/index.css 생성**

```css
@import "tailwindcss";

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

- [ ] **Step 7: .env.local 생성**

```
ANTHROPIC_API_KEY=your-api-key-here
MODEL_ID=claude-sonnet-4-20250514
PORT=3001
```

- [ ] **Step 8: .gitignore 생성**

```
node_modules/
dist/
.env.local
.env
```

- [ ] **Step 9: npm install 실행**

Run: `npm install`
Expected: 의존성 설치 완료, node_modules 생성

- [ ] **Step 10: Commit**

```bash
git add package.json vite.config.js tailwind.config.js public/index.html src/main.jsx src/index.css .gitignore
git commit -m "chore: 프로젝트 초기 셋업 - Vite + React + Tailwind + Express"
```

---

### Task 7: Express 프록시 서버

**Files:**
- Create: `server.js`

- [ ] **Step 1: server.js 작성**

```javascript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '20mb' }))

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 플레이북을 파일에서 로딩
const playbook = readFileSync(join(__dirname, 'docs', 'sales-playbook.md'), 'utf-8')

app.post('/api/analyze', async (req, res) => {
  try {
    const { image, memo, history } = req.body

    if (!image) {
      return res.status(400).json({ error: '이미지가 필요합니다' })
    }

    const userContent = []

    // 이미지 추가
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.mediaType || 'image/png',
        data: image.data
      }
    })

    // 메모 추가
    let textPrompt = '위 대화 캡처를 분석하고, 플레이북에 따라 JSON 형식으로 응답해주세요.'
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

    // JSON 파싱 시도
    let parsed
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
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
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

- [ ] **Step 2: 서버 시작 테스트**

Run: `node server.js`
Expected: "Server running on http://localhost:3001" 출력

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: Express 프록시 서버 - Claude API 멀티모달 엔드포인트"
```

---

## Chunk 3: Phase 2 — React Components

### Task 8: App.jsx 메인 레이아웃

**Files:**
- Create: `src/App.jsx`

- [ ] **Step 1: App.jsx 작성**

```jsx
import { useState } from 'react'
import ChatCapture from './components/ChatCapture'
import AnalysisResult from './components/AnalysisResult'
import ConversationHistory from './components/ConversationHistory'
import { analyzeCapture } from './lib/api'
import { saveAnalysis, getCustomerAnalyses } from './lib/storage'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const handleAnalyze = async (image, memo, customerName) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 이전 히스토리 컨텍스트 구성
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

      // 저장
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">
          Coach Unick 세일즈 코치
        </h1>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 왼쪽: 입력 */}
          <ChatCapture
            onAnalyze={handleAnalyze}
            loading={loading}
          />

          {/* 오른쪽: 결과 */}
          <AnalysisResult
            result={result}
            loading={loading}
            error={error}
          />
        </div>

        {/* 하단: 히스토리 */}
        <ConversationHistory
          onSelect={(customer) => setSelectedCustomer(customer)}
        />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: App.jsx 메인 레이아웃 - 2컬럼 반응형"
```

---

### Task 9: ChatCapture 컴포넌트

**Files:**
- Create: `src/components/ChatCapture.jsx`

- [ ] **Step 1: ChatCapture.jsx 작성**

```jsx
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

    // 10MB 제한
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하로 올려주세요.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      setPreview(dataUrl)

      // base64 데이터 추출
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type
      setImage({ data: base64, mediaType })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        processFile(file)
        break
      }
    }
  }, [processFile])

  const handleSubmit = () => {
    if (!image) return
    onAnalyze(image, memo, customerName)
  }

  const handleClear = () => {
    setImage(null)
    setPreview(null)
    setMemo('')
    setCustomerName('')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* 고객명 */}
      <input
        type="text"
        placeholder="고객명 / 브랜드명 (선택)"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 이미지 업로드 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        onClick={() => !preview && fileRef.current?.click()}
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

      {/* 메모 */}
      <textarea
        placeholder="추가 메모 (선택) — 예: 현재 타 대행사 사용 중, 월 광고비 2천만원"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 분석 버튼 */}
      <button
        onClick={handleSubmit}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChatCapture.jsx
git commit -m "feat: ChatCapture - 이미지 업로드 (드래그/붙여넣기/클릭)"
```

---

### Task 10: AnalysisResult 컴포넌트

**Files:**
- Create: `src/components/AnalysisResult.jsx`

- [ ] **Step 1: AnalysisResult.jsx 작성**

```jsx
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
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
        고객 진단
      </h3>
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
    { key: 'soft', label: '부드러운', color: 'blue' },
    { key: 'professional', label: '전문적', color: 'purple' },
    { key: 'closing', label: '클로징', color: 'orange' }
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
        <p className="whitespace-pre-wrap">{activeResponse}</p>
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
          <span className="text-blue-600 font-bold text-xs mt-0.5">1순위</span>
          <p>{nextActions.primary}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 font-bold text-xs mt-0.5">2순위</span>
          <p>{nextActions.secondary}</p>
        </div>
        {nextActions.warning && (
          <div className="flex items-start gap-2 bg-red-50 rounded p-2">
            <span className="text-red-500 text-xs mt-0.5 font-bold">주의</span>
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

export default function AnalysisResult({ result, loading, error }) {
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

  // JSON 파싱 실패 시 raw 텍스트 표시
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnalysisResult.jsx
git commit -m "feat: AnalysisResult - 진단/응대/액션 통합 표시 + 복사 기능"
```

---

### Task 11: ConversationHistory 컴포넌트

**Files:**
- Create: `src/components/ConversationHistory.jsx`

- [ ] **Step 1: ConversationHistory.jsx 작성**

```jsx
import { useState, useMemo } from 'react'
import { getAllCustomers, getCustomerAnalyses, deleteCustomer } from './lib/../lib/storage'

export default function ConversationHistory({ onSelect }) {
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
    return null // 데이터 없으면 숨김
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
                  {new Date(customer.lastAnalysis).toLocaleDateString('ko-KR')}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConversationHistory.jsx
git commit -m "feat: ConversationHistory - 고객별 분석 히스토리 + 검색/삭제"
```

---

## Chunk 4: Phase 2 — Lib & Integration

### Task 12: API 클라이언트

**Files:**
- Create: `src/lib/api.js`

- [ ] **Step 1: api.js 작성**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/api.js
git commit -m "feat: API 클라이언트 - /api/analyze 래퍼"
```

---

### Task 13: Storage 유틸리티

**Files:**
- Create: `src/lib/storage.js`

- [ ] **Step 1: storage.js 작성**

```javascript
const STORAGE_KEY = 'coach-unick-customers'
const MAX_ANALYSES_PER_CUSTOMER = 20

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // localStorage 가득 찬 경우: 가장 오래된 고객 데이터 정리
    if (e.name === 'QuotaExceededError') {
      const cleaned = cleanOldData(data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    }
  }
}

function cleanOldData(data) {
  const entries = Object.entries(data)
  if (entries.length === 0) return data

  // 가장 오래된 분석을 가진 고객부터 정리
  entries.sort((a, b) => {
    const aLast = a[1].analyses?.[0]?.timestamp || 0
    const bLast = b[1].analyses?.[0]?.timestamp || 0
    return new Date(aLast) - new Date(bLast)
  })

  // 가장 오래된 고객의 분석 절반 삭제
  const oldest = entries[0]
  if (oldest[1].analyses) {
    oldest[1].analyses = oldest[1].analyses.slice(Math.floor(oldest[1].analyses.length / 2))
  }

  return Object.fromEntries(entries)
}

export function saveAnalysis(customerName, analysis) {
  const data = loadData()

  if (!data[customerName]) {
    data[customerName] = {
      name: customerName,
      stage: 'dm',
      analyses: []
    }
  }

  data[customerName].analyses.push({
    ...analysis,
    timestamp: new Date().toISOString()
  })

  // 최대 개수 제한
  if (data[customerName].analyses.length > MAX_ANALYSES_PER_CUSTOMER) {
    data[customerName].analyses = data[customerName].analyses.slice(-MAX_ANALYSES_PER_CUSTOMER)
  }

  saveData(data)
}

export function getCustomerAnalyses(customerName) {
  const data = loadData()
  return data[customerName]?.analyses || []
}

export function getAllCustomers() {
  const data = loadData()
  return Object.values(data).map(customer => ({
    name: customer.name,
    stage: customer.stage,
    analysisCount: customer.analyses?.length || 0,
    lastAnalysis: customer.analyses?.slice(-1)[0]?.timestamp || null
  })).sort((a, b) => new Date(b.lastAnalysis || 0) - new Date(a.lastAnalysis || 0))
}

export function deleteCustomer(customerName) {
  const data = loadData()
  delete data[customerName]
  saveData(data)
}

export function updateCustomerStage(customerName, stage) {
  const data = loadData()
  if (data[customerName]) {
    data[customerName].stage = stage
    saveData(data)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/storage.js
git commit -m "feat: storage - localStorage CRUD + 용량 관리"
```

---

### Task 14: launch.json 설정 + 통합 테스트

**Files:**
- Create: `.claude/launch.json`

- [ ] **Step 1: launch.json 작성**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "sales-coach",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 2: 전체 앱 시작 테스트**

Run: `npm run dev`
Expected:
- Express 서버: http://localhost:3001 에서 실행
- Vite 개발서버: http://localhost:5173 에서 실행
- 브라우저에서 UI 확인

- [ ] **Step 3: 이미지 업로드 → 분석 흐름 테스트**

1. 브라우저에서 http://localhost:5173 열기
2. 대화 캡처 이미지 드래그 & 드롭
3. 메모 입력 (선택)
4. "분석하기" 클릭
5. 결과 JSON 파싱 + UI 표시 확인

- [ ] **Step 4: Commit**

```bash
git add .claude/launch.json
git commit -m "chore: launch.json 개발 서버 설정"
```

---

### Task 15: 최종 정리 + Phase 완료 커밋

- [ ] **Step 1: 전체 파일 확인**

Run: `git status`
Expected: 추적되지 않은 파일 없음

- [ ] **Step 2: README는 작성하지 않음** (CLAUDE.md 규칙)

- [ ] **Step 3: 태그 생성**

```bash
git tag v0.1.0 -m "Phase 1+2 완료: 전략 문서 + 챗봇 웹앱"
```
