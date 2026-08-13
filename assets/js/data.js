/* ============================================================
   BRAND NEW DAY — schedule + gallery data
   Schedule source: official camp Time Table poster
   Types: session | worship | meal | fun | logistics
   ============================================================ */

window.SCHEDULE = [
  {
    id: 'fri',
    day: 'Friday',
    label: 'Arrival',
    date: '14 August 2026',
    ymd: [2026, 7, 14],
    items: [
      { s: [17, 0],  time: '5:00 PM',  title: 'Departure from church', type: 'logistics',
        meta: 'Assemble at Christos Mar Thoma Church, Kakkanad' },
      { s: [19, 30], time: 'Dinner',   title: 'Dinner on the way',     type: 'meal',
        meta: 'Halt en route to Thekkady' },
      { s: [20, 30], time: '8:30 PM',  title: 'Reach venue, room allotment & rest', type: 'logistics',
        meta: 'Mar Thoma Meadows, Thekkady' }
    ]
  },
  {
    id: 'sat',
    day: 'Saturday',
    label: 'Main Day',
    date: '15 August 2026',
    ymd: [2026, 7, 15],
    items: [
      { s: [7, 0],  e: [9, 0],   time: '7:00 – 9:00 AM',   title: 'Trekking + Morning Bible Class', type: 'session', speaker: 'Rev. Vijay' },
      { s: [9, 0],  e: [10, 0],  time: '9:00 – 10:00 AM',  title: 'Flag hoisting + Breakfast',      type: 'meal',    meta: 'Independence Day' },
      { s: [10, 0], e: [10, 30], time: '10:00 – 10:30 AM', title: 'Singing Session',                type: 'worship', meta: 'Songbook — Session 1' },
      { s: [10, 30], e: [11, 30], time: '10:30 – 11:30 AM', title: 'Main Session I',                type: 'session', speaker: 'Rev. Blesson' },
      { s: [11, 30], e: [11, 45], time: '11:30 – 11:45 AM', title: 'Tea Break',                     type: 'meal' },
      { s: [11, 45], e: [12, 45], time: '11:45 – 12:45 PM', title: 'Main Session II',               type: 'session', speaker: 'Rev. Blesson' },
      { s: [12, 45], e: [13, 0],  time: '12:45 – 1:00 PM',  title: 'Intercessory Prayer',           type: 'worship' },
      { s: [13, 0],  e: [14, 0],  time: '1:00 – 2:00 PM',   title: 'Lunch',                         type: 'meal' },
      { s: [14, 30], e: [17, 30], time: '2:30 – 5:30 PM',   title: 'Sightseeing',                   type: 'fun',     meta: 'Around Thekkady' },
      { s: [17, 30], e: [18, 30], time: '5:30 – 6:30 PM',   title: 'Freshen up time',               type: 'logistics' },
      { s: [18, 30], e: [19, 30], time: '6:30 – 7:30 PM',   title: 'Worship & Evening Devotion',    type: 'worship', meta: 'Songbook — Session 3' },
      { s: [19, 30], e: [20, 0],  time: '7:30 – 8:00 PM',   title: 'Evening Bible Class & Q&A',     type: 'session', speaker: 'Rev. Jebin' },
      { s: [20, 0],  e: [21, 0],  time: '8:00 – 9:00 PM',   title: 'Dinner (Barbecue)',             type: 'meal' },
      { s: [21, 0],  e: [22, 0],  time: '9:00 – 10:00 PM',  title: 'Campfire + Talent Night',       type: 'fun' },
      { s: [22, 0],               time: '10:00 PM',         title: 'Lights off',                    type: 'logistics' }
    ]
  },
  {
    id: 'sun',
    day: 'Sunday',
    label: 'Closing',
    date: '16 August 2026',
    ymd: [2026, 7, 16],
    items: [
      { s: [7, 30],  e: [8, 0],   time: '7:30 – 8:00 AM',   title: 'Meditation',                 type: 'worship' },
      { s: [8, 0],   e: [10, 0],  time: '8:00 – 10:00 AM',  title: 'Holy Communion Service',     type: 'worship' },
      { s: [10, 0],  e: [11, 0],  time: '10:00 – 11:00 AM', title: 'Breakfast + Group Photo',    type: 'meal' },
      { s: [11, 0],  e: [11, 30], time: '11:00 – 11:30 AM', title: 'Singing',                    type: 'worship', meta: 'Songbook — Dedication' },
      { s: [11, 30], e: [12, 30], time: '11:30 – 12:30 PM', title: 'Devotion: “Youth Challenges”', type: 'session', speaker: 'Rev. Matthew Philip' },
      { s: [12, 30],              time: '12:30 PM',         title: 'Lunch & Departure',          type: 'meal' }
    ]
  }
];

/* ------------------------------------------------------------
   Messages from the church — shown on the home page, right after
   "The Message". Vicar first, then the Assistant Vicar.

   `photo` is a square portrait in assets/img/. If the file is not
   there yet the card falls back to initials rather than showing a
   broken image, so nothing looks broken while you gather them.
   ------------------------------------------------------------ */
window.MESSAGES = [
  {
    name: 'Rev. Baby John',
    role: 'Vicar, Kakkanad Christos Mar Thoma Church',
    photo: 'assets/img/msg-babyjohn.jpg',
    lead: 'Youth Camp 2026 · “Brand New Day” · 2 Corinthians 5:17',
    quote: 'My dear young friends, it is a joy to greet you as you gather at Mar Thoma Meadows for these three days. ' +
           'Each of you comes carrying something — a fear, a doubt, a failure you would rather forget. Leave it at the Cross, ' +
           'and walk through the door He has already opened for you. Come with open hearts, listen well, and care for one another. ' +
           'May the Lord who makes all things new bless you, and may you return home lighted, to lighten.'
  },
  {
    name: 'Rev. Blesson Philip Thomas',
    role: 'Co-Minister, Kakkanad Christos Mar Thoma Church',
    photo: 'assets/img/msg-blesson.jpg',
    lead: 'Youth Camp 2026 · “Brand New Day” · 2 Corinthians 5:17',
    quote: 'Dear young friends, may this Youth Camp be a fresh beginning, renewing our faith, purpose, and commitment in Christ. ' +
           'As we embrace the “Brand New Day,” let us remember that in Christ, we are a new creation. ' +
           'May God bless each one of you and make this camp a joyful and transformative experience!'
  }
];

/* Photos live in assets/img/sp-*.jpg — 4:5 portraits cropped from the
   originals. Keep name ↔ photo pairings in step if you swap any out. */
window.SPEAKERS = [
  { name: 'Rev. Blesson',       role: 'Main Sessions I & II',
    photo: 'assets/img/sp-blesson.jpg',
    note: 'Saturday morning — the two core sessions on the camp theme.' },

  { name: 'Rev. Vijay',         role: 'Morning Bible Class',
    photo: 'assets/img/sp-vijay.jpg',
    note: 'Saturday sunrise trek and the opening Bible study.' },

  { name: 'Rev. Jebin',         role: 'Evening Bible Class & Q&A',
    photo: 'assets/img/sp-jebin.jpg',
    note: 'Saturday night — open floor for your questions.' },

  { name: 'Rev. Matthew Philip', role: 'Closing Devotion',
    photo: 'assets/img/sp-matthew.jpg',
    note: '“Youth Challenges” — the Sunday send-off message.' },
   
   { name: 'Jaivee',             role: 'Activity',
    photo: 'assets/img/sp-jaivee.jpg',
    note: 'The Activity time of the camp — the heart of Brand New Day.' }
];

/* ------------------------------------------------------------
   Gallery — the page is currently removed from the site.
   This data is kept so it can be restored without redoing the work:
     git checkout cddfb95 -- gallery.html assets/js/gallery.js
   then put the nav links back in the three pages and in site.js MENU.
   ------------------------------------------------------------
   To add your own camp photos/videos, drop the files into
   assets/img/gallery/ (or assets/video/) and add an entry here:

     { type: 'photo', src: 'assets/img/gallery/my-photo.jpg',
       cap: 'Caption', tag: 'Saturday', size: 'tall' }

     { type: 'video', src: 'assets/video/campfire.mp4',
       poster: 'assets/img/gallery/campfire.jpg',
       cap: 'Campfire night', tag: 'Saturday' }

   size: 'tall' | 'wide' | omitted (normal)
   ------------------------------------------------------------ */
window.GALLERY = [
  { type: 'photo', src: 'assets/img/ph-ridges.jpg',    cap: 'Ridge lines at first light',  tag: 'Trek',        size: 'wide' },
  { type: 'photo', src: 'assets/img/poster.jpg',       cap: 'Brand New Day — camp poster', tag: 'Camp' },
  { type: 'photo', src: 'assets/img/ph-campfire.jpg',  cap: 'Campfire night',              tag: 'Fellowship' },
  { type: 'photo', src: 'assets/img/ph-bible.jpg',     cap: 'Morning in the Word',         tag: 'Bible Class', size: 'tall' },
  { type: 'photo', src: 'assets/img/ph-stars.jpg',     cap: 'Lights off, 10 PM',           tag: 'Fellowship',  size: 'wide' },
  { type: 'photo', src: 'assets/img/ph-dusk.jpg',      cap: 'Dusk over the Ghats',         tag: 'Trek' },
  { type: 'photo', src: 'assets/img/ph-bible2.jpg',    cap: 'Open book, open door',        tag: 'Bible Class' },
  { type: 'photo', src: 'assets/img/ph-campfire2.jpg', cap: 'Embers',                      tag: 'Worship',     size: 'tall' },
  { type: 'photo', src: 'assets/img/ph-ridges2.jpg',   cap: 'Mist in the valley',          tag: 'Trek' }
];

/* How many "waiting for your photos" placeholder tiles to show */
window.GALLERY_PLACEHOLDERS = 4;
