import { nextId } from "@/lib/id";
import { generateTemplates } from "@/lib/ai/templates";
import { generateHookIdeas } from "@/lib/ai/hooks";
import { generateMarketingSuggestions } from "@/lib/ai/marketing";
import { generateDraft } from "@/lib/ai/draft";
import type {
  BrandGuide,
  CalendarItem,
  ContentMetric,
  PlatformConnection,
  Project,
  Reference,
} from "@/lib/types";

interface Database {
  projects: Project[];
  references: Reference[];
  brandGuide: BrandGuide;
  calendarItems: CalendarItem[];
  metrics: ContentMetric[];
  platformConnection: PlatformConnection;
}

declare global {
  // eslint-disable-next-line no-var
  var __aiShortformDb: Database | undefined;
}

function buildSeedProject(): Project {
  const goal = "판매" as const;
  const tone = "발랄" as const;
  const targetLength = 10 as const;
  const templates = generateTemplates({ goal, tone, targetLength });
  const selectedTemplate = templates[0];
  const hookIdeas = generateHookIdeas({ goal, tone, targetLength });
  const selectedHook = hookIdeas[0];
  const draft = generateDraft(selectedTemplate, selectedHook.text);
  const marketing = generateMarketingSuggestions({ goal, productName: "비즈 목걸이" });
  const now = new Date().toISOString();

  return {
    id: nextId("proj"),
    name: "비즈 목걸이 신상 홍보",
    description: "여름 신상 비즈 목걸이, 파스텔 컬러 3종 출시",
    goal,
    tone,
    targetLength,
    sourceFiles: [
      { name: "necklace_main.jpg", kind: "photo" },
      { name: "making_process.mp4", kind: "video" },
    ],
    status: "수정중",
    templates,
    selectedTemplateId: selectedTemplate.id,
    draft,
    hookIdeas,
    selectedHookId: selectedHook.id,
    marketing,
    feedback: [],
    createdAt: now,
    updatedAt: now,
  };
}

function buildSeedMetrics(): ContentMetric[] {
  const platforms = ["틱톡", "릴스", "쇼츠"] as const;
  const hookTypes = ["비포&애프터", "질문형 오프닝", "클로즈업 반전", "POV 시점", "타임랩스"];
  const moods = ["감성", "정보", "유머"] as const;
  const titles = [
    "비즈 목걸이 OOTD",
    "여름 팔찌 신상",
    "키링 제작 과정",
    "귀걸이 클로즈업",
    "반지 비포&애프터",
    "주문 제작 후기",
    "원데이클래스 비하인드",
    "패키지 언박싱",
    "신상 컬러 공개",
    "고객 후기 모음",
    "제작 타임랩스",
    "선물 포장 꿀팁",
  ];

  const metrics: ContentMetric[] = [];
  const today = new Date();
  for (let i = 0; i < titles.length; i++) {
    const daysAgo = i * 3 + 1;
    const publishedAt = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const baseViews = 1200 + ((i * 733) % 9000);
    metrics.push({
      id: nextId("metric"),
      projectName: titles[i],
      platform: platforms[i % platforms.length],
      publishedAt,
      views: baseViews,
      likes: Math.round(baseViews * 0.08),
      comments: Math.round(baseViews * 0.01),
      shares: Math.round(baseViews * 0.02),
      saves: Math.round(baseViews * 0.015),
      reach: Math.round(baseViews * 1.4),
      hookType: hookTypes[i % hookTypes.length],
      templateMood: moods[i % moods.length],
    });
  }
  return metrics;
}

function buildSeedCalendar(): CalendarItem[] {
  const now = new Date();
  const items: Omit<CalendarItem, "id" | "createdAt">[] = [
    {
      topic: "여름 신상 비즈 목걸이 티저",
      keyMessage: "파스텔 컬러 3종, 한정 수량",
      hookCandidates: ["이 색 조합 처음 보셨죠?", "여름 한정, 재입고 없어요"],
      storyboardNotes: "컷1 클로즈업 -> 컷2 착용샷 -> 컷3 CTA",
      requiredSources: "목걸이 3종 사진, 착용 영상",
      status: "아이디어",
      scheduledDate: new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10),
      platform: "틱톡",
    },
    {
      topic: "제작 과정 비하인드",
      keyMessage: "한 땀 한 땀 핸드메이드 과정 강조",
      hookCandidates: ["이렇게 만들어지는지 몰랐죠?"],
      storyboardNotes: "타임랩스 + 자막 설명",
      requiredSources: "제작 과정 영상",
      status: "제작중",
      scheduledDate: new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10),
      platform: "릴스",
    },
    {
      topic: "고객 후기 모음",
      keyMessage: "실제 구매 후기로 신뢰도 강조",
      hookCandidates: ["진짜 후기만 모았어요"],
      storyboardNotes: "후기 캡처 + 보이스오버",
      requiredSources: "후기 스크린샷",
      status: "게시완료",
      scheduledDate: new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10),
      platform: "쇼츠",
    },
  ];

  return items.map((item) => ({
    ...item,
    id: nextId("cal"),
    createdAt: new Date().toISOString(),
  }));
}

function buildSeedReferences(): Reference[] {
  const now = new Date().toISOString();
  return [
    {
      id: nextId("ref"),
      type: "url",
      value: "https://www.tiktok.com/@example/video/1",
      note: "오프닝 훅이 강렬해서 따라하고 싶음",
      excluded: false,
      createdAt: now,
    },
    {
      id: nextId("ref"),
      type: "upload",
      value: "이전_인기영상.mp4",
      note: "BGM과 전환 타이밍이 좋았던 레퍼런스",
      excluded: false,
      createdAt: now,
    },
  ];
}

function createSeedDb(): Database {
  return {
    projects: [buildSeedProject()],
    references: buildSeedReferences(),
    brandGuide: {
      toneKeywords: ["따뜻한", "감성적인", "수공예의 정성"],
      bannedExpressions: ["대박할인", "광고 느낌 과한 표현"],
      preferredColors: ["파스텔 핑크", "베이지", "라벤더"],
      brandPhrases: ["한 땀 한 땀 정성을 담아"],
    },
    calendarItems: buildSeedCalendar(),
    metrics: buildSeedMetrics(),
    platformConnection: { platform: "틱톡", connected: true, connectedAt: new Date().toISOString() },
  };
}

function getDb(): Database {
  if (!globalThis.__aiShortformDb) {
    globalThis.__aiShortformDb = createSeedDb();
  }
  return globalThis.__aiShortformDb;
}

// Projects
export function listProjects(): Project[] {
  return [...getDb().projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getProject(id: string): Project | undefined {
  return getDb().projects.find((p) => p.id === id);
}

export function addProject(project: Project): void {
  getDb().projects.unshift(project);
}

export function updateProject(id: string, patch: Partial<Project>): Project | undefined {
  const db = getDb();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.projects[idx] = { ...db.projects[idx], ...patch, updatedAt: new Date().toISOString() };
  return db.projects[idx];
}

// References
export function listReferences(): Reference[] {
  return getDb().references;
}

export function addReference(ref: Reference): void {
  getDb().references.unshift(ref);
}

export function updateReference(id: string, patch: Partial<Reference>): void {
  const db = getDb();
  const idx = db.references.findIndex((r) => r.id === id);
  if (idx !== -1) db.references[idx] = { ...db.references[idx], ...patch };
}

export function deleteReference(id: string): void {
  const db = getDb();
  db.references = db.references.filter((r) => r.id !== id);
}

export function resetLearningData(): void {
  const db = getDb();
  db.references = [];
  db.brandGuide = { toneKeywords: [], bannedExpressions: [], preferredColors: [], brandPhrases: [] };
  for (const project of db.projects) {
    project.feedback = [];
  }
}

// Brand guide
export function getBrandGuide(): BrandGuide {
  return getDb().brandGuide;
}

export function updateBrandGuide(guide: BrandGuide): void {
  getDb().brandGuide = guide;
}

// Calendar
export function listCalendarItems(): CalendarItem[] {
  return [...getDb().calendarItems].sort((a, b) => (a.scheduledDate < b.scheduledDate ? -1 : 1));
}

export function getCalendarItem(id: string): CalendarItem | undefined {
  return getDb().calendarItems.find((c) => c.id === id);
}

export function addCalendarItem(item: CalendarItem): void {
  getDb().calendarItems.unshift(item);
}

export function updateCalendarItem(id: string, patch: Partial<CalendarItem>): void {
  const db = getDb();
  const idx = db.calendarItems.findIndex((c) => c.id === id);
  if (idx !== -1) db.calendarItems[idx] = { ...db.calendarItems[idx], ...patch };
}

export function deleteCalendarItem(id: string): void {
  const db = getDb();
  db.calendarItems = db.calendarItems.filter((c) => c.id !== id);
}

// Metrics & platform connection
export function listMetrics(): ContentMetric[] {
  return getDb().metrics;
}

export function getPlatformConnection(): PlatformConnection {
  return getDb().platformConnection;
}

export function setPlatformConnection(connected: boolean): void {
  getDb().platformConnection = {
    platform: "틱톡",
    connected,
    connectedAt: connected ? new Date().toISOString() : undefined,
  };
}
