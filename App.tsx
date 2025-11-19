import React, { useState, useEffect } from 'react';
import { UserProfile, MatchProfile, AppView, CallType, ChatSession, Message, Notification } from './types';
import { MOCK_MATCHES, MOCK_INTERESTS, MOCK_NOTIFICATIONS, APP_NAME } from './constants';
import { NeonButton, NeonInput, Badge } from './components/Common';
import { VideoCall } from './components/VideoCall';
import { checkCompatibility, generateIceBreaker } from './services/geminiService';
import { Heart, X, MessageCircle, User, LogOut, Ghost, Zap, Send, Video, Phone, AlertTriangle, Search, Bell, CheckCircle2 } from 'lucide-react';

export default function App() {
  // -- State --
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'verify' | 'profile'>('email');
  
  // Onboarding State
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({ interests: [] });
  
  // Matching State
  const [matchQueue, setMatchQueue] = useState<MatchProfile[]>([]);
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Chat State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>({});
  const [messageInput, setMessageInput] = useState('');
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<CallType>(CallType.VIDEO);

  // -- Effects --
  useEffect(() => {
    // Simulate fetching matches on load
    setMatchQueue(MOCK_MATCHES);
  }, []);

  // -- Handlers --

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.endsWith('.edu')) {
      setAuthStep('verify');
    } else {
      alert('Please use a valid university (.edu) email.');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStep('profile');
  };

  const handleCreateProfile = () => {
    const newUser: UserProfile = {
      id: 'u1',
      anonymousId: `User#${Math.floor(Math.random() * 10000).toString(16).toUpperCase()}`,
      universityEmail: email,
      isVerified: true,
      branch: tempProfile.branch || 'General',
      year: tempProfile.year || 'Freshman',
      interests: tempProfile.interests || [],
      bio: tempProfile.bio || '',
    };
    setCurrentUser(newUser);
    setView(AppView.HOME);
  };

  const toggleInterest = (interest: string) => {
    setTempProfile(prev => {
      const current = prev.interests || [];
      if (current.includes(interest)) return { ...prev, interests: current.filter(i => i !== interest) };
      if (current.length >= 5) return prev;
      return { ...prev, interests: [...current, interest] };
    });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') {
        const matchedUser = matchQueue[currentSwipeIndex];
        setMatches(prev => [...prev, matchedUser]);
        // Initialize chat session
        const newSession: ChatSession = {
          matchId: matchedUser.id,
          userA: currentUser!.id,
          userB: matchedUser.id,
          messages: [],
          lastUpdated: Date.now(),
          isRevealed: false
        };
        setChatSessions(prev => ({ ...prev, [matchedUser.id]: newSession }));
        
        // Add notification
        const newNotif: Notification = {
          id: Date.now().toString(),
          title: "It's a Match!",
          message: `You matched with ${matchedUser.anonymousId}!`,
          timestamp: Date.now(),
          read: false,
          type: 'match'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
      
      setSwipeDirection(null);
      setCurrentSwipeIndex(prev => prev + 1);
    }, 300);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser!.id,
      text: messageInput,
      timestamp: Date.now()
    };

    setChatSessions(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, newMessage],
        lastUpdated: Date.now()
      }
    }));
    setMessageInput('');
  };

  const handleIceBreaker = async (matchId: string) => {
    if (!currentUser) return;
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const suggestion = await generateIceBreaker(currentUser.interests, match);
    setMessageInput(suggestion);
  };

  const startCall = (type: CallType) => {
    setCallType(type);
    setIsCallActive(true);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // -- Views --

  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-neon opacity-20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600 opacity-20 blur-[100px] rounded-full" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter flex flex-col items-center justify-center gap-2 uppercase">
            <span>Other</span>
            <span className="text-neon flex items-center gap-2">Half <Ghost className="w-8 h-8 text-neon animate-pulse" /></span>
          </h1>
          <p className="text-gray-400 mt-4">Anonymous. Exclusive. Secure.</p>
        </div>

        {authStep === 'email' && (
          <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">University Email</label>
              <NeonInput 
                type="email" 
                placeholder="student@university.edu" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <NeonButton className="w-full">Verify Student Status</NeonButton>
          </form>
        )}

        {authStep === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-300">We sent a code to <span className="text-neon">{email}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Verification Code</label>
              <NeonInput 
                type="text" 
                placeholder="123456" 
                className="text-center tracking-[1em] font-mono text-xl"
                defaultValue="123456" // Auto-fill for demo
              />
            </div>
            <NeonButton className="w-full">Confirm Identity</NeonButton>
          </form>
        )}

        {authStep === 'profile' && (
          <div className="space-y-6 animate-fade-in max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            <h2 className="text-xl font-bold text-white">Create Your Persona</h2>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Branch / Major</label>
              <NeonInput 
                value={tempProfile.branch || ''} 
                onChange={e => setTempProfile({...tempProfile, branch: e.target.value})} 
                placeholder="e.g., Computer Science"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Year</label>
              <select 
                className="w-full bg-gray-900 border-2 border-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:border-neon"
                onChange={e => setTempProfile({...tempProfile, year: e.target.value})}
              >
                <option>Freshman</option>
                <option>Sophomore</option>
                <option>Junior</option>
                <option>Senior</option>
                <option>Grad Student</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Interests (Max 5)</label>
              <div className="flex flex-wrap gap-2">
                {MOCK_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      (tempProfile.interests || []).includes(interest)
                        ? 'bg-neon border-neon text-white shadow-neon-sm'
                        : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Anonymous Bio</label>
              <textarea 
                className="w-full bg-gray-900 border-2 border-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:border-neon h-24 resize-none"
                placeholder="Describe yourself without revealing your name..."
                onChange={e => setTempProfile({...tempProfile, bio: e.target.value})}
              />
            </div>

            <NeonButton className="w-full" onClick={handleCreateProfile}>Enter The Void</NeonButton>
          </div>
        )}
      </div>
    </div>
  );

  const renderHome = () => {
    if (currentSwipeIndex >= matchQueue.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
             <Ghost className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No more profiles</h2>
          <p className="text-gray-500">Check back later for more students nearby.</p>
        </div>
      );
    }

    const profile = matchQueue[currentSwipeIndex];

    return (
      <div className="relative h-full flex flex-col items-center justify-center p-4">
         {/* Card Stack Effect */}
         <div className="absolute w-full max-w-sm h-[600px] bg-gray-800 rounded-3xl transform scale-90 translate-y-4 opacity-50" />
         <div className="absolute w-full max-w-sm h-[600px] bg-gray-800 rounded-3xl transform scale-95 translate-y-2 opacity-70" />

         {/* Active Card */}
         <div 
            className={`relative w-full max-w-sm h-[600px] bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden transition-transform duration-300 ${
              swipeDirection === 'left' ? '-translate-x-full rotate-[-20deg]' : 
              swipeDirection === 'right' ? 'translate-x-full rotate-[20deg]' : ''
            }`}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
            
            {/* Placeholder Image pattern since no photos allowed */}
            <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
               <span className="text-[12rem] font-black text-gray-800 select-none opacity-20 rotate-12">?</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
               <div className="flex items-center gap-2 mb-2">
                 <h2 className="text-3xl font-black text-white italic">{profile.anonymousId}</h2>
                 <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30">Verified Student</span>
               </div>
               
               <div className="flex flex-wrap gap-2 mb-4">
                  <Badge>{profile.branch}</Badge>
                  <Badge>{profile.year}</Badge>
               </div>

               <div className="flex flex-wrap gap-2 mb-6">
                 {profile.interests.map(i => (
                   <span key={i} className="text-neon text-sm font-bold">#{i}</span>
                 ))}
               </div>

               <p className="text-gray-300 text-sm line-clamp-3 mb-2">{profile.bio}</p>
               <p className="text-gray-500 text-xs flex items-center gap-1"><Zap className="w-3 h-3" /> {profile.matchPercentage}% Match • {profile.distance}</p>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-8 mt-8 z-30">
            <button 
              onClick={() => handleSwipe('left')}
              className="p-4 rounded-full bg-gray-900 border border-gray-800 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all hover:scale-110"
            >
              <X className="w-8 h-8" />
            </button>
            <button 
              onClick={() => handleSwipe('right')}
              className="p-4 rounded-full bg-gray-900 border border-gray-800 text-neon hover:bg-neon/10 hover:border-neon transition-all hover:scale-110 shadow-neon-sm"
            >
              <Heart className="w-8 h-8 fill-current" />
            </button>
         </div>
      </div>
    );
  };

  const renderMatches = () => (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Matches <span className="bg-neon text-white text-xs rounded-full px-2 py-0.5">{matches.length}</span>
      </h2>
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="text-gray-500 text-center mt-20">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No matches yet. Start swiping!</p>
          </div>
        ) : (
          matches.map(match => (
            <div 
              key={match.id} 
              onClick={() => { setActiveChatId(match.id); setView(AppView.CHAT); }}
              className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between hover:border-neon/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-gray-700 group-hover:border-neon">
                  <span className="font-bold text-gray-400 group-hover:text-neon">{match.anonymousId.substring(5)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-neon transition-colors">{match.anonymousId}</h3>
                  <p className="text-xs text-gray-500">{match.branch}</p>
                </div>
              </div>
              <MessageCircle className="text-gray-600 group-hover:text-white" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNotifications = () => {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
      <div className="p-6 pb-24 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-neon text-white text-xs rounded-full px-2 py-0.5 animate-pulse">{unreadCount}</span>
            )}
          </h2>
          <button 
            onClick={markAllNotificationsRead}
            className="text-xs text-neon hover:text-white transition-colors uppercase font-bold tracking-wider"
          >
            Mark all read
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>All caught up!</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  notif.read 
                    ? 'bg-gray-900/50 border-gray-800' 
                    : 'bg-gray-900 border-neon/50 shadow-[0_0_10px_rgba(255,0,127,0.1)]'
                }`}
              >
                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                  notif.type === 'match' ? 'bg-neon/20 text-neon' :
                  notif.type === 'message' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700/50 text-gray-300'
                }`}>
                  {notif.type === 'match' ? <Heart className="w-4 h-4 fill-current" /> : 
                   notif.type === 'message' ? <MessageCircle className="w-4 h-4" /> :
                   <Zap className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold mb-1 ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">{notif.message}</p>
                  <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderChat = () => {
    if (!activeChatId) return null;
    const match = matches.find(m => m.id === activeChatId);
    const session = chatSessions[activeChatId];
    if (!match || !session) return null;

    return (
      <div className="flex flex-col h-full bg-black">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50 backdrop-blur sticky top-0 z-10">
          <button onClick={() => setView(AppView.MATCHES)} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h3 className="font-bold text-neon">{match.anonymousId}</h3>
            <p className="text-xs text-gray-500">Expires in 48h</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => startCall(CallType.AUDIO)} className="p-2 bg-gray-900 rounded-full text-gray-300 hover:text-neon">
                <Phone className="w-5 h-5" />
             </button>
             <button onClick={() => startCall(CallType.VIDEO)} className="p-2 bg-gray-900 rounded-full text-gray-300 hover:text-neon">
                <Video className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Compatibility Badge */}
        <div className="bg-gray-900/50 p-2 text-center border-b border-gray-800">
           <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
             <Zap className="w-3 h-3 text-yellow-500" />
             AI Insight: {match.interests[0]} + {currentUser?.interests[0]} = Match?
           </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {session.messages.length === 0 && (
             <div className="text-center py-10">
               <p className="text-gray-500 text-sm mb-4">Start the conversation anonymously.</p>
               <button 
                 onClick={() => handleIceBreaker(match.id)}
                 className="text-xs border border-neon text-neon px-4 py-2 rounded-full hover:bg-neon hover:text-white transition-colors flex items-center gap-2 mx-auto"
               >
                 <Zap className="w-3 h-3" /> Ask AI for an Ice Breaker
               </button>
             </div>
          )}
          {session.messages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-neon text-white rounded-tr-none shadow-[0_0_10px_rgba(255,0,127,0.3)]' 
                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 bg-black border-t border-gray-800">
           <div className="flex gap-2">
             <input 
               value={messageInput}
               onChange={e => setMessageInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
               placeholder="Type a message..."
               className="flex-1 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-white focus:border-neon outline-none"
             />
             <button onClick={handleSendMessage} className="p-3 bg-neon rounded-full text-white hover:scale-105 transition-transform">
               <Send className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    );
  };

  // -- Layout Wrapper --
  if (view === AppView.LOGIN) return renderLogin();

  return (
    <div className="flex flex-col h-screen bg-black text-white max-w-md mx-auto shadow-2xl relative border-x border-gray-900">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {view === AppView.HOME && renderHome()}
        {view === AppView.MATCHES && renderMatches()}
        {view === AppView.NOTIFICATIONS && renderNotifications()}
        {view === AppView.CHAT && renderChat()}
        
        {/* Profile View (Simplified) */}
        {view === AppView.PROFILE && (
           <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">My Settings</h2>
              <div className="bg-gray-900 p-4 rounded-xl mb-4">
                 <p className="text-gray-500 text-sm">Current ID</p>
                 <p className="text-neon font-mono text-xl">{currentUser?.anonymousId}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl mb-4 flex items-center gap-2 text-green-400 border border-green-900/30">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Verified Student</span>
              </div>
              <NeonButton variant="secondary" className="w-full mb-4" onClick={() => alert('Report submitted.')}>
                <AlertTriangle className="w-4 h-4 mr-2" /> Report an Issue
              </NeonButton>
              <NeonButton variant="danger" className="w-full" onClick={() => setView(AppView.LOGIN)}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </NeonButton>
           </div>
        )}
      </div>

      {/* Call Overlay */}
      <VideoCall 
        isActive={isCallActive} 
        onEndCall={() => setIsCallActive(false)} 
        remoteName={activeChatId ? matches.find(m => m.id === activeChatId)?.anonymousId || 'Unknown' : 'Unknown'}
        isVideo={callType === CallType.VIDEO}
      />

      {/* Bottom Nav (Hide in Chat) */}
      {view !== AppView.CHAT && (
        <nav className="h-20 bg-black border-t border-gray-900 flex justify-around items-center px-2 z-40">
          <button 
            onClick={() => setView(AppView.HOME)}
            className={`p-2 flex flex-col items-center gap-1 ${view === AppView.HOME ? 'text-neon' : 'text-gray-600'}`}
          >
            <div className={`p-1 rounded-xl ${view === AppView.HOME ? 'bg-neon/10' : ''}`}>
              <Search className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-wider">DISCOVER</span>
          </button>

          <button 
            onClick={() => setView(AppView.MATCHES)}
            className={`p-2 flex flex-col items-center gap-1 ${view === AppView.MATCHES ? 'text-neon' : 'text-gray-600'}`}
          >
            <div className={`p-1 rounded-xl ${view === AppView.MATCHES ? 'bg-neon/10' : ''}`}>
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-wider">CHATS</span>
          </button>

          <button 
            onClick={() => setView(AppView.NOTIFICATIONS)}
            className={`p-2 flex flex-col items-center gap-1 ${view === AppView.NOTIFICATIONS ? 'text-neon' : 'text-gray-600'}`}
          >
            <div className={`p-1 rounded-xl ${view === AppView.NOTIFICATIONS ? 'bg-neon/10' : ''} relative`}>
              <Bell className="w-6 h-6" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-wider">ALERTS</span>
          </button>

          <button 
            onClick={() => setView(AppView.PROFILE)}
            className={`p-2 flex flex-col items-center gap-1 ${view === AppView.PROFILE ? 'text-neon' : 'text-gray-600'}`}
          >
            <div className={`p-1 rounded-xl ${view === AppView.PROFILE ? 'bg-neon/10' : ''}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-wider">ME</span>
          </button>
        </nav>
      )}
    </div>
  );
}