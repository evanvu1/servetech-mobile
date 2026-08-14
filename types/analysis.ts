export type ServeMetadata = { dominantHand: "Right" | "Left"; serveType: "Flat" | "Kick" | "Slice" };
export type TrimRange = { start: number; end: number };
export type Metric = { id: string; label: string; score: number; detail: string };
export type AnalysisResult = { id: string; date: string; overallScore: number; metrics: Metric[]; correction: { title: string; detail: string }; strengths: string[]; improvements: string[]; drills: string[]; serveType?: ServeMetadata["serveType"]; videoUri?: string; thumbnailUri?: string };
export type SelectedVideo = { uri: string; fileName: string; fileSize?: number; duration?: number };

