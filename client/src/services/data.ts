
import { MatchProfile, ChatSession, Notification, UserProfile } from '../types';
import { MOCK_MATCHES, MOCK_NOTIFICATIONS } from '../constants';

// Simple in-memory store with local storage persistence simulation for the demo
class DataService {
  private matches: MatchProfile[] = [];
  private chatSessions: Record<string, ChatSession> = {};
  private notifications: Notification[] = [...MOCK_NOTIFICATIONS];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedMatches = localStorage.getItem('oh_matches');
    const storedChats = localStorage.getItem('oh_chats');
    const storedNotifs = localStorage.getItem('oh_notifications');

    if (storedMatches) this.matches = JSON.parse(storedMatches);
    if (storedChats) this.chatSessions = JSON.parse(storedChats);
    if (storedNotifs) this.notifications = JSON.parse(storedNotifs);
  }

  private saveToStorage() {
    localStorage.setItem('oh_matches', JSON.stringify(this.matches));
    localStorage.setItem('oh_chats', JSON.stringify(this.chatSessions));
    localStorage.setItem('oh_notifications', JSON.stringify(this.notifications));
  }

  // Matches
  getMatches() {
    return this.matches;
  }

  addMatch(match: MatchProfile, currentUserId: string) {
    if (!this.matches.find(m => m.id === match.id)) {
      this.matches = [...this.matches, match];
      
      // Initialize chat session
      const newSession: ChatSession = {
        matchId: match.id,
        userA: currentUserId,
        userB: match.id,
        messages: [],
        lastUpdated: Date.now(),
        isRevealed: false
      };
      this.chatSessions[match.id] = newSession;
      
      // Add notification
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: "It's a Match!",
        message: `You matched with ${match.anonymousId}!`,
        timestamp: Date.now(),
        read: false,
        type: 'match'
      };
      this.addNotification(newNotif);
      
      this.saveToStorage();
    }
  }

  removeMatch(matchId: string) {
    this.matches = this.matches.filter(m => m.id !== matchId);
    delete this.chatSessions[matchId];
    this.saveToStorage();
  }

  // Chats
  getChatSession(matchId: string) {
    return this.chatSessions[matchId];
  }

  addMessage(matchId: string, message: any) {
    if (this.chatSessions[matchId]) {
      this.chatSessions[matchId].messages.push(message);
      this.chatSessions[matchId].lastUpdated = Date.now();
      this.saveToStorage();
    }
  }

  // Notifications
  getNotifications() {
    return this.notifications;
  }

  addNotification(notif: Notification) {
    this.notifications = [notif, ...this.notifications];
    this.saveToStorage();
  }

  markNotificationsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveToStorage();
  }

  // Queue Logic
  getMatchQueue(user: UserProfile) {
    const targetGender = user.gender === 'Male' ? 'Female' : 'Male';
    // Filter matches: Must match target gender AND not be the user themselves AND not already matched
    return MOCK_MATCHES.filter(m => 
      m.gender === targetGender && 
      m.id !== user.id &&
      !this.matches.find(existing => existing.id === m.id)
    );
  }
  
  // Reset data for demo purposes
  reset() {
      this.matches = [];
      this.chatSessions = {};
      this.notifications = [...MOCK_NOTIFICATIONS];
      this.saveToStorage();
  }
}

export const dataService = new DataService();
