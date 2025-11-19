export interface UserProfile {
  id: string;
  anonymousId: string;
  universityEmail: string;
  branch: string;
  year: string;
  interests: string[];
  bio: string;
  isVerified: boolean;
}

export interface MatchProfile extends Omit<UserProfile, 'universityEmail'> {
  matchPercentage: number;
  distance: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ChatSession {
  matchId: string;
  userA: string;
  userB: string;
  messages: Message[];
  lastUpdated: number;
  isRevealed: boolean; // If true, real names are shown
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'match' | 'message' | 'system';
}

export enum AppView {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  MATCHES = 'MATCHES',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export enum CallType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}