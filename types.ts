
export interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export interface TrueFalse {
  question: string;
  answer: boolean;
  explanation: string;
}

export interface FillBlank {
  sentence: string;
  answer: string;
}

export interface Terminology {
  term: string;
  definition: string;
}

export interface YouTubeLink {
  title: string;
  url: string;
}

export interface AnalysisResult {
  summary: string;
  mcqs: MCQ[];
  fillInTheBlanks: FillBlank[];
  trueFalse: TrueFalse[];
  youtubeLinks: YouTubeLink[];
  resources: string[];
  terminology: Terminology[];
  mainTitle: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
