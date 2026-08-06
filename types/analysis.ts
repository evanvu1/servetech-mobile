export type ServeMetadata = { cameraAngle: "Side" | "Rear" | "Front"; dominantHand: "Right" | "Left"; serveType: "Flat" | "Kick" | "Slice" };
export type Metric = { id: string; label: string; score: number };
export type AnalysisResult = { id: string; date: string; overallScore: number; metrics: Metric[]; correction: { title: string; detail: string }; strengths: string[]; improvements: string[]; drills: string[] };
export type SelectedVideo = { uri: string; fileName: string; fileSize?: number; duration?: number };

