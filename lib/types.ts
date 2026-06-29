export type Goal = "인지도" | "판매" | "팔로우";
export type Tone = "발랄" | "진지" | "유머";
export type LengthSec = 15 | 30 | 60;
export type ProjectStatus = "초안" | "수정중" | "완료";
export type Mood = "감성" | "정보" | "유머";
export type TemplateCategory = "브이로그" | "제품 리뷰" | "정보" | "챌린지";

export interface SourceFile {
  name: string;
  kind: "photo" | "video";
  url?: string;
  durationSec?: number;
}

export interface HighlightCandidate {
  id: string;
  start: number;
  end: number;
  reason: string;
}

export interface HighlightSelection {
  sourceIndex: number;
  candidateId?: string;
  start: number;
  end: number;
}

export interface SourceMedia {
  id: string;
  name: string;
  kind: "photo" | "video";
  url: string;
  sizeBytes: number;
  durationSec?: number;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  lengthSec: LengthSec;
  mood: Mood;
  hookType: string;
  elements: { bgm: boolean; subtitle: boolean; transition: boolean };
  colorTheme: string[];
  fontStyle: string;
  bgmId: string;
  previewSummary: string;
}

export type CaptionPreset = "기본" | "강조" | "자막박스";
export type CaptionFontSize = "작게" | "보통" | "크게";

export interface CaptionLine {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
  position: "상단" | "중단" | "하단";
  style: "감성" | "미니멀" | "키치";
  preset: CaptionPreset;
  fontSize: CaptionFontSize;
  color: string;
  backgroundColor?: string;
}

export interface Draft {
  templateId: string;
  bgmId: string;
  bgmUrl?: string;
  bgmVolume: number;
  captions: CaptionLine[];
  transitionIntensity: "낮음" | "중간" | "높음";
  cutPlan: string[];
  generatedAt: string;
}

export type RenderStatus = "대기중" | "렌더링중" | "완료" | "실패";
export type RenderResolution = "720p" | "1080p";
export type RenderAspectRatio = "9:16" | "16:9" | "1:1";

export interface Render {
  id?: string;
  status: RenderStatus;
  outputUrl?: string;
  error?: string;
  resolution?: RenderResolution;
  aspectRatio?: RenderAspectRatio;
  progressStage?: string;
  startedAt?: string;
  updatedAt: string;
}

export interface HookIdea {
  id: string;
  text: string;
  sceneHint: string;
  tone: Tone;
  lengthSec: LengthSec;
}

export interface MarketingSuggestions {
  hashtags: string[];
  caption: string;
  cta: string;
  bgmSuggestions: { id: string; name: string; mood: string; license: "상업용 가능" | "개인용만" }[];
  subtitlePresets: { id: string; name: string; style: "감성" | "미니멀" | "키치" }[];
}

export interface FeedbackEntry {
  id: string;
  projectId: string;
  sentiment: "좋아요" | "별로예요";
  reason?: string;
  summary: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: Goal;
  tone: Tone;
  targetLength: LengthSec;
  sourceFiles: SourceFile[];
  status: ProjectStatus;
  templates: Template[];
  selectedTemplateId?: string;
  draft?: Draft;
  hookIdeas: HookIdea[];
  selectedHookId?: string;
  marketing?: MarketingSuggestions;
  feedback: FeedbackEntry[];
  render?: Render;
  templateUndo?: { selectedTemplateId?: string; draft?: Draft };
  highlightCandidates?: HighlightCandidate[];
  highlight?: HighlightSelection;
  createdAt: string;
  updatedAt: string;
}

export interface Reference {
  id: string;
  type: "url" | "upload";
  value: string;
  note: string;
  excluded: boolean;
  createdAt: string;
}

export interface BrandGuide {
  toneKeywords: string[];
  bannedExpressions: string[];
  preferredColors: string[];
  brandPhrases: string[];
}

export type CalendarStatus = "아이디어" | "제작중" | "게시완료";
export type Platform = "틱톡" | "릴스" | "쇼츠";

export interface CalendarItem {
  id: string;
  topic: string;
  keyMessage: string;
  hookCandidates: string[];
  storyboardNotes: string;
  requiredSources: string;
  status: CalendarStatus;
  scheduledDate: string;
  platform: Platform;
  createdAt: string;
}

export interface ContentMetric {
  id: string;
  projectName: string;
  platform: Platform;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  hookType: string;
  templateMood: Mood;
}

export interface PlatformConnection {
  platform: "틱톡";
  connected: boolean;
  connectedAt?: string;
}
