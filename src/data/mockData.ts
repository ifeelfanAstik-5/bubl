import {
  AvatarConfig,
  Friend,
  DirectMessage,
  BubblePost,
  UserProfile,
  BubbleTypeDefinition
} from '../types';

export const ALL_HOBBIES = [
  'Literature',
  'Cinema',
  'Coffee Brewing',
  'Stargazing',
  'Indie Music',
  'Vinyl Records',
  'Architecture',
  'Film Photography',
  'Ceramics',
  'Philosophy',
  'Botanical Gardening',
  'Poetry',
  'Baking',
  'Hiking & Mountains',
  'Watercolor Painting',
  'Board Games',
  'Language Learning',
  'Old Bookstores',
  'Folk Lore',
  'Tea Ceremonies',
  'Cycling',
  'Psychology'
];

export interface HobbyCategory {
  id: string;
  name: string;
  icon: string;
  hobbies: string[];
}

export const HOBBY_CATEGORIES: HobbyCategory[] = [
  {
    id: 'letters',
    name: 'Letters & Thought',
    icon: '📖',
    hobbies: ['Literature', 'Philosophy', 'Old Bookstores', 'Poetry', 'Psychology']
  },
  {
    id: 'living',
    name: 'Sensory & Slow Living',
    icon: '☕',
    hobbies: ['Coffee Brewing', 'Tea Ceremonies', 'Baking', 'Ceramics', 'Folk Lore']
  },
  {
    id: 'nature',
    name: 'Nature & Skies',
    icon: '✨',
    hobbies: ['Stargazing', 'Botanical Gardening', 'Hiking & Mountains', 'Cycling']
  },
  {
    id: 'arts',
    name: 'Analog & Visual Arts',
    icon: '🎞️',
    hobbies: ['Film Photography', 'Vinyl Records', 'Architecture', 'Watercolor Painting', 'Cinema']
  },
  {
    id: 'mind',
    name: 'Wonders & Learning',
    icon: '🧩',
    hobbies: ['Board Games', 'Language Learning', 'Indie Music']
  }
];

export const HOBBY_ICONS: Record<string, string> = {
  'Literature': '📖',
  'Cinema': '🎬',
  'Coffee Brewing': '☕',
  'Stargazing': '🌌',
  'Indie Music': '🎵',
  'Vinyl Records': '📻',
  'Architecture': '🏛️',
  'Film Photography': '📷',
  'Ceramics': '🏺',
  'Philosophy': '💭',
  'Botanical Gardening': '🌿',
  'Poetry': '🪶',
  'Baking': '🥐',
  'Hiking & Mountains': '⛰️',
  'Watercolor Painting': '🎨',
  'Board Games': '🎲',
  'Language Learning': '🗣️',
  'Old Bookstores': '📚',
  'Folk Lore': '📜',
  'Tea Ceremonies': '🍵',
  'Cycling': '🚲',
  'Psychology': '🧠'
};

export const THOUGHT_SPARKS = [
  {
    title: 'A forgotten local corner',
    prompt: 'Describe a quiet, uncelebrated corner in your city that most tourists or commuters walk right past.'
  },
  {
    title: 'The physical presence of books',
    prompt: 'What was the first book you fell in love with not just for its plot, but for its paper, smell, and tactile weight?'
  },
  {
    title: 'A craft or rabbit hole',
    prompt: 'Tell about a craft, science topic, or historical period you recently fell down a late-night rabbit hole exploring.'
  },
  {
    title: 'Morning anchoring ritual',
    prompt: 'What is a quiet morning routine or deliberate preparation that grounds your mental clarity before the day starts?'
  },
  {
    title: 'A perspective outgrown',
    prompt: 'What is an opinion or artistic taste you held firmly five years ago that you have since gently outgrown?'
  },
  {
    title: 'Soundscapes of the season',
    prompt: 'What acoustic soundscape outside your window or in your room brings you an instant sense of peace?'
  }
];

export const SENSITIVE_ANTI_DATING_KEYWORDS = [
  // Romantic & dating solicitation
  'dating',
  'date me',
  'hookup',
  'hook up',
  'single guy',
  'single girl',
  'single female',
  'single male',
  'seeking boyfriend',
  'seeking girlfriend',
  'looking for love',
  'looking for romance',
  'looking for soulmate',
  'looking for a partner',
  'cuddle',
  'kiss',
  'sexy',
  'hot girl',
  'hot guy',
  'babe',
  'bae',
  'sugar daddy',
  'sugar mommy',
  'marry me',
  'horny',
  'attractive',
  'lonely man',
  'lonely woman',
  'need a companion',
  'desperate',
  'flirt',
  'flirting',
  // Profanity & harassment
  'hate',
  'ugly',
  'stupid',
  'idiot',
  'kill'
];

export const BUBBLE_TYPES: BubbleTypeDefinition[] = [
  {
    id: 'thought',
    name: 'Thought Bubble',
    tagline: 'Deep written reflection',
    description: 'Long-form personal perspectives, book insights, crafts, and life philosophies.',
    icon: 'file-text',
    color: '#8D7B68',
    isStarterChoice: true,
    unlockRequirement: 'Available at start'
  },
  {
    id: 'echo',
    name: 'Echo Bubble',
    tagline: 'A poignant question to answer',
    description: 'Carries a single thoughtful question. Readers must answer the question to exchange thoughts.',
    icon: 'help-circle',
    color: '#4D7C9E',
    isStarterChoice: true,
    unlockRequirement: 'Available at start'
  },
  {
    id: 'resonance',
    name: 'Resonance Bubble',
    tagline: 'Tuned to shared passions',
    description: 'Encapsulated with a harmonic frequency. Can only be burst if you share matching hobbies.',
    icon: 'sparkles',
    color: '#D97757',
    isStarterChoice: false,
    unlockRequirement: 'Unlock by reaching Breath Level 2 or receiving one from a friend'
  },
  {
    id: 'lantern',
    name: 'Lantern Bubble',
    tagline: 'Midnight & dusk thoughts',
    description: 'Glows with quiet warmth for night owls, stargazers, and late-night thinkers.',
    icon: 'lamp',
    color: '#C4973B',
    isStarterChoice: false,
    unlockRequirement: 'Unlock after 7 days of steady, unhurried communications'
  },
  {
    id: 'ember',
    name: 'Slow Ember Bubble',
    tagline: 'A gentle patience capsule',
    description: 'A slow-burning bubble that asks for a moment of quiet meditation before unveiling its words.',
    icon: 'flame',
    color: '#B05D3B',
    isStarterChoice: false,
    unlockRequirement: 'Unlock by reaching Breath Level 3'
  },
  {
    id: 'haiku',
    name: 'Haiku & Verse Bubble',
    tagline: 'Rhythmic poetic verses',
    description: 'Minimalist 3-to-5 line poetry capturing a fleeting observation, weather, or season.',
    icon: 'feather',
    color: '#5E8B67',
    isStarterChoice: false,
    unlockRequirement: 'Unlock when a pen pal sends you a verse or through steady presence'
  }
];

export const BUBBLE_PALETTES = [
  { id: 'rose', name: 'Morning Mist Rose', tint: '#FDF0EC', border: '#F2C8BD', badge: '#D97757' },
  { id: 'sage', name: 'Quiet Sage Leaf', tint: '#EDF4EE', border: '#C0DBC4', badge: '#5E8B67' },
  { id: 'amber', name: 'Warm Amber Sun', tint: '#FCF7EB', border: '#EBD7A7', badge: '#C4973B' },
  { id: 'sky', name: 'Open Ocean Dusk', tint: '#EDF3F7', border: '#BDD4E3', badge: '#4D7C9E' },
  { id: 'lavender', name: 'Dusk Violet', tint: '#F5F0F7', border: '#D9C8DF', badge: '#825B96' }
];

export const INITIAL_USER: UserProfile = {
  id: 'me',
  nickname: 'Haruki',
  age: 26,
  pronouns: 'they/them',
  location: 'Kyoto, Japan',
  bio: 'Quiet observer of morning light, secondhand paperbacks, and dark roast pour-overs. Exchanging thoughtful letters on literature, bookbinding, and analog hobbies.',
  languages: ['English', 'Japanese'],
  hobbies: ['Literature', 'Coffee Brewing', 'Film Photography', 'Old Bookstores'],
  exchangeInterest: 'Literature & Analog Craft Discussions',
  avatar: {
    skinColor: '#F5D0C5',
    hairStyle: 'wavy',
    hairColor: '#3A2E2B',
    eyeStyle: 'calm',
    mouthStyle: 'subtle_smile',
    glassesStyle: 'round',
    clothingStyle: 'sweater',
    clothingColor: '#7A8B7B',
    bgTint: '#E8EFE9'
  },
  lastBubblePublishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  dailyBurstsRemaining: 2,
  dailyBurstsResetDate: new Date().toISOString().split('T')[0],
  burstBubbleIdsToday: ['bubble-1'],
  breathLevel: 2,
  breathExp: 22,
  dailyBreathEnergy: 85,
  unlockedBubbleTypes: ['thought', 'echo'],
  moderationWarningsCount: 0,
  suspendedUntil: null,
  moderationWarningsHistory: []
};

export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    name: 'Elena',
    age: 25,
    location: 'Florence, Italy',
    pronouns: 'she/her',
    bio: 'Conservator restoring 16th-century book bindings. Writing with iron gall ink on handmade rag paper.',
    languages: ['Italian', 'English'],
    hobbies: ['Literature', 'Old Bookstores', 'Ceramics', 'Tea Ceremonies'],
    exchangeInterest: 'Archival Bookbinding & Historical Literature',
    avatar: {
      skinColor: '#F7D9C4',
      hairStyle: 'curly',
      hairColor: '#5C3826',
      eyeStyle: 'gentle',
      mouthStyle: 'warm_grin',
      glassesStyle: 'wire',
      clothingStyle: 'cardigan',
      clothingColor: '#C48B71',
      bgTint: '#FBECE3'
    },
    status: 'active',
    distanceKm: 9850,
    mediaHandshake: {
      requestedByMe: true,
      requestedByThem: true,
      approvedByMe: true,
      approvedByThem: true
    },
    lastMessageSnippet: 'The marbling technique on this Venetian ledger used ox gall to repel the pigment...',
    lastMessageTime: Date.now() - 4 * 60 * 60 * 1000,
    unreadCount: 0
  },
  {
    id: 'friend-2',
    name: 'Julian',
    age: 28,
    location: 'Montreal, Canada',
    pronouns: 'he/him',
    bio: 'Tape-loop composer and analog synthesizer restorer. Interested in tape saturation and slow cinema pacing.',
    languages: ['French', 'English'],
    hobbies: ['Indie Music', 'Vinyl Records', 'Coffee Brewing', 'Cinema'],
    exchangeInterest: 'Acoustic Soundscapes & French Cinema Pacing',
    avatar: {
      skinColor: '#E8BEAC',
      hairStyle: 'classic',
      hairColor: '#2B2B2A',
      eyeStyle: 'curious',
      mouthStyle: 'subtle_smile',
      glassesStyle: 'none',
      clothingStyle: 'turtleneck',
      clothingColor: '#394A59',
      bgTint: '#E3ECFB'
    },
    status: 'active',
    distanceKm: 10400,
    mediaHandshake: {
      requestedByMe: false,
      requestedByThem: true,
      approvedByMe: false,
      approvedByThem: true
    },
    lastMessageSnippet: 'Your breakdown of Chris Marker’s "La Jetée" still photograph pacing made so much sense...',
    lastMessageTime: Date.now() - 18 * 60 * 1000,
    inTransitCount: 1,
    unreadCount: 0
  },
  {
    id: 'friend-3',
    name: 'Aoi',
    age: 24,
    location: 'Reykjavik, Iceland',
    pronouns: 'she/they',
    bio: 'Geothermal geophysicist and amateur astronomer. Tracking auroral sub-storms and dark winter constellations.',
    languages: ['Japanese', 'Icelandic', 'English'],
    hobbies: ['Stargazing', 'Baking', 'Hiking & Mountains', 'Philosophy'],
    exchangeInterest: 'Geophysics & Sub-Zero Night Observations',
    avatar: {
      skinColor: '#FBE0D0',
      hairStyle: 'bob',
      hairColor: '#1F1E24',
      eyeStyle: 'smiling',
      mouthStyle: 'subtle_smile',
      glassesStyle: 'round',
      clothingStyle: 'hoodie',
      clothingColor: '#4A6B6C',
      bgTint: '#E5F0ED'
    },
    status: 'active',
    distanceKm: 8700,
    mediaHandshake: {
      requestedByMe: false,
      requestedByThem: false,
      approvedByMe: false,
      approvedByThem: false
    },
    lastMessageSnippet: 'The solar wind hit the ionosphere at 450 km/s last night, creating pulsating green arcs...',
    lastMessageTime: Date.now() - 32 * 60 * 60 * 1000,
    unreadCount: 1
  },
  {
    id: 'friend-4',
    name: 'Mateo',
    age: 27,
    location: 'Oaxaca, Mexico',
    pronouns: 'he/him',
    bio: 'Documentary film photographer documenting traditional cochineal and indigo dye vats in the central valleys.',
    languages: ['Spanish', 'English'],
    hobbies: ['Film Photography', 'Ceramics', 'Coffee Brewing', 'Botanical Gardening'],
    exchangeInterest: 'Botanical Pigments & Medium Format Photography',
    avatar: {
      skinColor: '#C68642',
      hairStyle: 'wavy',
      hairColor: '#1E1917',
      eyeStyle: 'gentle',
      mouthStyle: 'warm_grin',
      glassesStyle: 'wire',
      clothingStyle: 'buttondown',
      clothingColor: '#B05D3B',
      bgTint: '#F7EBE1'
    },
    status: 'active',
    distanceKm: 11200,
    mediaHandshake: {
      requestedByMe: true,
      requestedByThem: false,
      approvedByMe: true,
      approvedByThem: false
    },
    lastMessageSnippet: 'Developing Tri-X in D-76 1:1 gives such distinct grain on the limestone wall textures...',
    lastMessageTime: Date.now() - 56 * 60 * 60 * 1000,
    unreadCount: 0
  }
];

export const INITIAL_DIRECT_MESSAGES: Record<string, DirectMessage[]> = {
  'friend-1': [
    {
      id: 'msg-101',
      conversationId: 'friend-1',
      senderId: 'friend-1',
      recipientId: 'me',
      title: 'Florentine paper marbling and book spine sewing',
      body: `I was sitting by the north workshop window trimming a 17th-century botanical volume. It made me reflect on what you mentioned about hand-grinding coffee beans as a tactile grounding practice.\n\nHere in Florence, paper conservation requires you to calibrate your breathing. If you pull a linen sewing thread too tight through the kettle stitches, the vellum folds pucker; if you leave it too loose, the text block sags.\n\nI wonder—what was the earliest book you remember loving not just for its words, but for the physical sensory feeling of turning its pages?`,
      sentAt: Date.now() - 24 * 60 * 60 * 1000,
      deliveryDurationMs: 15 * 60 * 1000,
      arrivalAt: Date.now() - 23 * 60 * 60 * 1000,
      isDelivered: true,
      breathEffort: 'gentle',
      mediaAttachments: [
        {
          id: 'media-1',
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          caption: 'Hand-sewn spine on aged Tuscan rag paper'
        }
      ]
    },
    {
      id: 'msg-102',
      conversationId: 'friend-1',
      senderId: 'me',
      recipientId: 'friend-1',
      title: 'Water-stained Sōseki and Demachiyanagi alleys',
      body: `Reading your note about vellum tension felt so restorative.\n\nFor me, it was a water-stained pocket edition of Sōseki’s "Kokoro" I found in an alley shop near Demachiyanagi. The previous reader had marked pencil lines next to sentences about the quiet friction between tradition and modern thought. The paper had oxidized into that warm amber shade.\n\nSince our media handshake is mutual, I’ve attached an audio clip of the evening drizzle falling on the cedar eaves outside my studio. I hope it brings a moment of focus to your conservation workbench.`,
      sentAt: Date.now() - 10 * 60 * 60 * 1000,
      deliveryDurationMs: 18 * 60 * 1000,
      arrivalAt: Date.now() - 9 * 60 * 60 * 1000,
      isDelivered: true,
      breathEffort: 'balanced',
      mediaAttachments: [
        {
          id: 'media-2',
          type: 'audio',
          url: '',
          caption: 'Evening Kyoto rain on cedar eaves (0:34)',
          durationOrSize: '0:34'
        }
      ]
    },
    {
      id: 'msg-103',
      conversationId: 'friend-1',
      senderId: 'friend-1',
      recipientId: 'me',
      title: 'Acoustics of rain across ten thousand kilometers',
      body: `Listening to the rain on your cedar roof while repairing a marbled flyleaf was sublime. It felt as though distance ceased to exist for half a minute.\n\nThe marbling technique on this Venetian ledger used ox gall to repel the pigment across the carrageenan moss bath. Have you ever tried Japanese suminagashi marbling? The concentric black rings on water seem closely related to your ink wash studies.`,
      sentAt: Date.now() - 4 * 60 * 60 * 1000,
      deliveryDurationMs: 15 * 60 * 1000,
      arrivalAt: Date.now() - 3 * 60 * 60 * 1000,
      isDelivered: true,
      breathEffort: 'deep'
    }
  ],
  'friend-2': [
    {
      id: 'msg-201',
      conversationId: 'friend-2',
      senderId: 'friend-2',
      recipientId: 'me',
      title: 'Tape degradation and ambient room acoustics',
      body: `I was splicing a quarter-inch tape loop of ambient keyboard improvisations when I burst your bubble. There is something fascinating about communication that travels deliberately across distance.\n\nWhen you record on vintage tape, you encounter natural tape compression and wow-and-flutter—imperfections that modern software algorithms try to iron out, but which provide psychological warmth and tangible presence.\n\nI’m curious what audio textures or instruments you find most evocative when reading late at night.`,
      sentAt: Date.now() - 12 * 60 * 1000,
      deliveryDurationMs: 25 * 60 * 1000,
      arrivalAt: Date.now() + 13 * 60 * 1000, // In transit
      isDelivered: false,
      breathEffort: 'gentle'
    }
  ],
  'friend-3': [
    {
      id: 'msg-301',
      conversationId: 'friend-3',
      senderId: 'friend-3',
      recipientId: 'me',
      title: 'Geothermal heat and sub-zero telescope mirrors',
      body: `Greetings from the southwestern coast of Iceland. The winter sun barely skims the southern horizon here, giving us extended twilight and deep dark hours.\n\nAt our observatory, the primary mirror has to cool slowly to match the sub-zero ambient mountain air so thermal expansion doesn’t distort the wavefront. Looking at distant planetary nebulae through that cold glass reminds me of how small yet fortunate our curiosity is.\n\nWhat is a natural phenomenon you have witnessed that made you pause in absolute silence?`,
      sentAt: Date.now() - 32 * 60 * 60 * 1000,
      deliveryDurationMs: 16 * 60 * 1000,
      arrivalAt: Date.now() - 31 * 60 * 60 * 1000,
      isDelivered: true,
      breathEffort: 'gentle'
    }
  ]
};

// 5 Curated Drifting Bubbles for Today's Airspace (Clean, idea & curiosity-driven, zero cringe/dating)
export const INITIAL_BUBBLES: BubblePost[] = [
  {
    id: 'bubble-1',
    authorId: 'penpal-claire',
    authorName: 'Claire',
    authorAge: 27,
    authorLocation: 'Edinburgh, Scotland',
    authorAvatar: {
      skinColor: '#FDF0E7',
      hairStyle: 'wavy',
      hairColor: '#B85D36',
      eyeStyle: 'curious',
      mouthStyle: 'warm_grin',
      glassesStyle: 'round',
      clothingStyle: 'sweater',
      clothingColor: '#455952',
      bgTint: '#E8EFEA'
    },
    title: 'Marginalia, pencil dashes, and second-hand histories',
    content: `I am writing this from a small booth at a railway station cafe where the tea comes in chipped ceramic mugs. Outside, the Scottish drizzle has turned the stone tenements the color of wet slate.\n\nI’ve spent the afternoon browsing the basement of an antiquarian bookseller in Old Town. What always fascinates me are previous readers’ pencil marks in the margins—an exclamation mark beside a paragraph on botany, a pressed oak leaf inside page 142, or a date scribbled in 1934.\n\nDo you ever leave pencil notes in your books, or do you preserve them pristine? What was the last marginal note you discovered that made you wonder about the stranger who read before you?`,
    hobbies: ['Literature', 'Old Bookstores', 'Indie Music', 'Poetry'],
    publishedAt: Date.now() - 14 * 60 * 60 * 1000,
    distanceKm: 9200,
    bubbleColor: '#FDF0EC',
    bubbleType: 'thought'
  },
  {
    id: 'bubble-2',
    authorId: 'penpal-kenji',
    authorName: 'Kenji',
    authorAge: 29,
    authorLocation: 'Kamakura, Japan',
    authorAvatar: {
      skinColor: '#F5D0C5',
      hairStyle: 'classic',
      hairColor: '#1A181B',
      eyeStyle: 'calm',
      mouthStyle: 'subtle_smile',
      glassesStyle: 'none',
      clothingStyle: 'turtleneck',
      clothingColor: '#353D42',
      bgTint: '#ECEFF1'
    },
    title: 'The mechanics of burr grinding and unhurried mornings',
    content: `Every Sunday morning at 6:30 AM, before the Enoshima coastal tram begins its schedule, I grind twenty grams of light-roast Ethiopian Yirgacheffe on a manual brass hand-grinder. The sound is like gravel crunching on a garden path.\n\nIn our hyper-efficient digital work life, everything is designed to save seconds. But the physical ritual of manually grinding beans—feeling the resistance of the coffee seeds, smelling the floral aroma release, watching the water bloom over the paper cone—anchors my mental focus for the week ahead.\n\nWhat is a slow, analog ritual in your weekly life that you refuse to automate?`,
    hobbies: ['Coffee Brewing', 'Tea Ceremonies', 'Architecture', 'Literature'],
    publishedAt: Date.now() - 28 * 60 * 60 * 1000,
    distanceKm: 380,
    bubbleColor: '#EDF4EE',
    bubbleType: 'echo',
    promptQuestion: 'What is a slow, analog ritual in your weekly life that you refuse to automate?'
  },
  {
    id: 'bubble-3',
    authorId: 'penpal-marina',
    authorName: 'Marina',
    authorAge: 25,
    authorLocation: 'Lisbon, Portugal',
    authorAvatar: {
      skinColor: '#F1C6A7',
      hairStyle: 'curly',
      hairColor: '#362419',
      eyeStyle: 'smiling',
      mouthStyle: 'warm_grin',
      glassesStyle: 'none',
      clothingStyle: 'cardigan',
      clothingColor: '#C97A59',
      bgTint: '#FCEFE9'
    },
    title: 'Mineral glazes, clay shrink rates, and wabi-sabi chemistry',
    content: `The tram climbs up the hill of Alfama, its wooden joints creaking under the sun. On the corners of residential alleys, blue azulejo tiles have survived three centuries of rain and salt air.\n\nIn our ceramic studio this week, we tested ash glazes fired in a wood reduction kiln. When you pull stoneware out of the cooling chamber, there are always crazing cracks and subtle color variations where the flame licked the clay body. Modern industrial manufacturing calls those defects; pottery masters see them as the breath of the kiln.\n\nThis is a Resonance Bubble. It can only be burst by those who share a love for ceramics, film photography, or craftsmanship. Tell me about an imperfect object in your living space that you cherish.`,
    hobbies: ['Ceramics', 'Film Photography', 'Baking', 'Philosophy'],
    publishedAt: Date.now() - 42 * 60 * 60 * 1000,
    distanceKm: 10800,
    bubbleColor: '#FCF7EB',
    bubbleType: 'resonance'
  },
  {
    id: 'bubble-4',
    authorId: 'penpal-soren',
    authorName: 'Søren',
    authorAge: 31,
    authorLocation: 'Copenhagen, Denmark',
    authorAvatar: {
      skinColor: '#FDE3D2',
      hairStyle: 'short',
      hairColor: '#C49767',
      eyeStyle: 'calm',
      mouthStyle: 'thoughtful',
      glassesStyle: 'wire',
      clothingStyle: 'sweater',
      clothingColor: '#3E4E59',
      bgTint: '#E8ECEF'
    },
    title: 'Dovetail joinery and the acoustic warmth of solid beechwood',
    content: `In Denmark we speak often of hygge, but to me it isn’t just candles and blankets. It is thoughtful craftsmanship—knowing that a chair or table was made with honest joinery that will outlive several generations of owners.\n\nI spend my working days hand-chiseling mortise-and-tenon joints in European beechwood. Wood is a living material; it contracts with dry winter heating and expands with coastal summer moisture. You have to design tolerances that honor its natural breathing.\n\nThis Lantern Bubble was released under the midnight stars. What album or piece of acoustic music would you put on while sketching or working on a quiet project?`,
    hobbies: ['Architecture', 'Vinyl Records', 'Indie Music', 'Cycling'],
    publishedAt: Date.now() - 50 * 60 * 60 * 1000,
    distanceKm: 8900,
    bubbleColor: '#EDF3F7',
    bubbleType: 'lantern'
  },
  {
    id: 'bubble-5',
    authorId: 'penpal-leila',
    authorName: 'Leila',
    authorAge: 26,
    authorLocation: 'Melbourne, Australia',
    authorAvatar: {
      skinColor: '#D8A07A',
      hairStyle: 'bun',
      hairColor: '#1A181B',
      eyeStyle: 'curious',
      mouthStyle: 'subtle_smile',
      glassesStyle: 'round',
      clothingStyle: 'buttondown',
      clothingColor: '#5E7465',
      bgTint: '#EDF2EE'
    },
    title: 'Three lines on Saturn’s Cassini Division and quiet stargazing',
    content: `Cold brass eyepiece turns,\nIce rings tilt beneath the dark—\nWonder silences.\n\nI volunteer on Thursday evenings at the public telescope in the botanical gardens. When visitors look through the eyepiece at Saturn’s rings for the first time, almost everyone goes silent before whispering a quiet "Oh."\n\nThat "Oh" is my favorite human sound. It is genuine wonder without cynicism. If you also look up at the night sky and feel humbled by the scale of the cosmos, burst this Haiku Bubble and tell me what celestial observation or night landscape moves you most.`,
    hobbies: ['Stargazing', 'Botanical Gardening', 'Psychology', 'Hiking & Mountains'],
    publishedAt: Date.now() - 65 * 60 * 60 * 1000,
    distanceKm: 8100,
    bubbleColor: '#F5F0F7',
    bubbleType: 'haiku'
  }
];

export const INITIAL_USER_PUBLISHED_BUBBLES: BubblePost[] = [
  {
    id: 'user-bubble-1',
    authorId: 'me',
    authorName: 'Haruki',
    authorAge: 26,
    authorLocation: 'Kyoto, Japan',
    authorAvatar: INITIAL_USER.avatar,
    title: 'Herons along the Kamogawa and the art of deliberate observation',
    content: `I live near the Kamogawa river, where grey herons stand completely motionless in the shallow currents for twenty minutes waiting for the right moment. It has taught me a lot about patience and observational stillness.\n\nI work with second-hand books and spend my evenings studying printmaking and brewing dark pour-overs. I love exchanging long-form thoughts with pen pals around the world on books, regional traditions, and creative crafts.\n\nIf you find joy in the small, uncelebrated details of your week, burst my bubble and tell me what is outside your window right now.`,
    hobbies: ['Literature', 'Coffee Brewing', 'Old Bookstores', 'Film Photography'],
    publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    distanceKm: 0,
    bubbleColor: '#EDF4EE',
    bubbleType: 'thought',
    isUserBubble: true
  }
];
