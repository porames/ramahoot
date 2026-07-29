import type { Timestamp } from 'firebase/firestore';

export interface QuestionOption {
  id: string;
  value: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correctAnswerId: string;
  timeLimit: number;
  order: number;
}

export type SessionStatus = 'waiting' | 'active' | 'finished';

export interface Quiz {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  questions: Question[];
  createdAt: Timestamp;
}

export interface Session {
  id: string;
  code: string;
  quizId: string;
  teacherId: string;
  status: SessionStatus;
  liveQuestion: Question | null;
  countdown: number | null;
  startedAt: Timestamp;
  questionStartedAt?: Timestamp;
  previewStartedAt?: Timestamp;
  currentIndex: number;
}

export interface Player {
  id: string;
  playerName: string;
  uid: string;
  score: number;
  joinedAt: Timestamp;
  avatarConfig?: AvatarConfig;
  pointsEarned: number;
}

export interface AvatarConfig {
  characterType: 'human' | 'cat' | 'dog' | 'bear' | 'panda' | 'koala' | 'penguin' | 'chicken';
  faceColor: string;
  eyeStyle: 'normal' | 'happy' | 'wink' | 'wide' | 'sleepy';
  mouthStyle: 'smile' | 'laugh' | 'neutral' | 'sad' | 'surprised' | 'tongue' | 'smirk';
  glasses: 'none' | 'round' | 'shades';
  hat: 'none' | 'party' | 'cap' | 'top' | 'crown';
}

export interface Answer {
  id: string;
  questionId: string;
  chosenAnswerId: string | null;
  isCorrect: boolean;
  playerId: string;
  playerName: string;
  answeredAt: Timestamp;
  scored: boolean;
  pointsEarned: number;
}
