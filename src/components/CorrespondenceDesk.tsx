import React, { useState } from 'react';
import { Friend, DirectMessage, MediaAttachment, UserProfile } from '../types';
import { Avatar2D } from './Avatar2D';
import { playBreezeBlowingSound } from '../services/soundEffects';
import {
  Send,
  Lock,
  Unlock,
  Image,
  Mic,
  Video,
  Clock,
  MapPin,
  ChevronLeft,
  ShieldCheck,
  Play,
  Volume2,
  Wind,
  Sparkles
} from 'lucide-react';

interface CorrespondenceDeskProps {
  friend: Friend;
  currentUser: UserProfile;
  messages: DirectMessage[];
  onBack: () => void;
  onSendMessage: (data: {
    title?: string;
    body: string;
    breathEffort?: 'gentle' | 'balanced' | 'deep';
    mediaAttachments?: MediaAttachment[];
  }) => void;
  onRequestMediaHandshake: (friendId: string) => void;
  onApproveMediaHandshake: (friendId: string) => void;
}

export const CorrespondenceDesk: React.FC<CorrespondenceDeskProps> = ({
  friend,
  currentUser,
  messages,
  onBack,
  onSendMessage,
  onRequestMediaHandshake,
  onApproveMediaHandshake
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [breathEffort, setBreathEffort] = useState<'gentle' | 'balanced' | 'deep'>('gentle');
  const [pendingAttachments, setPendingAttachments] = useState<MediaAttachment[]>([]);
  const [sampleAudioPlaying, setSampleAudioPlaying] = useState<string | null>(null);

  const handshake = friend.mediaHandshake;
  const isMediaFullyUnlocked = handshake.approvedByMe && handshake.approvedByThem;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || body.trim().length < 5) return;

    playBreezeBlowingSound();
    onSendMessage({
      title: title.trim() || undefined,
      body: body.trim(),
      breathEffort,
      mediaAttachments: pendingAttachments.length > 0 ? pendingAttachments : undefined
    });

    setTitle('');
    setBody('');
    setPendingAttachments([]);
  };

  const handleAddSampleMedia = (type: 'photo' | 'audio' | 'video') => {
    if (!isMediaFullyUnlocked) return;

    if (type === 'photo') {
      const newPhoto: MediaAttachment = {
        id: `att-${Date.now()}`,
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?auto=format&fit=crop&w=800&q=80',
        caption: 'Morning mist over the cedar forest'
      };
      setPendingAttachments([...pendingAttachments, newPhoto]);
    } else if (type === 'audio') {
      const newAudio: MediaAttachment = {
        id: `att-${Date.now()}`,
        type: 'audio',
        url: '',
        caption: 'Voice note: Kyoto evening temple bells (0:28)',
        durationOrSize: '0:28'
      };
      setPendingAttachments([...pendingAttachments, newAudio]);
    } else if (type === 'video') {
      const newVideo: MediaAttachment = {
        id: `att-${Date.now()}`,
        type: 'video',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        caption: 'Short clip: Waves rolling onto black sand (0:12)',
        durationOrSize: '0:12'
      };
      setPendingAttachments([...pendingAttachments, newVideo]);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#FAF8F5] via-[#F7F3ED] to-[#F3EDE5] rounded-3xl border border-white/90 shadow-[0_16px_40px_-15px_rgba(180,165,150,0.18)] flex flex-col h-[750px] overflow-hidden relative">
      {/* Top Atmosphere Bar */}
      <div className="p-4 md:p-5 border-b border-stone-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-stone-200/60 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="relative p-0.5 rounded-full bg-white ring-2 ring-white/90 shadow-2xs">
            <Avatar2D config={friend.avatar} size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[8px] shadow-2xs">
              🫧
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-900 font-serif-letter">
                {friend.name}, {friend.age}
              </h2>
              <span className="text-xs text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                <Wind className="w-3 h-3 text-teal-600" />
                ~{friend.distanceKm.toLocaleString()} km away
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{friend.location}</span>
              <span className="text-stone-300">·</span>
              <span className="truncate max-w-[220px] text-stone-600">{friend.exchangeInterest}</span>
            </div>
          </div>
        </div>

        {/* Media Handshake Orb Pill */}
        <div className="flex items-center gap-2">
          {isMediaFullyUnlocked ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-medium shadow-2xs">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Media Stream Open</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 border border-stone-200/60 rounded-full text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Media Gated</span>
            </div>
          )}
        </div>
      </div>

      {/* Handshake Notification Banner */}
      {!isMediaFullyUnlocked && (
        <div className="bg-amber-50/90 border-b border-amber-200/70 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 relative z-10 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {handshake.requestedByThem && !handshake.approvedByMe
                ? `${friend.name} requested mutual media exchange (photos, voice notes, video).`
                : handshake.requestedByMe && !handshake.approvedByThem
                ? `You requested mutual media permission. Waiting for ${friend.name}'s approval.`
                : 'Mutual media handshake required before either user can exchange sound or imagery.'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {handshake.requestedByThem && !handshake.approvedByMe ? (
              <button
                onClick={() => onApproveMediaHandshake(friend.id)}
                className="px-3 py-1 bg-stone-900 text-white rounded-full text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
              >
                Accept Handshake
              </button>
            ) : !handshake.requestedByMe ? (
              <button
                onClick={() => onRequestMediaHandshake(friend.id)}
                className="px-3 py-1 bg-stone-900 text-white rounded-full text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
              >
                Request Media Handshake
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Messages Stream: Floating Bubble Pods */}
      <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6 bg-gradient-to-b from-[#F9F6F0]/80 via-[#F6F2EC]/60 to-[#F2EBE3]/80">
        {messages.length === 0 ? (
          <div className="p-10 text-center bg-white/70 backdrop-blur-xs rounded-3xl border border-dashed border-stone-300 max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-3 text-xl shadow-xs">
              🫧
            </div>
            <h3 className="text-sm font-semibold text-stone-900 font-serif-letter">
              The Stream Awaits Your First Thought
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Blow a message into the wind stream below. It will travel across distance and
              arrive with gentle, contemplative pacing.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const now = Date.now();
            const isInTransit = !msg.isDelivered && msg.arrivalAt > now;
            const remainingMins = Math.max(
              1,
              Math.ceil((msg.arrivalAt - now) / (60 * 1000))
            );

            return (
              <div
                key={msg.id}
                className={`max-w-2xl mx-auto rounded-3xl p-5 md:p-6 shadow-[0_8px_25px_-6px_rgba(0,0,0,0.06)] relative transition-all border ${
                  isMe
                    ? 'bg-gradient-to-br from-amber-50/90 to-orange-50/70 border-amber-200/70 ml-auto'
                    : 'bg-white/90 border-stone-200/80 mr-auto'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-200/40">
                  <div className="flex items-center gap-2.5">
                    <Avatar2D
                      config={isMe ? currentUser.avatar : friend.avatar}
                      size="sm"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900">
                        {isMe ? 'You' : friend.name}
                      </h4>
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(msg.sentAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 border border-stone-200/50 text-stone-600">
                    {isInTransit ? '🌬️ DRIFTING' : '🫧 RESTING'}
                  </span>
                </div>

                {/* In Transit Display */}
                {isInTransit ? (
                  <div className="my-5 p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-2xl border border-sky-200/80 text-center space-y-1.5 backdrop-blur-xs">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-900 font-mono">
                      <Wind className="w-4 h-4 text-teal-600 animate-spin" />
                      <span>BUBBLE IN FLIGHT</span>
                    </div>
                    <p className="text-xs text-teal-800 leading-relaxed font-serif-letter">
                      Floating across air currents. Arriving in <strong>{remainingMins} minutes</strong>.
                      Deliberate pacing gives space for reflection.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Message Body */}
                    <div className="pt-3.5 space-y-2">
                      {msg.title && (
                        <h3 className="text-base font-semibold text-stone-900 tracking-tight font-serif-letter">
                          {msg.title}
                        </h3>
                      )}
                      <div className="text-stone-800 text-sm leading-relaxed font-serif-letter whitespace-pre-line">
                        {msg.body}
                      </div>
                    </div>

                    {/* Media Attachments */}
                    {msg.mediaAttachments && msg.mediaAttachments.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-stone-200/50 space-y-3">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                          Mutual Resonance Media
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.mediaAttachments.map((media) => (
                            <div
                              key={media.id}
                              className="p-3 bg-white/80 rounded-2xl border border-stone-200/80 text-xs space-y-2 shadow-2xs"
                            >
                              {media.type === 'photo' && (
                                <div>
                                  <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100 relative mb-1.5">
                                    <img
                                      src={media.url}
                                      alt={media.caption || 'Attached photo'}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  {media.caption && (
                                    <p className="text-[11px] text-stone-600 font-serif-letter italic">
                                      {media.caption}
                                    </p>
                                  )}
                                </div>
                              )}

                              {media.type === 'audio' && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-50 to-indigo-50/60 rounded-xl border border-sky-200/70">
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSampleAudioPlaying(
                                            sampleAudioPlaying === media.id
                                              ? null
                                              : media.id
                                          )
                                        }
                                        className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow-2xs"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                      </button>
                                      <div>
                                        <span className="font-medium text-stone-800 block text-xs">
                                          Sound Bubble
                                        </span>
                                        <span className="text-[10px] text-stone-500 font-mono">
                                          {media.durationOrSize || '0:34'}
                                        </span>
                                      </div>
                                    </div>
                                    <Volume2 className="w-4 h-4 text-sky-600" />
                                  </div>
                                  {media.caption && (
                                    <p className="text-[11px] text-stone-600 font-serif-letter italic">
                                      {media.caption}
                                    </p>
                                  )}
                                </div>
                              )}

                              {media.type === 'video' && (
                                <div>
                                  <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-900 relative mb-1.5 flex items-center justify-center">
                                    <img
                                      src={media.url}
                                      alt="Video thumbnail"
                                      className="w-full h-full object-cover opacity-70"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-md">
                                      <Play className="w-4 h-4 text-stone-900 fill-current ml-0.5" />
                                    </div>
                                  </div>
                                  {media.caption && (
                                    <p className="text-[11px] text-stone-600 font-serif-letter italic">
                                      {media.caption}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Permanent Record Footer */}
                <div className="mt-4 pt-3 border-t border-stone-200/40 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>PERMANENT FLIGHT</span>
                  <span>PRESERVED IN ORBIT</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Breath Composer */}
      <form
        onSubmit={handleSend}
        className="p-4 md:p-5 border-t border-stone-200/70 bg-white/80 backdrop-blur-md space-y-3.5 relative z-10"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-stone-500 uppercase flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>BLOW INTO STREAM</span>
          </span>

          {/* Media Attach Buttons */}
          {isMediaFullyUnlocked ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAddSampleMedia('photo')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                title="Attach Photo"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleMedia('audio')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                title="Attach Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleMedia('video')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                title="Attach Video Clip"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-stone-400">
              Media sharing locked until mutual handshake
            </span>
          )}
        </div>

        {/* Pending media chips */}
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-[#FAF8F5] rounded-xl border border-stone-200 text-xs">
            {pendingAttachments.map((att, i) => (
              <span
                key={att.id}
                className="px-2.5 py-1 bg-white rounded-lg text-stone-700 flex items-center gap-1.5 font-mono text-[11px] border border-stone-200 shadow-2xs"
              >
                <span>{att.type.toUpperCase()}: {att.caption || 'Attachment'}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPendingAttachments(
                      pendingAttachments.filter((_, idx) => idx !== i)
                    )
                  }
                  className="text-stone-400 hover:text-stone-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Thought title or theme (optional)"
          className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-stone-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
        />

        {/* Breath Effort Controls */}
        <div className="flex items-center justify-between gap-2 p-2 bg-[#FAF8F5] rounded-xl text-xs border border-stone-200/50">
          <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Breath Effort:</span>
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            {[
              { id: 'deep', label: 'Deep Calm (~18m)', xp: '+15 XP' },
              { id: 'gentle', label: 'Steady (~15m)', xp: '+10 XP' },
              { id: 'balanced', label: 'Swift Breeze (~10m)', xp: '+5 XP' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBreathEffort(b.id as any)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  breathEffort === b.id
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="flex items-end gap-3">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Send thoughtful words into the breeze for ${friend.name}...`}
            className="flex-1 p-3.5 text-xs md:text-sm bg-[#FAF8F5] border border-stone-200/80 rounded-2xl font-serif-letter focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none leading-relaxed"
          />

          <button
            type="submit"
            disabled={body.trim().length < 5}
            className="px-5 py-3.5 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl font-medium text-xs hover:from-teal-900 hover:to-stone-900 transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Blow (~15m)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
