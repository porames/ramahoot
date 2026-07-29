import type { Timestamp } from 'firebase/firestore';

export type QuestionType = 'quiz' | 'tf' | 'type' | 'poll' | 'wordCloud' | 'openEnded';

export interface QuestionOption {
  id: string;
  value: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  order: number;
  timeLimit: number;
}

export interface QuizQuestion extends QuestionBase {
  type: 'quiz';
  options: QuestionOption[];
  correctAnswerId: string;
}

export interface TFQuestion extends QuestionBase {
  type: 'tf';
  options: QuestionOption[];
  correctAnswerId: string;
}

export interface TypeQuestion extends QuestionBase {
  type: 'type';
  correctAnswer: string;
}

export interface PollQuestion extends QuestionBase {
  type: 'poll';
  options: QuestionOption[];
}

export interface WordCloudQuestion extends QuestionBase {
  type: 'wordCloud';
}

export interface OpenEndedQuestion extends QuestionBase {
  type: 'openEnded';
}

export type Question =
  | QuizQuestion
  | TFQuestion
  | TypeQuestion
  | PollQuestion
  | WordCloudQuestion
  | OpenEndedQuestion;

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
  type: QuestionType;
  chosenAnswerId: string | null;
  typedAnswer: string | null;
  isCorrect: boolean;
  playerId: string;
  playerName: string;
  answeredAt: Timestamp;
  scored: boolean;
  pointsEarned: number;
}
