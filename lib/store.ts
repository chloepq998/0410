import { cache } from "react";
import { get, put } from "@vercel/blob";
import { nextId } from "@/lib/id";
import { generateTemplates } from "@/lib/ai/templates";
import { generateHookIdeas } from "@/lib/ai/hooks";
import { generateMarketingSuggestions } from "@/lib/ai/marketing";
import { generateDraft } from "@/lib/ai/draft";
import { generateHighlightCandidates } from "@/lib/ai/highlights";
import type {
  BrandGuide,
  CalendarItem,
  ContentMetric,
  PlatformConnection,
  Project,
  Reference,
  SourceMedia,
} from "@/lib/types";

interface Database {
  projects: Project[];
  references: Reference[];
  brandGuide: BrandGuide;
  calendarItems: CalendarItem[];
  metrics: ContentMetric[];
  platformConnection: PlatformConnection;
  sources: SourceMedia[];
}

declare global {
  var __aiShortformDb: Database | undefined;
}

// On Vercel, each request can land on a different (or freshly cold-started)
// serverless instance, so a plain `globalThis` object isn't shared across
// requests. When a Blob store is connected (BLOB_READ_WRITE_TOKEN is set),
// persist the whole DB as a single JSON blob so state survives across
// instances. Without a token (e.g. local `next dev`), fall back to the
// previous in-memory-only behavior.
const DB_PATHNAME = "ai-shortform-db.json";
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function buildSeedProject(): Project {
  const goal = "판매" as const;
  const tone = "발랄" as const;
  const targetLength = 30 as const;
  const templates = generateTemplates({ goal, tone, targetLength });
  const selectedTemplate = templates[0];
  const hookIdeas = generateHookIdeas({ goal, tone, targetLength });
  const selectedHook = hookIdeas[0];
  const draft = generateDraft(selectedTemplate, selectedHook.text);
  const marketing = generateMarketingSuggestions({ goal, productName: "비즈 목걸이" });
  const now = new Date().toISOString();
  const highlightCandidates = generateHighlightCandidates(660, targetLength);
  const firstCandidate = highlightCandidates[0];

  return {
    id: nextId("proj"),
    name: "비즈 목걸이 신상 홍보",
    description: "여름 신상 비즈 목걸이, 파스텔 컬러 3종 출시",
    goal,
    tone,
    targetLength,
    sourceFiles: [
      { name: "necklace_main.jpg", kind: "photo" },
      { name: "making_process.mp4", kind: "video", durationSec: 660 },
    ],
    status: "수정중",
    templates,
    selectedTemplateId: selectedTemplate.id,
    draft,
    hookIdeas,
    selectedHookId: selectedHook.id,
    marketing,
    feedback: [],
    highlightCandidates,
    highlight: {
      sourceIndex: 1,
      candidateId: firstCandidate.id,
      start: firstCandidate.start,
      end: firstCandidate.end,
    },
    versions: [],
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
    sources: [],
  };
}

async function readBlobDb(): Promise<Database | undefined> {
  const result = await get(DB_PATHNAME, { access: "private" });
  if (!result) return undefined;
  const text = await new Response(result.stream).text();
  return JSON.parse(text) as Database;
}

async function writeBlobDb(db: Database): Promise<void> {
  await put(DB_PATHNAME, JSON.stringify(db), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// Memoized per request (React's cache scope), so multiple store calls within
// the same render/action share one DB fetch instead of refetching repeatedly.
const loadDb = cache(async (): Promise<Database> => {
  if (!USE_BLOB) {
    if (!globalThis.__aiShortformDb) {
      globalThis.__aiShortformDb = createSeedDb();
    }
    return globalThis.__aiShortformDb;
  }

  const existing = await readBlobDb();
  if (existing) {
    existing.sources ??= [];
    return existing;
  }

  const seeded = createSeedDb();
  await writeBlobDb(seeded);
  return seeded;
});

async function persist(db: Database): Promise<void> {
  if (USE_BLOB) {
    await writeBlobDb(db);
  }
}

// Projects
export async function listProjects(): Promise<Project[]> {
  const db = await loadDb();
  return [...db.projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await loadDb();
  return db.projects.find((p) => p.id === id);
}

export async function addProject(project: Project): Promise<void> {
  const db = await loadDb();
  db.projects.unshift(project);
  await persist(db);
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project | undefined> {
  const db = await loadDb();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.projects[idx] = { ...db.projects[idx], ...patch, updatedAt: new Date().toISOString() };
  await persist(db);
  return db.projects[idx];
}

// 변경을 적용하기 직전의 프로젝트 상태를 버전 이력에 스냅샷으로 남긴다.
// 최근 5개까지만 보관해 무한정 쌓이지 않게 한다(요구사항: 최소 3개 확인 가능).
export function pushVersion(project: Project, label: string): Project["versions"] {
  const version: Project["versions"][number] = {
    id: nextId("ver"),
    label,
    snapshot: {
      name: project.name,
      selectedTemplateId: project.selectedTemplateId,
      draft: project.draft,
      highlight: project.highlight,
    },
    createdAt: new Date().toISOString(),
  };
  return [version, ...project.versions].slice(0, 5);
}

// References
export async function listReferences(): Promise<Reference[]> {
  const db = await loadDb();
  return db.references;
}

export async function addReference(ref: Reference): Promise<void> {
  const db = await loadDb();
  db.references.unshift(ref);
  await persist(db);
}

export async function updateReference(id: string, patch: Partial<Reference>): Promise<void> {
  const db = await loadDb();
  const idx = db.references.findIndex((r) => r.id === id);
  if (idx !== -1) db.references[idx] = { ...db.references[idx], ...patch };
  await persist(db);
}

export async function deleteReference(id: string): Promise<void> {
  const db = await loadDb();
  db.references = db.references.filter((r) => r.id !== id);
  await persist(db);
}

export async function resetLearningData(): Promise<void> {
  const db = await loadDb();
  db.references = [];
  db.brandGuide = { toneKeywords: [], bannedExpressions: [], preferredColors: [], brandPhrases: [] };
  for (const project of db.projects) {
    project.feedback = [];
  }
  await persist(db);
}

// Brand guide
export async function getBrandGuide(): Promise<BrandGuide> {
  const db = await loadDb();
  return db.brandGuide;
}

export async function updateBrandGuide(guide: BrandGuide): Promise<void> {
  const db = await loadDb();
  db.brandGuide = guide;
  await persist(db);
}

// Calendar
export async function listCalendarItems(): Promise<CalendarItem[]> {
  const db = await loadDb();
  return [...db.calendarItems].sort((a, b) => (a.scheduledDate < b.scheduledDate ? -1 : 1));
}

export async function getCalendarItem(id: string): Promise<CalendarItem | undefined> {
  const db = await loadDb();
  return db.calendarItems.find((c) => c.id === id);
}

export async function addCalendarItem(item: CalendarItem): Promise<void> {
  const db = await loadDb();
  db.calendarItems.unshift(item);
  await persist(db);
}

export async function updateCalendarItem(id: string, patch: Partial<CalendarItem>): Promise<void> {
  const db = await loadDb();
  const idx = db.calendarItems.findIndex((c) => c.id === id);
  if (idx !== -1) db.calendarItems[idx] = { ...db.calendarItems[idx], ...patch };
  await persist(db);
}

export async function deleteCalendarItem(id: string): Promise<void> {
  const db = await loadDb();
  db.calendarItems = db.calendarItems.filter((c) => c.id !== id);
  await persist(db);
}

// Metrics & platform connection
export async function listMetrics(): Promise<ContentMetric[]> {
  const db = await loadDb();
  return db.metrics;
}

export async function getPlatformConnection(): Promise<PlatformConnection> {
  const db = await loadDb();
  return db.platformConnection;
}

export async function setPlatformConnection(connected: boolean): Promise<void> {
  const db = await loadDb();
  db.platformConnection = {
    platform: "틱톡",
    connected,
    connectedAt: connected ? new Date().toISOString() : undefined,
  };
  await persist(db);
}

// Source media library
export async function listSources(): Promise<SourceMedia[]> {
  const db = await loadDb();
  return [...db.sources].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addSource(source: SourceMedia): Promise<void> {
  const db = await loadDb();
  db.sources.unshift(source);
  await persist(db);
}

export async function updateSource(id: string, patch: Partial<SourceMedia>): Promise<void> {
  const db = await loadDb();
  const idx = db.sources.findIndex((s) => s.id === id);
  if (idx !== -1) db.sources[idx] = { ...db.sources[idx], ...patch };
  await persist(db);
}

export async function deleteSource(id: string): Promise<void> {
  const db = await loadDb();
  db.sources = db.sources.filter((s) => s.id !== id);
  await persist(db);
}
