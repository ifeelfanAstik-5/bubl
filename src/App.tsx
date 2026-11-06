import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Friend,
  BubblePost,
  DirectMessage,
  AvatarConfig,
  DeclineReason,
  ModerationWarningRecord,
  WeatherCondition
} from './types';
import { processBubbleContentAsync } from './services/moderationService';
import { apiClient } from './services/apiClient';
import { Avatar2D } from './components/Avatar2D';
import { FriendsSidebar } from './components/FriendsSidebar';
import { BubbleBoard } from './components/BubbleBoard';
import { MyPublishedBubbles } from './components/MyPublishedBubbles';
import { CorrespondenceDesk } from './components/CorrespondenceDesk';
import { CreateBubbleModal } from './components/CreateBubbleModal';
import { BurstBubbleModal } from './components/BurstBubbleModal';
import { AvatarEditorModal } from './components/AvatarEditorModal';
import { ProfileModal } from './components/ProfileModal';
import { ModerationWarningModal } from './components/ModerationWarningModal';
import { AuthModal } from './components/auth/AuthModal';
import { MixtureVialWidget } from './components/MixtureVialWidget';
import {
  CircleDot,
  Plus,
  Compass,
  User,
  FastForward,
  Sparkles,
  Wind,
  ShieldAlert,
  AlertTriangle,
  Menu,
  Layers
} from 'lucide-react';

export default function App() {
  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<'atmosphere' | 'my_airspace'>('atmosphere');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // User Authentication & Global Data States (Strictly Real Data from Neon Postgres)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return apiClient.getCachedUser();
  });
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(() => {
    return !apiClient.getCachedUser() && apiClient.hasToken();
  });
  const [weather, setWeather] = useState<WeatherCondition | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [bubbles, setBubbles] = useState<BubblePost[]>([]);
  const [userPublishedBubbles, setUserPublishedBubbles] = useState<BubblePost[]>([]);
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});

  // UI Navigation & Modals State
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [isCreateBubbleOpen, setIsCreateBubbleOpen] = useState(false);
  const [burstingBubble, setBurstingBubble] = useState<BubblePost | null>(null);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Moderation Warning & Suspension Modal State
  const [activeWarningRecord, setActiveWarningRecord] = useState<ModerationWarningRecord | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Load real server data for the authenticated user
  const loadServerData = (user: UserProfile) => {
    apiClient.getAtmosphereBubbles().then((b) => setBubbles(b || []));
    apiClient.getOrbits().then((f) => setFriends(f || []));
    apiClient.getMyBubbles().then((mb) => setUserPublishedBubbles(mb || []));
    apiClient.getWeather(user.latitude || 35.0116, user.longitude || 135.7681).then(setWeather);
  };

  // Check authenticated session on startup with persistent token + cache
  useEffect(() => {
    const cached = apiClient.getCachedUser();
    if (cached) {
      loadServerData(cached);
    }

    if (!apiClient.hasToken()) {
      setIsLoadingUser(false);
      setCurrentUser(null);
      return;
    }

    apiClient
      .getMe()
      .then((user) => {
        if (user && user.id) {
          setCurrentUser(user);
          apiClient.saveCachedUser(user);
          loadServerData(user);
        } else {
          setCurrentUser(null);
          apiClient.clearToken();
        }
      })
      .catch(() => {
        if (!cached) {
          setCurrentUser(null);
        }
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, []);

  // Toast auto-clear
  useEffect(() => {
    if (notificationToast) {
      const timer = setTimeout(() => setNotificationToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationToast]);

  const activeFriends = friends.filter((f) => f.status === 'active');
  const selectedFriend = friends.find((f) => f.id === selectedFriendId) || null;

  // Award Breath Experience and level up breath mastery
  const awardBreathXP = (xp: number) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const newExp = prev.breathExp + xp;
      const newLevel = newExp >= 50 ? 3 : newExp >= 20 ? 2 : 1;
      return {
        ...prev,
        breathExp: newExp,
        breathLevel: newLevel,
        dailyBreathEnergy: Math.min(100, prev.dailyBreathEnergy + 5)
      };
    });
  };

  const isSuspended = Boolean(
    currentUser?.suspendedUntil && currentUser.suspendedUntil > Date.now()
  );

  // Handler: Burst a bubble (checks 3 of 5 bursts quota)
  const handleBurstBubble = (bubble: BubblePost) => {
    if (!currentUser) return;
    if (isSuspended) {
      setNotificationToast(
        'Account Suspended: Cannot burst community bubbles during your 7-day suspension.'
      );
      return;
    }

    if (bubble.isUserBubble) {
      setBurstingBubble(bubble);
      return;
    }

    const isAlreadyBurst = currentUser.burstBubbleIdsToday.includes(bubble.id);

    // If already burst, re-read without quota decrement
    if (isAlreadyBurst) {
      setBurstingBubble(bubble);
      return;
    }

    if (currentUser.dailyBurstsRemaining <= 0) {
      setNotificationToast(
        'Daily burst quota reached: You have burst 3 of today’s 5 bubbles. Tomorrow fresh bubbles drift in!'
      );
      return;
    }

    // Decrement daily burst quota and record bubble ID
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        dailyBurstsRemaining: Math.max(0, prev.dailyBurstsRemaining - 1),
        burstBubbleIdsToday: [...prev.burstBubbleIdsToday, bubble.id]
      };
    });

    awardBreathXP(10);
    apiClient.burstBubble(bubble.id);
    setBurstingBubble(bubble);
  };

  // Handler: Respond to a burst bubble
  const handleReplyToBubble = (
    bubble: BubblePost,
    messageText: string,
    breathEffort: 'gentle' | 'balanced' | 'deep'
  ) => {
    if (!currentUser) return;
    if (isSuspended) {
      setNotificationToast(
        'Account Suspended: Cannot send dispatches during your 7-day suspension.'
      );
      return;
    }

    if (activeFriends.length >= 50) {
      setNotificationToast(
        'Connection limit reached: You currently have 50 active connections. Remove an inactive connection to add new ones.'
      );
      return;
    }

    let targetFriendId = bubble.authorId;
    let existingFriend = friends.find((f) => f.id === targetFriendId);

    if (!existingFriend) {
      const newFriend: Friend = {
        id: targetFriendId,
        name: bubble.authorName,
        age: bubble.authorAge,
        location: bubble.authorLocation,
        pronouns: 'they/them',
        bio: `Author of bubble "${bubble.title}"`,
        languages: ['English'],
        hobbies: bubble.hobbies,
        exchangeInterest: 'Literature & Philosophy Discussions',
        avatar: bubble.authorAvatar,
        status: 'active',
        distanceKm: bubble.distanceKm,
        mediaHandshake: {
          requestedByMe: false,
          requestedByThem: false,
          approvedByMe: false,
          approvedByThem: false
        },
        lastMessageSnippet: messageText,
        lastMessageTime: Date.now(),
        inTransitCount: 1,
        unreadCount: 0
      };
      setFriends((prev) => [newFriend, ...prev]);
    } else {
      setFriends((prev) =>
        prev.map((f) =>
          f.id === targetFriendId
            ? {
                ...f,
                status: 'active',
                lastMessageSnippet: messageText,
                lastMessageTime: Date.now(),
                inTransitCount: (f.inTransitCount || 0) + 1
              }
            : f
        )
      );
    }

    // Delivery time based on breath effort
    const deliveryMs =
      breathEffort === 'deep'
        ? 18 * 60 * 1000
        : breathEffort === 'gentle'
        ? 15 * 60 * 1000
        : 10 * 60 * 1000;

    const newMessage: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversationId: targetFriendId,
      senderId: currentUser.id,
      recipientId: targetFriendId,
      title: `In response to "${bubble.title}"`,
      body: messageText,
      sentAt: Date.now(),
      deliveryDurationMs: deliveryMs,
      arrivalAt: Date.now() + deliveryMs,
      isDelivered: false,
      breathEffort
    };

    setDirectMessages((prev) => ({
      ...prev,
      [targetFriendId]: [...(prev[targetFriendId] || []), newMessage]
    }));

    awardBreathXP(breathEffort === 'deep' ? 25 : breathEffort === 'gentle' ? 18 : 10);

    setNotificationToast(
      `Bubble blown to ${bubble.authorName}! Estimated calm transit: ~${Math.round(deliveryMs / 60000)}m.`
    );
  };

  // Handler: Decline a bubble
  const handleDeclineBubble = (
    bubbleId: string,
    reason: DeclineReason,
    customNote?: string
  ) => {
    setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    setNotificationToast('Bubble declined respectfully.');
  };

  // Handler: Release a weekly bubble (Good titles released immediately; background service analyzes content asynchronously)
  const handlePublishBubble = (
    newBubbleData: Omit<BubblePost, 'id' | 'publishedAt'>
  ) => {
    if (isSuspended) {
      setNotificationToast(
        'Account Suspended: Cannot release bubbles during your 7-day suspension.'
      );
      return;
    }

    const newBubble: BubblePost = {
      ...newBubbleData,
      id: `user-bubble-${Date.now()}`,
      publishedAt: Date.now(),
      moderationStatus: 'scanning'
    };

    // Release to public airspace and user's published list immediately
    setUserPublishedBubbles((prev) => [newBubble, ...prev]);
    setBubbles((prev) => [newBubble, ...prev]);

    // Update user's last published timestamp (1/week quota)
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        lastBubblePublishedAt: Date.now()
      };
    });

    awardBreathXP(30);

    apiClient
      .publishBubble({
        title: newBubble.title,
        content: newBubble.content,
        bubbleType: newBubble.bubbleType,
        bubbleColor: newBubble.bubbleColor,
        breathEffort: 'balanced',
        hobbies: newBubble.hobbies,
        promptQuestion: newBubble.promptQuestion
      })
      .then((res) => {
        if (res && res.mixtureVialMl !== undefined) {
          setCurrentUser((prev) =>
            prev ? { ...prev, mixtureVialMl: res.mixtureVialMl! } : null
          );
        }
      });

    setNotificationToast(
      'Bubble released to airspace! Asynchronous content review underway...'
    );

    // Run Asynchronous Content Moderation Service in the background
    processBubbleContentAsync(
      newBubble.id,
      newBubble.title,
      newBubble.content,
      newBubble.promptQuestion
    ).then((result) => {
      if (!result.approved) {
        // Bring down the bubble from public board immediately
        setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));

        // Mark as taken down in user's published bubbles with reason
        setUserPublishedBubbles((prev) =>
          prev.map((b) =>
            b.id === newBubble.id
              ? {
                  ...b,
                  moderationStatus: 'flagged_taken_down',
                  flaggedReason: result.reason,
                  flaggedKeywords: result.flaggedWords
                }
              : b
          )
        );

        // Record warning and check 3-warning suspension rule
        setCurrentUser((prev) => {
          if (!prev) return null;
          const currentCount = prev.moderationWarningsCount || 0;
          const newWarningCount = currentCount + 1;
          const willSuspend = newWarningCount >= 3;
          const suspendedUntil = willSuspend
            ? Date.now() + 7 * 24 * 60 * 60 * 1000
            : prev.suspendedUntil;

          const warningRecord: ModerationWarningRecord = {
            id: `warn-${Date.now()}`,
            bubbleId: newBubble.id,
            bubbleTitle: newBubble.title,
            flaggedWords: result.flaggedWords,
            reason:
              result.reason ||
              'Sensitive or cringe keywords detected during background content review.',
            issuedAt: Date.now(),
            warningNumber: newWarningCount,
            resultedInSuspension: willSuspend
          };

          const updated: UserProfile = {
            ...prev,
            moderationWarningsCount: newWarningCount,
            suspendedUntil,
            moderationWarningsHistory: [
              warningRecord,
              ...(prev.moderationWarningsHistory || [])
            ]
          };

          localStorage.setItem('bubble_user_profile_v2', JSON.stringify(updated));

          // Open moderation warning modal immediately
          setActiveWarningRecord(warningRecord);
          setIsWarningModalOpen(true);

          return updated;
        });

        setNotificationToast(
          `⚠️ Your bubble "${newBubble.title}" was brought down by Content Moderation.`
        );
      } else {
        // Approved cleanly!
        setUserPublishedBubbles((prev) =>
          prev.map((b) =>
            b.id === newBubble.id ? { ...b, moderationStatus: 'clean' } : b
          )
        );
        setBubbles((prev) =>
          prev.map((b) =>
            b.id === newBubble.id ? { ...b, moderationStatus: 'clean' } : b
          )
        );
      }
    });
  };

  // Handler: Reset warnings and suspension for developer test
  const handleResetWarningsAndSuspension = () => {
    apiClient.resetSuspension();
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        moderationWarningsCount: 0,
        suspendedUntil: null,
        moderationWarningsHistory: []
      };
      localStorage.setItem('bubble_user_profile_v2', JSON.stringify(updated));
      return updated;
    });
    setNotificationToast('All moderation warnings and 7-day suspension have been reset.');
  };

  // Handler: Unpublish bubble
  const handleDeletePublishedBubble = (bubbleId: string) => {
    setUserPublishedBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    apiClient.deleteBubble(bubbleId);
    setNotificationToast('Bubble unpublished.');
  };

  // Handler: Stealth friend removal
  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, status: 'removed' } : f))
    );
    if (selectedFriendId === friendId) {
      setSelectedFriendId(null);
    }
    apiClient.releaseOrbit(friendId);
    setNotificationToast(
      'Connection removed silently. They have not been notified.'
    );
  };

  // Handler: Restore removed friend
  const handleRestoreFriend = (friendId: string) => {
    if (activeFriends.length >= 50) {
      setNotificationToast('Cannot restore: You have reached 50 active connections.');
      return;
    }
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, status: 'active' } : f))
    );
    apiClient.restoreOrbit(friendId);
    setNotificationToast('Connection restored to active list.');
  };

  // Handler: Send 1-on-1 message
  const handleSendOneOnOneMessage = (data: {
    title?: string;
    body: string;
    breathEffort?: 'gentle' | 'balanced' | 'deep';
    mediaAttachments?: any[];
  }) => {
    if (!currentUser || !selectedFriend) return;

    if (isSuspended) {
      setNotificationToast(
        'Account Suspended: Cannot send dispatches during your 7-day suspension.'
      );
      return;
    }

    const effort = data.breathEffort || 'gentle';
    const deliveryMs =
      effort === 'deep'
        ? 18 * 60 * 1000
        : effort === 'gentle'
        ? 15 * 60 * 1000
        : 10 * 60 * 1000;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedFriend.id,
      senderId: currentUser.id,
      recipientId: selectedFriend.id,
      title: data.title,
      body: data.body,
      sentAt: Date.now(),
      deliveryDurationMs: deliveryMs,
      arrivalAt: Date.now() + deliveryMs,
      isDelivered: false,
      breathEffort: effort,
      mediaAttachments: data.mediaAttachments
    };

    setDirectMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMsg]
    }));

    setFriends((prev) =>
      prev.map((f) =>
        f.id === selectedFriend.id
          ? {
              ...f,
              lastMessageSnippet: data.body,
              lastMessageTime: Date.now(),
              inTransitCount: (f.inTransitCount || 0) + 1
            }
          : f
      )
    );

    awardBreathXP(effort === 'deep' ? 20 : effort === 'gentle' ? 15 : 10);

    apiClient.sendMessage(selectedFriend.id, {
      body: data.body,
      breathEffort: effort,
      mediaAttachments: data.mediaAttachments
    });

    setNotificationToast(
      `Bubble sent to ${selectedFriend.name}. Airmail drift in progress (~${Math.round(deliveryMs / 60000)}m).`
    );
  };

  // Handler: Media Handshake
  const handleRequestMediaHandshake = (friendId: string) => {
    apiClient.handshakeMedia(friendId, 'request');
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId
          ? {
              ...f,
              mediaHandshake: {
                ...f.mediaHandshake,
                requestedByMe: true,
                approvedByMe: true
              }
            }
          : f
      )
    );
    setNotificationToast(
      'Media handshake requested. Both users must approve before media unlocks.'
    );
  };

  const handleApproveMediaHandshake = (friendId: string) => {
    apiClient.handshakeMedia(friendId, 'approve');
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId
          ? {
              ...f,
              mediaHandshake: {
                ...f.mediaHandshake,
                approvedByMe: true,
                approvedByThem: true
              }
            }
          : f
      )
    );
    setNotificationToast('Mutual media handshake approved! Media unlocked.');
  };

  // Fast-Forward Transit Tester tool
  const handleFastForwardTransit = () => {
    apiClient.accelerateWinds();
    setDirectMessages((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((convId) => {
        updated[convId] = updated[convId].map((msg) => ({
          ...msg,
          isDelivered: true,
          arrivalAt: Date.now() - 1000
        }));
      });
      return updated;
    });

    setFriends((prev) =>
      prev.map((f) => ({
        ...f,
        inTransitCount: 0
      }))
    );

    setNotificationToast('Air currents accelerated! All dispatches arrived.');
  };

  // Sign out handler
  const handleLogout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setBubbles([]);
    setFriends([]);
    setUserPublishedBubbles([]);
    setDirectMessages({});
    setSelectedFriendId(null);
    setIsProfileModalOpen(false);
  };

  // 1. Loading Screen while attuning session
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-serif text-stone-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100/80 border border-amber-300 flex items-center justify-center text-2xl animate-float-slow shadow-xs">
            🫧
          </div>
          <p className="text-sm font-medium tracking-wide">Attuning to the atmosphere...</p>
        </div>
      </div>
    );
  }

  // 2. Full Auth Guard: Unauthenticated visitors see Mindful Sign In & Onboarding Modal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <AuthModal
          isOpen={true}
          onSuccess={(user) => {
            setCurrentUser(user);
            loadServerData(user);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F6F2EC] to-[#F1EAE2] text-[#2F2A26] flex flex-col font-sans selection:bg-amber-100 relative overflow-x-hidden">
      {/* Ambient background drifting bubbles */}
      <div className="fixed top-24 left-[8%] w-32 h-32 rounded-full bg-gradient-to-tr from-pink-200/20 via-sky-200/20 to-transparent blur-xl pointer-events-none animate-float-slow" />
      <div className="fixed bottom-36 right-[6%] w-44 h-44 rounded-full bg-gradient-to-br from-amber-200/20 via-teal-200/20 to-transparent blur-2xl pointer-events-none animate-float-slow-reverse" />
      <div className="fixed top-1/2 right-[18%] w-24 h-24 rounded-full bg-gradient-to-r from-purple-200/15 via-blue-200/15 to-transparent blur-lg pointer-events-none animate-float-sway" />

      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-xs font-medium shadow-xl flex items-center gap-2 max-w-sm animate-fade-in border border-stone-800">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* TOP BAR CONTRACT: Brand & Mobile Dock Trigger — Nav Breadcrumbs — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-white/80 shadow-[0_4px_20px_-4px_rgba(160,145,130,0.06)] px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Mobile drawer trigger + Brand wordmark with iridescent bubble logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="Open Navigation & Orbits Dock"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setSelectedFriendId(null);
                setActiveNav('atmosphere');
              }}
              className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap hover:opacity-85 transition-opacity flex items-center gap-2.5 text-left font-serif-letter"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 via-sky-200 to-rose-200 p-0.5 shadow-xs flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center text-sm">
                  🫧
                </div>
              </div>
              <span className="text-xl">Bubl</span>
              <span className="text-xs font-normal text-stone-400 font-sans hidden lg:inline">
                · Mindful Thought Exchange
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links & Active Breadcrumb */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-medium text-stone-600">
            <button
              onClick={() => {
                setSelectedFriendId(null);
                setActiveNav('atmosphere');
              }}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                selectedFriendId === null && activeNav === 'atmosphere'
                  ? 'bg-white shadow-2xs text-stone-900 font-semibold border border-stone-200/60'
                  : 'hover:bg-white/60'
              }`}
            >
              <span>🫧</span>
              <span>Atmosphere</span>
            </button>

            <button
              onClick={() => {
                setSelectedFriendId(null);
                setActiveNav('my_airspace');
              }}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                selectedFriendId === null && activeNav === 'my_airspace'
                  ? 'bg-white shadow-2xs text-stone-900 font-semibold border border-stone-200/60'
                  : 'hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>My Airspace</span>
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/60"
            >
              <User className="w-3.5 h-3.5" />
              <span>Soul Profile</span>
            </button>

            <button
              onClick={handleFastForwardTransit}
              title="Fast-forward delivery for testing"
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-stone-500 hover:bg-stone-200/60 px-2.5 py-1 rounded-full font-mono text-[11px]"
            >
              <FastForward className="w-3.5 h-3.5 text-teal-600" />
              <span>Accelerate Winds</span>
            </button>
          </nav>

          {/* Zone 3: Soap Mixture Vial + Avatar + Primary Action */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Soap Mixture Vial Widget */}
            <MixtureVialWidget
              mixtureVialMl={currentUser.mixtureVialMl ?? 100}
              onVialRefilled={(newMl) =>
                setCurrentUser((prev) => (prev ? { ...prev, mixtureVialMl: newMl } : null))
              }
            />

            <button
              onClick={() => setIsAvatarEditorOpen(true)}
              className="relative p-0.5 rounded-full bg-white ring-2 ring-white hover:ring-amber-300 transition-all shadow-xs"
              title="Customize 2D Avatar"
            >
              <Avatar2D config={currentUser.avatar} size="xs" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center text-[7px] shadow-2xs">
                🫧
              </span>
            </button>

            {currentUser.moderationWarningsCount > 0 && !isSuspended && (
              <div
                title="Community moderation warnings on your account"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-full text-[11px] font-mono"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{currentUser.moderationWarningsCount}/3 Warnings</span>
              </div>
            )}

            <button
              onClick={() => {
                if (isSuspended) {
                  setNotificationToast('Account Suspended: Cannot blow bubbles during 7-day suspension.');
                  return;
                }
                setIsCreateBubbleOpen(true);
              }}
              disabled={isSuspended}
              className={`px-3.5 sm:px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0 shadow-md flex items-center gap-1.5 ${
                isSuspended
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-teal-900 hover:to-stone-900'
              }`}
            >
              {isSuspended ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Suspended</span>
                </>
              ) : (
                <>
                  <span>🌬️</span>
                  <span>Blow Bubble</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SUSPENSION TOP BANNER */}
      {isSuspended && (
        <div className="bg-rose-900 text-white px-6 py-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950 animate-fade-in shadow-md">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-300 shrink-0" />
            <div>
              <span className="font-semibold block sm:inline">Account Suspended (7-Day Duration):</span>{' '}
              <span className="text-rose-200">
                You have reached 3 content violations. Releasing bubbles, bursting community bubbles, and dispatches are paused until{' '}
                {new Date(currentUser.suspendedUntil!).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}.
              </span>
            </div>
          </div>
          <button
            onClick={handleResetWarningsAndSuspension}
            className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-rose-100 rounded-lg text-[11px] font-mono transition-colors shrink-0 flex items-center gap-1 border border-rose-700"
          >
            <span>Dev Test: Reset Suspension</span>
          </button>
        </div>
      )}

      {/* MAIN VIEW CONTAINER WITH SIDE NAV DOCK */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Integrated Side Navigation & Orbit Dock */}
          <FriendsSidebar
            friends={friends}
            selectedFriendId={selectedFriendId}
            currentUser={currentUser}
            activeNav={activeNav}
            onChangeNav={(nav) => {
              setActiveNav(nav);
              setSelectedFriendId(null);
            }}
            onSelectFriend={(f) => {
              setSelectedFriendId(f.id);
            }}
            onRemoveFriend={handleRemoveFriend}
            onRestoreFriend={handleRestoreFriend}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAvatarEditor={() => setIsAvatarEditorOpen(true)}
            onOpenCreateBubble={() => {
              if (isSuspended) {
                setNotificationToast('Account Suspended: Cannot blow bubbles during 7-day suspension.');
                return;
              }
              setIsCreateBubbleOpen(true);
            }}
            onAccelerateWinds={handleFastForwardTransit}
            isSuspended={isSuspended}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          />

          {/* Center Main Stage */}
          <div className="flex-1 w-full space-y-6">
            {selectedFriend ? (
              /* 1-on-1 Paced Connection Desk */
              <CorrespondenceDesk
                friend={selectedFriend}
                currentUser={currentUser}
                messages={directMessages[selectedFriend.id] || []}
                onBack={() => setSelectedFriendId(null)}
                onSendMessage={handleSendOneOnOneMessage}
                onRequestMediaHandshake={handleRequestMediaHandshake}
                onApproveMediaHandshake={handleApproveMediaHandshake}
              />
            ) : activeNav === 'my_airspace' ? (
              /* Focused My Airspace View */
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌬️</span>
                    <h2 className="text-base font-bold text-stone-900 tracking-tight font-serif-letter">
                      My Floating Airspace
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveNav('atmosphere')}
                    className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 underline underline-offset-4"
                  >
                    ← Back to Drifting Atmosphere
                  </button>
                </div>
                <MyPublishedBubbles
                  userBubbles={userPublishedBubbles}
                  currentUser={currentUser}
                  onOpenBubble={handleBurstBubble}
                  onDeleteBubble={handleDeletePublishedBubble}
                  onCreateBubbleClick={() => setIsCreateBubbleOpen(true)}
                />
              </div>
            ) : (
              /* Atmosphere Gazebo Dashboard: Bubbles Center Top + Published Bubbles Bottom */
              <>
                {/* Center Top: Floating Bubbles Board (Aggregate 3 of 5) */}
                <BubbleBoard
                  bubbles={bubbles}
                  currentUser={currentUser}
                  burstBubbleIdsToday={currentUser.burstBubbleIdsToday}
                  weather={weather}
                  onBurstBubble={handleBurstBubble}
                  onCreateBubbleClick={() => setIsCreateBubbleOpen(true)}
                />

                {/* Center Bottom: Your Published Bubbles (1/week quota) */}
                <MyPublishedBubbles
                  userBubbles={userPublishedBubbles}
                  currentUser={currentUser}
                  onOpenBubble={handleBurstBubble}
                  onDeleteBubble={handleDeletePublishedBubble}
                  onCreateBubbleClick={() => setIsCreateBubbleOpen(true)}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-stone-200/80 bg-[#FAF7F2] py-4 px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span>Bubl Mindful Pen Pal & Thought Exchange</span>
            <span>·</span>
            <span>2D Avatars Only</span>
            <span>·</span>
            <span>Zero Appearance Bias</span>
          </div>
          <div>
            <span>1 Bubble/wk · Select 3 of 5 Daily · 50 Connections Max</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Release Bubble Modal */}
      <CreateBubbleModal
        user={currentUser}
        isOpen={isCreateBubbleOpen}
        onClose={() => setIsCreateBubbleOpen(false)}
        onPublish={handlePublishBubble}
      />

      {/* 2. Burst Bubble Modal */}
      <BurstBubbleModal
        bubble={burstingBubble}
        currentUser={currentUser}
        isOpen={!!burstingBubble}
        onClose={() => setBurstingBubble(null)}
        onSendResponse={handleReplyToBubble}
        onDeclineBubble={handleDeclineBubble}
        canAddFriend={activeFriends.length < 50}
        activeFriendsCount={activeFriends.length}
      />

      {/* 3. 2D Avatar Studio Modal */}
      <AvatarEditorModal
        initialConfig={currentUser.avatar}
        isOpen={isAvatarEditorOpen}
        onClose={() => setIsAvatarEditorOpen(false)}
        onSave={(newAvatar) => {
          setCurrentUser((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
          apiClient.updateAvatar(newAvatar);
        }}
      />

      {/* 4. Profile & Hobbies Modal */}
      <ProfileModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={(updated) => {
          setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
          apiClient.updateProfile(updated);
        }}
        onOpenAvatarEditor={() => {
          setIsProfileModalOpen(false);
          setIsAvatarEditorOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* 5. Moderation Warning & Suspension Modal */}
      <ModerationWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        warningRecord={activeWarningRecord}
        currentUser={currentUser}
        onResetWarningsAndSuspension={handleResetWarningsAndSuspension}
      />
    </div>
  );
}
