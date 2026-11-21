/**
 * ─────────────────────────────────────────────────────────────────────────
 *  INVITATION CONFIGURATION
 *  Every word, name, date, color, photo and setting lives here.
 *  ALL CONTENT BELOW IS SAMPLE / PLACEHOLDER CONTENT — replace it with the
 *  couple's real details before sending the link.
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Files in /public. Write paths from the site root ('/photos/x.jpg'); this adds the
 * deploy folder automatically (e.g. /kumbida/ on GitHub Pages).
 */
export const asset = (path: string) => {
  const base = import.meta.env.BASE_URL;
  if (!path || /^(https?:|data:|blob:)/.test(path) || (base !== '/' && path.startsWith(base))) return path;
  return base + path.replace(/^\//, '');
};

export type StoryIllustration = 'meet' | 'date' | 'proposal' | 'forever';

export interface StoryMoment {
  title: string;
  when: string;
  text: string;
  note: string; // small handwritten annotation beside the photo
  photo?: string; // e.g. asset('/photos/meet.jpg') — leave empty for an illustrated placeholder
  illustration: StoryIllustration;
}

export interface Venue {
  label: string;
  date: string;
  time: string;
  name: string;
  address: string[];
  /** Optional explicit Google Maps link. If empty, a search link is built from the address. */
  mapsUrl?: string;
}

export interface FilmMoment {
  title: string;
  caption: string;
  /** Still image for the frame, e.g. '/photos/beach.jpg' */
  photo?: string;
  /** Short clip (MP4/H.264, ideally < 3 MB, ~10 s, 720p). Loaded only when opened. */
  video?: string;
  /** Optional voice message from the couple (MP3/M4A). */
  voice?: string;
  illustration: StoryIllustration;
}

export interface Secret {
  title: string;
  body: string;
  signoff?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  note?: string;
}

export type Phase = 'before' | 'day' | 'after';

export interface Swatch {
  name: string;
  hex: string;
}

export const invitation = {
  couple: {
    one: { first: 'Amelia', full: 'Amelia Rose Navarro' },
    two: { first: 'Julian', full: 'Julian Andres Villanueva' },
    /** Letters pressed into the wax seal and monogram. */
    initials: ['A', 'J'] as [string, string],
  },

  wedding: {
    /** Used for the countdown. Include the venue's UTC offset. */
    iso: '2027-06-12T15:00:00+08:00',
    weekday: 'Saturday',
    day: '12',
    month: 'June',
    year: '2027',
    short: '06 · 12 · 2027',
    timeWords: 'at three o’clock in the afternoon',
    venueShort: 'Casa Alegria Garden Chapel',
    cityShort: 'Tagaytay City, Cavite',
  },

  wording: {
    envelopeTitle: 'A Special Invitation',
    envelopeHint: 'Tap to open',
    /** Shown on the envelope when the link has ?to=Guest%20Name */
    envelopeFor: 'Prepared for',
    together: 'Together with our families',
    invite: 'joyfully invite you to celebrate their wedding',
    swipeHint: 'Swipe or tap the arrows to turn the page',
    closing: 'We cannot wait to celebrate the beginning of forever with you.',
    closingSignoff: 'With all our love,',
  },

  /** Personal greeting for links with ?to=Name.  {name} is replaced. */
  greeting: {
    line: 'Dear {name}, we would be delighted to have you celebrate with us.',
  },

  /** Short cinematic opening shown after the envelope opens (always skippable). */
  intro: {
    enabled: true,
    /** Optional MP4 (H.264, muted, <= 20 s, <= 4 MB). Empty = animated typographic film. */
    video: asset('/video/intro.mp4'),
    poster: asset('/photos/field.jpg'),
    lines: ['Every love story is beautiful,', 'but ours is our favourite.'],
    skipLabel: 'Skip',
    replayLabel: 'Watch our little film',
  },

  story: {
    heading: 'Our Story',
    subheading: 'eight years, one great love',
    dragHint: 'psst… you can move these',
    ticket: {
      kind: 'Admit Two',
      event: 'Our First Date',
      place: 'Cinema 3 · Greenbelt, Makati',
      date: 'Aug 17, 2019',
      seat: 'Row F · Seats 11 & 12',
    },
    collage: [
      { caption: 'the day we met', illustration: 'meet', photo: asset('/photos/gaze.jpg') },
      { caption: 'first adventure', illustration: 'date', photo: asset('/photos/walk.jpg') },
    ] as { caption: string; illustration: StoryIllustration; photo?: string }[],
    filmHeading: 'Little moments',
    filmHint: 'tap a frame',
    film: [
      { title: 'Golden hour', caption: 'The light that evening was everything.', illustration: 'date', photo: asset('/photos/field.jpg') },
      { title: 'That smile', caption: 'Still the best view in any room.', illustration: 'meet', photo: asset('/photos/smile.jpg') },
      { title: 'Hand in hand', caption: 'Wherever this road goes, together.', illustration: 'proposal', photo: asset('/photos/together.jpg') },
      { title: 'Our little film', caption: 'Ten seconds of us — press play.', illustration: 'forever', photo: asset('/photos/sunset.jpg'), video: asset('/video/intro.mp4') },
    ] as FilmMoment[],
    letter: {
      label: 'Read on the night he asked',
      hint: 'tap to unfold',
      to: 'My Amelia,',
      body: 'Eight years ago you laughed at my terrible joke in a café line, and I have been chasing that laugh ever since. You are my calm and my adventure. Will you marry me?',
      signoff: 'Forever yours,',
      from: 'Julian',
    },
    moments: [
      {
        title: 'How we met',
        when: 'March 2019',
        text: 'A long café line in Makati, one spilled latte, and a joke that somehow worked.',
        note: 'the very first hello',
        illustration: 'meet',
      },
      {
        title: 'Our first date',
        when: 'August 2019',
        text: 'A movie neither of us remembers — we talked through dinner until closing.',
        note: 'coffee turned into dinner',
        illustration: 'date',
      },
      {
        title: 'The proposal',
        when: 'December 2025',
        text: 'Sunset over Taal Lake, a handwritten letter, and the easiest yes.',
        note: 'she said yes!',
        illustration: 'proposal',
      },
      {
        title: 'Forever begins',
        when: 'June 2027',
        text: 'And now, the next chapter — with all of you beside us.',
        note: 'see you there',
        illustration: 'forever',
      },
    ] as StoryMoment[],
  },

  details: {
    heading: 'The Details',
    ceremony: {
      label: 'The Ceremony',
      date: 'Saturday, June 12, 2027',
      time: '3:00 in the afternoon',
      name: 'Casa Alegria Garden Chapel',
      address: ['Aguinaldo Highway, Brgy. Maitim II West', 'Tagaytay City, Cavite'],
      mapsUrl: '',
    } as Venue,
    reception: {
      label: 'The Reception',
      date: 'Saturday, June 12, 2027',
      time: '6:00 in the evening',
      name: 'The Glasshouse at Villa Florentina',
      address: ['Calamba Road, Brgy. Sungay East', 'Tagaytay City, Cavite'],
      mapsUrl: '',
    } as Venue,
    directionsLabel: 'Open in Google Maps',
  },

  entourage: {
    heading: 'The Entourage',
    parents: {
      oneLabel: 'Parents of the Bride',
      one: ['Mr. Ricardo M. Navarro', 'Mrs. Teresita D. Navarro'],
      twoLabel: 'Parents of the Groom',
      two: ['Mr. Fernando L. Villanueva', 'Mrs. Carmela S. Villanueva'],
    },
    honor: {
      oneLabel: 'Maid of Honor',
      one: 'Ms. Bianca Navarro',
      twoLabel: 'Best Man',
      two: 'Mr. Miguel Villanueva',
    },
    attendants: {
      oneLabel: 'Bridesmaids',
      one: ['Ms. Patricia Reyes', 'Ms. Andrea Lim', 'Ms. Sofia Mendoza', 'Ms. Kristine Garcia'],
      twoLabel: 'Groomsmen',
      two: ['Mr. Paolo Santos', 'Mr. Carlo Dizon', 'Mr. Rafael Cruz', 'Mr. Joshua Tan'],
    },
    principalSponsorsLabel: 'Principal Sponsors',
    /** Listed in pairs: [left column, right column] */
    principalSponsors: [
      ['Mr. Antonio Ramos', 'Mrs. Lourdes Ramos'],
      ['Hon. Eduardo Castillo', 'Mrs. Rosario Castillo'],
      ['Dr. Manuel Aquino', 'Dra. Isabel Aquino'],
      ['Mr. Roberto Lim', 'Mrs. Grace Lim'],
      ['Engr. Victor Salazar', 'Mrs. Marites Salazar'],
    ] as [string, string][],
    secondarySponsorsLabel: 'Secondary Sponsors',
    secondarySponsors: [
      { role: 'Candle', names: ['Mr. Daniel Navarro', 'Ms. Camille Villanueva'] },
      { role: 'Veil', names: ['Mr. Gabriel Ocampo', 'Ms. Nicole Ocampo'] },
      { role: 'Cord', names: ['Mr. Lorenzo Bautista', 'Ms. Hannah Bautista'] },
    ],
  },

  dressCode: {
    heading: 'Dress Code',
    style: 'Formal Garden Attire',
    ladies: { label: 'Ladies', text: 'Long gowns or midi dresses in soft, romantic tones.' },
    gentlemen: { label: 'Gentlemen', text: 'Barong Tagalog or a suit in neutral or sage.' },
    paletteLabel: 'Our palette',
    palette: [
      { name: 'Sage', hex: '#A5AA91' },
      { name: 'Dusty Rose', hex: '#D8B9B2' },
      { name: 'Champagne', hex: '#E8DCC8' },
      { name: 'Olive', hex: '#6B7158' },
      { name: 'Taupe', hex: '#B8A894' },
    ] as Swatch[],
    avoidLabel: 'Kindly avoid',
    avoid: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Bright Red', hex: '#C8312C' },
      { name: 'Neon', hex: '#C6F432' },
    ] as Swatch[],
    note: 'White and ivory are lovingly reserved for the bride.',
  },

  rsvp: {
    heading: 'Kindly Reply',
    deadline: 'May 1, 2027',
    /** Max seats when the link has no ?seats= value. */
    maxGuests: 2,
    acceptLabel: 'Joyfully accepts',
    declineLabel: 'Regretfully declines',
    submitLabel: 'Send my reply',
    thankYouAccept: 'Your seat is saved. We can’t wait to celebrate with you!',
    thankYouDecline: 'You will be missed dearly. Thank you for letting us know.',
    alreadyReplied: 'We already have your reply — thank you!',
  },

  music: {
    /** Path to an audio file in /public, e.g. '/music/ambient.mp3'. Empty = generated music box. */
    src: '',
    volume: 0.45,
    /** Begin playing when the envelope is opened (that tap counts as user interaction). */
    startOnOpen: false,
    label: 'Ambient music',
    title: 'Golden Hour Waltz',
    artist: 'music box for A & J',
  },

  /** Save-the-date calendar + "Add to calendar" */
  calendar: {
    heading: 'Save the Date',
    eventTitle: 'Wedding of Amelia & Julian',
    /** End of the celebration (used for calendar files). */
    endIso: '2027-06-12T23:00:00+08:00',
    location: 'Casa Alegria Garden Chapel, Aguinaldo Highway, Tagaytay City, Cavite',
    description: 'Ceremony at 3:00 PM, reception at 6:00 PM at The Glasshouse at Villa Florentina. We cannot wait to celebrate with you.',
    addLabel: 'Add to calendar',
  },

  /** Shown on the wedding day itself. */
  weddingDay: {
    greeting: 'Today is the day!',
    sub: 'We are so happy you are here to celebrate with us.',
    scheduleHeading: 'Today’s Schedule',
    schedule: [
      { time: '2:30 PM', title: 'Guests arrive', note: 'Casa Alegria Garden Chapel' },
      { time: '3:00 PM', title: 'Ceremony' },
      { time: '4:30 PM', title: 'Photos & cocktails' },
      { time: '6:00 PM', title: 'Reception & dinner', note: 'The Glasshouse' },
      { time: '8:00 PM', title: 'First dance & party' },
    ] as ScheduleItem[],
  },

  /** After the wedding, the invitation becomes a thank-you card. */
  thankYou: {
    envelopeTitle: 'With Heartfelt Thanks',
    heading: 'Thank You',
    message: 'Thank you for celebrating the beginning of our forever. Your love made the day complete.',
    photos: [
      { caption: 'golden hour', photo: asset('/photos/gaze.jpg'), illustration: 'proposal' },
      { caption: 'just married', photo: asset('/photos/walk.jpg'), illustration: 'forever' },
      { caption: 'forever', photo: asset('/photos/sunset.jpg'), illustration: 'meet' },
    ] as { caption: string; photo?: string; illustration: StoryIllustration }[],
  },

  guestbook: {
    heading: 'Guestbook',
    sub: 'Leave us a few words to keep forever',
    placeholder: 'Write your wishes, advice, or a favourite memory…',
    shareLabel: 'Amelia & Julian may share my message in their wedding slideshow',
    privacyNote: 'Only Amelia & Julian can read the guestbook.',
    submitLabel: 'Sign the guestbook',
    thanks: 'Pressed into our keepsake book — thank you!',
    maxPerDevice: 3,
  },

  /** Hidden surprises — each is found by tapping a small detail. */
  secrets: {
    heart: {
      title: 'A secret love note',
      body: 'You still make my heart skip like it did in that café line. I would choose you in every lifetime.',
      signoff: '— A.',
    } as Secret,
    flower: {
      title: 'Pressed from a memory',
      body: 'A sampaguita from our first walk in Tagaytay. Julian picked it, I kept it, and it has lived in my journal ever since.',
    } as Secret,
    envelope: {
      title: 'For you, dear guest',
      body: 'Every person on this list helped make us who we are. Thank you for loving us so well — this day is yours too.',
      signoff: 'With love, A & J',
    } as Secret,
    explorer: {
      title: 'You found them all',
      body: 'You read every single page! Find Julian at the reception and say “golden hour” — there’s a little gift waiting for you.',
      signoff: '♡',
    } as Secret,
    foundLabel: 'secrets found',
    explorerHint: 'A sealed note appears for those who read every page…',
  },

  reactions: {
    label: 'Send love',
  },

  theme: {
    colors: {
      ivory: '#FAF7F0',
      champagne: '#E8DCC8',
      sage: '#A5AA91',
      rose: '#D8B9B2',
      gold: '#C6A46C',
      olive: '#414638',
      ink: '#3A3D33',
    },
    /** Wax seal colors (light → dark). */
    wax: ['#8B9274', '#5F664C', '#3F4533'] as [string, string, string],
  },

  pageLabels: {
    invitation: 'Invitation',
    savedate: 'Save the Date',
    story: 'Our Story',
    moments: 'Scrapbook',
    film: 'Little Moments',
    letter: 'The Letter',
    details: 'Ceremony',
    reception: 'Reception',
    entourage: 'Entourage',
    sponsors: 'Sponsors',
    attire: 'Dress Code',
    rsvp: 'RSVP',
    guestbook: 'Guestbook',
    farewell: 'Until Then',
    ps: 'P.S.',
    thanks: 'Thank You',
  },
  /** Which inserts appear before, on, and after the wedding day. */
  pageOrder: {
    before: ['invitation', 'savedate', 'story', 'moments', 'film', 'letter', 'details', 'reception', 'entourage', 'sponsors', 'attire', 'rsvp', 'guestbook', 'farewell', 'ps'],
    day: ['invitation', 'savedate', 'details', 'reception', 'entourage', 'sponsors', 'attire', 'story', 'moments', 'film', 'guestbook', 'farewell', 'ps'],
    after: ['thanks', 'film', 'moments', 'story', 'letter', 'guestbook', 'farewell', 'ps'],
  } as Record<Phase, PageId[]>,
};

export type PageId =
  | 'invitation'
  | 'savedate'
  | 'story'
  | 'moments'
  | 'film'
  | 'letter'
  | 'details'
  | 'reception'
  | 'entourage'
  | 'sponsors'
  | 'attire'
  | 'rsvp'
  | 'guestbook'
  | 'farewell'
  | 'ps'
  | 'thanks';
