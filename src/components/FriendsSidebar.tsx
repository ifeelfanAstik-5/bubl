import React, { useState } from 'react';
import { Friend, UserProfile } from '../types';
import { Avatar2D } from './Avatar2D';
import { HOBBY_ICONS } from '../data/mockData';
import {
  Search,
  RotateCcw,
  Wind,
  UserX,
  Sparkles,
  User,
  Layers,
  FastForward,
  AlertTriangle,
  X,
  Compass,
  MessageCircle
} from 'lucide-react';

interface FriendsSidebarProps {
  friends: Friend[];
  selectedFriendId: string | null;
  currentUser: UserProfile;
  activeNav: 'atmosphere' | 'my_airspace';
  onChangeNav: (nav: 'atmosphere' | 'my_airspace') => void;
  onSelectFriend: (friend: Friend) => void;
  onRemoveFriend: (friendId: string) => void;
  onRestoreFriend: (friendId: string) => void;
  onOpenProfile: () => void;
  onOpenAvatarEditor: () => void;
  onOpenCreateBubble: () => void;
  onAccelerateWinds: () => void;
  isSuspended: boolean;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

const MAX_FRIENDS = 50;

export const FriendsSidebar: React.FC<FriendsSidebarProps> = ({
  friends,
  selectedFriendId,
  currentUser,
  activeNav,
  onChangeNav,
  onSelectFriend,
  onRemoveFriend,
  onRestoreFriend,
  onOpenProfile,
  onOpenAvatarEditor,
  onOpenCreateBubble,
  onAccelerateWinds,
  isSuspended,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'removed'>('active');
  const [friendToConfirmRemove, setFriendToConfirmRemove] = useState<Friend | null>(null);

  const activeFriends = friends.filter((f) => f.status === 'active');
  const removedFriends = friends.filter((f) => f.status === 'removed');

  const query = filterQuery.trim().toLowerCase();
  const displayedFriends = (viewTab === 'active' ? activeFriends : removedFriends).filter(
    (f) => {
      if (!query) return true;
      const nameMatch = (f.name || '').toLowerCase().includes(query);
      const locMatch = (f.location || '').toLowerCase().includes(query);
      const hobbiesMatch =
        Array.isArray(f.hobbies) &&
        f.hobbies.some((h) => (h || '').toLowerCase().includes(query));
      return nameMatch || locMatch || hobbiesMatch;
    }
  );

  const nextLevelExp =
    currentUser.breathLevel === 1 ? 20 : currentUser.breathLevel === 2 ? 50 : 100;

  const sidebarContent = (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-gradient-to-b from-[#FAF8F5]/98 via-[#F7F3ED]/95 to-[#F2EBE3]/98 border-r border-white/80 shadow-[0_20px_50px_-20px_rgba(180,165,150,0.22)] backdrop-blur-xl relative">
      {/* Specular sheen */}
      <div className="bubble-specular-crescent opacity-40 pointer-events-none" />

      {/* 1. TOP HEADER: Brand & User Identity Pill (Compact & Crisp) */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200/60 bg-white/75 backdrop-blur-md relative z-10 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-200 via-sky-200 to-rose-200 p-0.5 shadow-2xs flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center text-xs">
                🫧
              </div>
            </div>
            <span className="text-sm font-bold text-stone-900 tracking-tight font-serif-letter">
              Bubl
            </span>
            <span className="text-[10px] text-stone-400 font-sans hidden sm:inline">
              · Mindful Exchange
            </span>
          </div>

          {/* User Profile Mini Capsule */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenProfile}
              title="Open Soul Profile & Breath Sanctuary"
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-stone-200/80 hover:border-amber-300 transition-all shadow-2xs text-left"
            >
              <div className="relative">
                <Avatar2D config={currentUser.avatar} size="xs" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-500 border border-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] font-semibold text-stone-800 block leading-tight font-serif-letter truncate max-w-[80px]">
                  {currentUser.nickname}
                </span>
                <span className="text-[9px] text-teal-700 font-mono block leading-none">
                  Lvl {currentUser.breathLevel}
                </span>
              </div>
            </button>

            {onCloseMobileDrawer && (
              <button
                onClick={onCloseMobileDrawer}
                className="md:hidden w-7 h-7 rounded-full bg-white/80 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Breath Stamina Bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-teal-800 px-1">
          <span className="flex items-center gap-1">
            <Wind className="w-2.5 h-2.5 text-teal-600 animate-spin" />
            <span>Breath Stamina</span>
          </span>
          <span className="text-stone-500">
            {currentUser.breathExp}/{nextLevelExp} XP · {currentUser.dailyBreathEnergy}%
          </span>
        </div>
        <div className="w-full h-1 bg-stone-200/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all"
            style={{
              width: `${Math.min(
                100,
                Math.round((currentUser.breathExp / nextLevelExp) * 100)
              )}%`
            }}
          />
        </div>

        {/* PRIMARY CALL TO ACTION: Blow Bubble */}
        <button
          onClick={() => {
            if (!isSuspended) {
              onOpenCreateBubble();
              if (onCloseMobileDrawer) onCloseMobileDrawer();
            }
          }}
          disabled={isSuspended}
          className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all shadow-xs flex items-center justify-between ${
            isSuspended
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-teal-900 hover:to-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{isSuspended ? '🚫' : '🌬️'}</span>
            <span className="font-semibold text-xs tracking-wide">
              {isSuspended ? 'Suspended' : 'Blow Bubble'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-300 bg-white/10 px-2 py-0.5 rounded-full">
            1/wk
          </span>
        </button>

        {/* PRIMARY VIEW BUTTONS: Atmosphere & My Airspace */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            onClick={() => {
              onChangeNav('atmosphere');
              if (onCloseMobileDrawer) onCloseMobileDrawer();
            }}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              selectedFriendId === null && activeNav === 'atmosphere'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold border border-stone-200/90'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <span>🫧</span>
            <span>Atmosphere</span>
          </button>

          <button
            onClick={() => {
              onChangeNav('my_airspace');
              if (onCloseMobileDrawer) onCloseMobileDrawer();
            }}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              selectedFriendId === null && activeNav === 'my_airspace'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold border border-stone-200/90'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3 h-3 text-stone-500" />
            <span>Airspace</span>
          </button>
        </div>
      </div>

      {/* 2. CONNECTED ORBITS DOCK: Header & Search */}
      <div className="p-3 border-b border-stone-200/50 bg-white/60 backdrop-blur-xs space-y-2 shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🪐</span>
            <h2 className="text-xs font-semibold text-stone-900 tracking-tight font-serif-letter">
              Connected Orbits
            </h2>
          </div>

          {/* 50 Friends Quota Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-stone-200/80 text-[10px] font-mono shadow-2xs">
            <span
              className={`font-semibold ${
                activeFriends.length >= MAX_FRIENDS ? 'text-rose-600' : 'text-stone-800'
              }`}
            >
              {activeFriends.length}
            </span>
            <span className="text-stone-400">/{MAX_FRIENDS}</span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search orbits or passions..."
            className="w-full pl-7 pr-2.5 py-1 text-xs bg-white/90 border border-stone-200/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 placeholder:text-stone-400 shadow-2xs"
          />
        </div>

        {/* Tab Switcher: In Orbit vs Released (Fixed width buttons, no jitter) */}
        <div className="flex items-center gap-1 p-0.5 bg-stone-200/60 rounded-lg text-[11px] w-full">
          <button
            type="button"
            onClick={() => setViewTab('active')}
            className={`flex-1 py-1 font-medium rounded-md transition-all text-center ${
              viewTab === 'active'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            In Orbit ({activeFriends.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('removed')}
            className={`flex-1 py-1 font-medium rounded-md transition-all text-center ${
              viewTab === 'removed'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Released ({removedFriends.length})
          </button>
        </div>
      </div>

      {/* 3. SCROLLABLE ORBITS LIST (Prominent, Stable Height, No Layout Shift) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 relative z-10 overscroll-contain">
        {displayedFriends.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-500 font-serif-letter leading-relaxed min-h-[160px] flex flex-col items-center justify-center">
            {viewTab === 'active' ? (
              query ? (
                <>
                  <p className="font-semibold text-stone-700 mb-1">No matches found</p>
                  <p className="text-[11px] text-stone-400">
                    No pen pals in orbit match "{filterQuery}".
                  </p>
                </>
              ) : (
                <>
                  <span className="text-xl mb-1">🫧</span>
                  <p className="font-semibold text-stone-700 mb-1">Your orbit is quiet</p>
                  <p className="text-[11px] text-stone-400 max-w-[200px]">
                    Burst drifting bubbles in the atmosphere to start an unhurried correspondence.
                  </p>
                </>
              )
            ) : (
              <>
                <span className="text-xl mb-1">🍃</span>
                <p className="font-semibold text-stone-700 mb-1">No released pen pals</p>
                <p className="text-[11px] text-stone-400 max-w-[200px]">
                  When you quietly release a pen pal, they rest here without ever being notified.
                </p>
              </>
            )}
          </div>
        ) : (
          displayedFriends.map((friend) => {
            const isSelected = selectedFriendId === friend.id;
            const hasInTransit = !!friend.inTransitCount && friend.inTransitCount > 0;
            const hasUnread = !!friend.unreadCount && friend.unreadCount > 0;

            return (
              <div
                key={friend.id}
                onClick={() => {
                  if (friend.status === 'active') {
                    onSelectFriend(friend);
                    if (onCloseMobileDrawer) onCloseMobileDrawer();
                  }
                }}
                className={`p-3 rounded-2xl flex items-start gap-2.5 transition-all cursor-pointer group relative w-full ${
                  isSelected
                    ? 'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/90 ring-1 ring-stone-900/10'
                    : 'bg-white/80 hover:bg-white border border-stone-200/50 shadow-2xs'
                }`}
              >
                {/* 2D Avatar in orb ring */}
                <div className="relative shrink-0 p-0.5 rounded-full bg-white ring-1 ring-stone-200/80 shadow-2xs">
                  <Avatar2D config={friend.avatar} size="xs" />
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full animate-ping" />
                  )}
                </div>

                {/* Friend Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-semibold text-stone-900 truncate font-serif-letter">
                      {friend.name}, {friend.age}
                    </h3>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">
                      {(friend.location || 'Airspace').split(',')[0]}
                    </span>
                  </div>

                  {/* Delivery Status or snippet */}
                  {hasInTransit ? (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-mono border border-teal-200/60 inline-flex">
                      <Wind className="w-3 h-3 text-teal-600 animate-spin" />
                      <span>Bubble drifting (~12m)</span>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-stone-500 font-serif-letter line-clamp-1">
                      {friend.lastMessageSnippet || 'Stream calm & open...'}
                    </p>
                  )}

                  {/* Shared Hobbies Tags with Icons */}
                  <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                    {(friend.hobbies || []).slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1 text-[9px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md border border-stone-200/60"
                      >
                        <span>{HOBBY_ICONS[h] || '✦'}</span>
                        <span className="truncate max-w-[70px]">{h}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quiet Release / Restore Action */}
                <div className="shrink-0 self-center">
                  {friend.status === 'active' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFriendToConfirmRemove(friend);
                      }}
                      title="Release from orbit (quietly without notifying them)"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-all"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreFriend(friend.id);
                      }}
                      title="Restore to active orbit"
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stealth Remove Confirmation Modal */}
      {friendToConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
              <span className="text-base">🫧</span>
              <span>Release {friendToConfirmRemove.name} from orbit?</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-serif-letter">
              <strong>They will never be notified</strong> of this release.
              They will be moved to your Released circle, freeing up an active orbit slot
              ({activeFriends.length}/{MAX_FRIENDS}). You will not exchange further bubbles unless restored.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFriendToConfirmRemove(null)}
                className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRemoveFriend(friendToConfirmRemove.id);
                  setFriendToConfirmRemove(null);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs"
              >
                Release Orbit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER UTILITIES (Compact & Stable) */}
      <div className="p-2.5 sm:p-3 border-t border-stone-200/60 bg-white/70 backdrop-blur-md relative z-10 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <button
            onClick={onAccelerateWinds}
            title="Accelerate delivery for testing"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-teal-800 hover:bg-teal-50 transition-colors font-mono text-[10px]"
          >
            <FastForward className="w-3 h-3 text-teal-600" />
            <span>Accelerate Winds</span>
          </button>

          {currentUser.moderationWarningsCount > 0 ? (
            <div
              title="Community moderation warnings on account"
              className="flex items-center gap-1 text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{currentUser.moderationWarningsCount}/3 Warn</span>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-stone-400">
              Standing: Clean
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Large Screen Side Dock (Strict Fixed Width, No Expanding or Contracting) */}
      <aside className="hidden md:flex w-80 lg:w-84 min-w-[20rem] max-w-[21rem] shrink-0 h-[calc(100vh-6rem)] sticky top-20 rounded-3xl overflow-hidden border border-white/80 shadow-[0_16px_40px_-15px_rgba(180,165,150,0.2)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={onCloseMobileDrawer}
          />
          <div className="relative w-80 max-w-[85vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
