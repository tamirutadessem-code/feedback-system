// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

// Sector types
export interface Sector {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Question types
export interface Question {
  id: number;
  sectorId: number;
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'rating';
  text: string;
  options: string[] | null;
  required: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Feedback types
export interface Feedback {
  id: number;
  rating: number;
  wordRating: string;
  topics: string[];
  feedback?: string;
  sectorId?: number;
  answers?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

// Feedback submission types
export interface SubmitFeedbackRequest {
  rating: number;
  wordRating: string;
  topics: string[];
  feedback?: string;
  sectorId?: number;
  answers?: Record<string, any>;
}

// Statistics types
export interface FeedbackStats {
  total: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
  wordRatingCounts: Record<string, number>;
  topicCounts: Record<string, number>;
  sectorStats?: Record<number, SectorStats>;
}

export interface SectorStats {
  sectorId: number;
  sectorName: string;
  total: number;
  averageRating: number;
  questionStats: Record<number, QuestionStats>;
}

export interface QuestionStats {
  questionId: number;
  questionText: string;
  questionType: string;
  responses: number;
  answers: Record<string, number>;
}