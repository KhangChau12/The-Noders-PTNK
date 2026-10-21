/**
 * Single source of truth for contests and courses: homepage, /contest,
 * /education and their detail pages all read from here. Update numbers here
 * only — they used to be typed separately on each page and drifted apart.
 *
 * Problem statements and timelines are copied from the competition platform
 * (the-noders-competition-platform); standings from the final leaderboards.
 */

const STORAGE = 'https://qaiziusbqefdgnebbocm.supabase.co/storage/v1/object/public/images/e72a4551-46a2-40c3-a9b9-ac91540e5003'

export const CONTEST_PLATFORM_URL = 'https://the-noders-competition-platform.vercel.app/'

export interface StandingRow {
  name: string
  /** Secondary column. */
  a: string
  /** Primary column — the score the ranking uses. */
  b: string
}

export interface ResultRow {
  name: string
  team?: string
  public: number | null
  private: number | null
  /** The ranking score: average of both rounds (PAIC) or the single MAE (NAIC). */
  score: number | null
  submissions: number
}

export interface TimelinePhase {
  label: string
  dates: string
  /** Relative width on the timeline strip (≈ days). */
  span: number
  tone: 'muted' | 'workshop' | 'public' | 'private'
}

export interface Contest {
  slug: string
  shortName: string
  title: string
  year: string
  kind: 'Public' | 'Internal'
  status: 'upcoming' | 'open' | 'ended'
  endedOn: string
  /** ISO date the contest ended — used to place results on member timelines. */
  endedISO: string
  description: string
  /** One or two sentences for the detail-page intro. */
  pitch: string
  task: string
  metric: string
  meta: { label: string; value: string }[]
  facts: { value: string; label: string }[]
  standings: { caption: string; nameCol: string; colA: string; colB: string; rows: StandingRow[] }
  winners: { place: string; name: string; note: string; score?: string }[]
  extraAwards?: string
  problem: {
    summary: string
    why: string
    fields: { name: string; desc: string }[]
    input: string
    output: string
    submission: string
  }
  timeline: TimelinePhase[]
  /** Story told by the public→private chart. Only for two-round contests. */
  raceTakeaway?: string
  results: { teams?: ResultRow[]; individuals: ResultRow[]; rankedBy: string; note: string }
  rules: string[]
  prizes: { award: string; amount: string }[]
  prizeTotal?: string
  datasetUrl: string
  /** This contest's page on the competition platform. */
  platformUrl: string
  postSlug?: string
  postLabel: string
  video: { url: string; label: string }
  coverImage: string
}

const PAIC_TEAMS: ResultRow[] = [
  ['Mango', 0.4103, 0.415, 0.4126, 127],
  ['Lực Hướng Tâm', 0.4119, 0.4276, 0.4197, 74],
  ['Tuianhchaphet', 0.4175, 0.4297, 0.4236, 103],
  ['Ép oăn - Ti oăn', 0.4169, 0.433, 0.425, 113],
  ['kothanglamcho', 0.4264, 0.4461, 0.4362, 72],
  ['Chồn Nghệ Tây', 0.4298, 0.4537, 0.4417, 133],
  ['Synapse', 0.4326, 0.451, 0.4418, 95],
  ['Nước Tương Tam Thái Tử', 0.5039, 0.5142, 0.509, 14],
  ["Don't mind us", 0.4588, 0.5594, 0.5091, 12],
  ['Three Little Wolves', 0.4855, 0.543, 0.5143, 36],
  ['Nynee', 0.5351, 0.8731, 0.7041, 6],
].map(([name, pub, priv, avg, subs]) => ({
  name: name as string,
  public: pub as number,
  private: priv as number,
  score: avg as number,
  submissions: subs as number,
}))

const PAIC_INDIVIDUALS: ResultRow[] = [
  ['Phan Xuân Khoa', 'Mango', 0.413, 0.415, 0.414, 25],
  ['Cao Tùng Lâm', 'Mango', 0.4103, 0.4227, 0.4165, 102],
  ['Đoàn Thiên An', 'Lực Hướng Tâm', 0.4119, 0.4276, 0.4197, 74],
  ['Lê Trường Minh Đăng', 'Tuianhchaphet', 0.4175, 0.4297, 0.4236, 49],
  ['Vũ Nguyễn Khánh Ngọc', 'Ép oăn - Ti oăn', 0.4169, 0.433, 0.425, 69],
  ['Trương Bảo Khang', 'Tuianhchaphet', 0.4287, 0.4406, 0.4346, 54],
  ['Ngụy Mỹ Linh', 'Ép oăn - Ti oăn', 0.4281, 0.445, 0.4365, 32],
  ['Phạm Quốc Bình', 'kothanglamcho', 0.4298, 0.4461, 0.4379, 51],
  ['Nguyễn Hoàng Anh', 'Chồn Nghệ Tây', 0.4298, 0.4537, 0.4417, 76],
  ['Lâm Gia Phúc Nguyên', 'Synapse', 0.4326, 0.451, 0.4418, 83],
  ['Cam Duy Minh', 'Chồn Nghệ Tây', 0.4342, 0.4581, 0.4461, 33],
  ['Nguyễn Ngọc Minh Tâm', 'Ép oăn - Ti oăn', 0.5373, 0.4646, 0.501, 12],
  ['Đỗ Lê Chí Hùng', 'Nước Tương Tam Thái Tử', 0.5039, 0.5142, 0.509, 10],
  ['Tạ Hầu Việt Long', "Don't mind us", 0.4588, 0.5594, 0.5091, 9],
  ['Chu Quang Nam', 'Three Little Wolves', 0.4855, 0.5501, 0.5178, 31],
  ['Phạm Đình Hải Nam', 'Three Little Wolves', 0.4933, 0.543, 0.5182, 5],
  ['Đào Ngọc Minh Tâm', "Don't mind us", 0.471, 0.6127, 0.5419, 3],
  ['Trần Duy Phát', 'Nynee', 0.5351, 0.8731, 0.7041, 6],
  ['Phạm Phương Thảo', 'Nước Tương Tam Thái Tử', 0.8501, 0.7996, 0.8248, 4],
].map(([name, team, pub, priv, avg, subs]) => ({
  name: name as string,
  team: team as string,
  public: pub as number,
  private: priv as number,
  score: avg as number,
  submissions: subs as number,
}))

const NAIC_INDIVIDUALS: ResultRow[] = [
  ['Nguyễn Vũ Trọng Nhân', 0.3487, 5],
  ['Trương Hoàng Tấn Dũng', 0.4511, 36],
  ['Châu Phúc Khang', 0.4563, 11],
  ['Đoàn Văn Quyết', 0.482, 14],
  ['Đào Ngọc Minh Tâm', 0.4862, 4],
  ['Nguyễn Ngọc Minh Tâm', 0.521, 12],
  ['Nguyễn Ngô Minh Dương', 0.5285, 2],
  ['Đặng Trần Thiên Phúc', 0.5683, 1],
  ['Huỳnh Quang Phú', 0.6454, 3],
  ['Lê Minh Trung', 0.8159, 1],
  ['Hồ Bảo Phúc', 0.8451, 2],
  ['Hà Lan Viên', 0.8939, 1],
  ['Trần Phúc Thái', 0.9067, 1],
  ['Việt Tiến', 0.9148, 1],
  ['Trần Hoàng Thiên Phúc', 1.3554, 1],
].map(([name, mae, subs]) => ({
  name: name as string,
  public: mae as number,
  private: null,
  score: mae as number,
  submissions: subs as number,
}))

const AES_FIELDS = [
  { name: 'prompt', desc: 'The question the candidate answered' },
  { name: 'essay', desc: "The candidate's written response" },
  { name: 'image_description', desc: 'Task 1 chart description — optional' },
  { name: 'overall_score', desc: 'The label: band 1.0 – 9.0' },
]

export const CONTESTS: Contest[] = [
  {
    slug: 'paic-2026',
    shortName: 'PAIC 2026',
    title: 'PTNK AI Challenge 2026',
    year: '2026',
    kind: 'Public',
    status: 'ended',
    endedOn: '18 Jan 2026',
    endedISO: '2026-01-18',
    description:
      'Our first contest open to every student at High School for the Gifted VNUHCM. Teams built models that score IELTS Writing essays the way an examiner would.',
    pitch:
      '54 students in teams of up to three built models to grade IELTS essays like a human examiner. The score that counted came from data nobody had seen.',
    task: 'IELTS Writing essay scoring',
    metric: 'MAE, lower is better',
    meta: [
      { label: 'Dates', value: '05–18 Jan' },
      { label: 'Participants', value: '54' },
      { label: 'Teams', value: '25' },
      { label: 'Submissions', value: '891' },
      { label: 'Prize pool', value: '2.0M ₫' },
    ],
    facts: [
      { value: '54', label: 'participants' },
      { value: '25', label: 'teams' },
      { value: '891', label: 'submissions' },
      { value: '2 weeks', label: 'of competition' },
      { value: '2.0M ₫', label: 'prize pool' },
    ],
    standings: {
      caption: 'Final team standings (top 5) · ranked by average MAE',
      nameCol: 'Team',
      colA: 'Public',
      colB: 'Average',
      rows: PAIC_TEAMS.slice(0, 5).map((r) => ({ name: r.name, a: r.public!.toFixed(4), b: r.score!.toFixed(4) })),
    },
    winners: [
      { place: '1', name: 'Mango', note: 'First prize · 1,000,000 ₫', score: '0.4126' },
      { place: '2', name: 'Lực Hướng Tâm', note: 'Second prize · 500,000 ₫', score: '0.4197' },
      { place: '3', name: 'Tuianhchaphet · Ép oăn – Ti oăn · kothanglamcho', note: 'Third prize, shared · 100,000 ₫ each' },
    ],
    extraAwards: 'Best individual: Phan Xuân Khoa (Mango) · Best Noders member: Nguyễn Ngọc Minh Tâm',
    problem: {
      summary: 'Build an automated essay scorer: given an IELTS writing prompt and a candidate’s essay, predict the band a human examiner gave it.',
      why: 'The point is speed and objectivity for learners — a score in seconds instead of waiting for a teacher. The training set is real IELTS essays with the examiners’ marks.',
      fields: [...AES_FIELDS, { name: '4 sub-scores', desc: 'Task response, lexical resource, coherence, grammar' }],
      input: 'Prompt + essay (+ optional image description)',
      output: 'One real number — the predicted band',
      submission: 'CSV · max 5 MB · 30 per day',
    },
    timeline: [
      { label: 'Registration', dates: '28 Dec – 3 Jan', span: 7, tone: 'muted' },
      { label: 'Workshop', dates: '4 Jan', span: 1, tone: 'workshop' },
      { label: 'Public round', dates: '5 – 17 Jan', span: 13, tone: 'public' },
      { label: 'Private', dates: '18 Jan', span: 2, tone: 'private' },
    ],
    raceTakeaway:
      'Every team scored worse once the hidden test set opened. Mango won because its model held up best — it slipped just 0.005, the smallest drop in the top ten.',
    results: {
      teams: PAIC_TEAMS,
      individuals: PAIC_INDIVIDUALS,
      rankedBy: 'Ranked by the average of public and private MAE.',
      note: '11 of 25 teams scored in both rounds; the rest are on the platform’s full board.',
    },
    rules: [
      'Online, teams of 1–3. One team per student, fixed once the contest starts.',
      'Public round — training data and a public test set; instant grading and a provisional ranking.',
      'Private round — more data opens and the test set changes; 24 hours to submit a final model.',
      'Final rank = average of the two rounds. AI coding assistants were allowed.',
    ],
    prizes: [
      { award: 'First', amount: '1,000,000 ₫' },
      { award: 'Second', amount: '500,000 ₫' },
      { award: 'Third ×3 teams', amount: '100,000 ₫ each' },
      { award: 'Best individual · Best Noders member', amount: '100,000 ₫ each' },
    ],
    prizeTotal: '2,000,000 ₫',
    datasetUrl: 'https://drive.google.com/drive/folders/14F5hYYbTxPKHaQQLo1j7QMnDXbZgDXLx?usp=drive_link',
    platformUrl: `${CONTEST_PLATFORM_URL}competitions/e51e4314-854d-4a80-8520-044bf8b069e0`,
    postSlug: 'paic-2026-closing-a-season-opening-a-new-journey',
    postLabel: 'Recap post',
    video: { url: 'https://www.youtube.com/watch?v=cFs5njLot7k', label: 'Workshop video' },
    coverImage: `${STORAGE}/1776093425717-rzbla2qi7se.png`,
  },
  {
    slug: 'naic-2025',
    shortName: 'NAIC 2025',
    title: 'Noders AI Challenge 2025',
    year: '2025',
    kind: 'Internal',
    status: 'ended',
    endedOn: '28 Dec 2025',
    endedISO: '2025-12-28',
    description:
      'The practice ground where it started: club members tackled the same essay-scoring problem individually, with tutorials for first-timers.',
    pitch:
      'Our first contest, for club members only: score IELTS essays with a model you build yourself. A month-long practice run before PAIC opened to the whole school.',
    task: 'IELTS Writing essay scoring',
    metric: 'MAE, lower is better',
    meta: [
      { label: 'Dates', value: '29 Nov–28 Dec' },
      { label: 'Participants', value: '16' },
      { label: 'Format', value: 'Individual' },
      { label: 'Prize pool', value: '450K ₫' },
    ],
    facts: [
      { value: '16', label: 'members took part' },
      { value: '1 month', label: 'single public round' },
      { value: '0.3487', label: 'winning MAE' },
    ],
    standings: {
      caption: 'Final individual standings (top 5)',
      nameCol: 'Participant',
      colA: 'Submissions',
      colB: 'MAE',
      rows: NAIC_INDIVIDUALS.slice(0, 5).map((r) => ({ name: r.name, a: String(r.submissions), b: r.score!.toFixed(4) })),
    },
    winners: [
      { place: '1', name: 'Nguyễn Vũ Trọng Nhân', note: '1st place · 200,000 ₫', score: '0.3487' },
      { place: '2', name: 'Trương Hoàng Tấn Dũng', note: '2nd place · 100,000 ₫', score: '0.4511' },
      // Per the issued bronze certificates (C0002–C0004). Note C0002 went to Nguyễn Ngọc Minh Tâm (6th), not Đào Ngọc Minh Tâm (5th) — confirm.
      { place: '3', name: 'Châu Phúc Khang · Đoàn Văn Quyết · Nguyễn Ngọc Minh Tâm', note: '3rd place ×3 · 50,000 ₫ each' },
    ],
    problem: {
      summary: 'Build an automated essay scorer: given an IELTS writing prompt and a candidate’s essay, predict the band a human examiner gave it.',
      why: 'A first, low-pressure run at the AI-contest format, with detailed tutorials so members new to machine learning could train their first model.',
      fields: AES_FIELDS,
      input: 'Prompt + essay (+ optional image description)',
      output: 'One real number — the predicted band',
      submission: 'CSV · max 5 MB · 15 per day',
    },
    timeline: [
      { label: 'Registration', dates: '28 Nov', span: 2, tone: 'muted' },
      { label: 'Public round', dates: '28 Nov – 28 Dec', span: 30, tone: 'public' },
    ],
    results: {
      individuals: NAIC_INDIVIDUALS,
      rankedBy: 'Ranked by MAE on the test set.',
      note: 'The baseline model (MAE 0.9149) is not shown.',
    },
    rules: [
      'Individual, members of The Noders only. Mandatory for the AI team, open to everyone else.',
      'One public round with live ranking on the platform.',
      'The top 4 had to submit their notebooks for verification before receiving prizes.',
    ],
    prizes: [
      { award: '1st place', amount: '200,000 ₫' },
      { award: '2nd place', amount: '100,000 ₫' },
      { award: '3rd place ×3', amount: '50,000 ₫ each' },
    ],
    prizeTotal: '450,000 ₫',
    datasetUrl: 'https://drive.google.com/drive/folders/1ByBi-SbnVHHq_dHeb6I-akE4hFI0bXu6?usp=drive_link',
    platformUrl: `${CONTEST_PLATFORM_URL}competitions/28f402dd-6e61-4d7f-816f-d802e1478679`,
    postSlug: 'introducing-the-competition-naic-2025-the-first-contest-by-the-noders',
    postLabel: 'Announcement post',
    video: { url: 'https://www.youtube.com/watch?v=zN5i0p9qJqI', label: 'Rules & Q&A video' },
    coverImage: `${STORAGE}/1776068967393-u3aloa8idd.png`,
  },
]

export function getContest(slug: string) {
  return CONTESTS.find((c) => c.slug === slug) ?? null
}

/** Lowercase, strip Vietnamese diacritics — leaderboards use accented names, profiles don't. */
export function normalizeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export interface MemberContestResult {
  contest: Contest
  rank: number
  of: number
  score: number
  submissions: number
}

/** A member's individual results across all contests, matched by full name. */
export function contestResultsFor(fullName?: string | null): MemberContestResult[] {
  if (!fullName) return []
  const key = normalizeName(fullName)
  return CONTESTS.flatMap((contest) => {
    const rows = contest.results.individuals
    const i = rows.findIndex((r) => normalizeName(r.name) === key)
    if (i < 0 || rows[i].score == null) return []
    return [{ contest, rank: i + 1, of: rows.length, score: rows[i].score!, submissions: rows[i].submissions }]
  })
}

/** Fill in when the next contest is announced; null shows "No contest open". */
export const NEXT_CONTEST: { name: string; when: string; href: string; open: boolean } | null = null

export interface CourseSession {
  n: number
  title: string
  goal: string
  topics: string[]
  date: string
  pillar: string
  tools: string
  topicGroups: { title: string; items: string[] }[]
  materials: { slides?: string; video?: string; notes?: string; notebook?: string }
}

export interface Course {
  slug: string
  title: string
  shortTitle: string
  partner?: string
  kind: string
  status: 'upcoming' | 'open' | 'ended'
  description: string
  audience: string
  format: string
  when: string
  ran: string
  coverImage: string
  coverAlt: string
  slidesUrl?: string
  announcementSlug?: string
  sessions: CourseSession[]
}

export const COURSES: Course[] = [
  {
    slug: 'ds-and-ai-01',
    title: 'Introduction to Data Science and Artificial Intelligence',
    shortTitle: 'Intro to Data Science & AI',
    partner: 'PRISEE',
    kind: 'Mini-course',
    status: 'ended',
    description:
      'A first look at the three pillars of data — tables, images and text — and the workflow that turns each into a working model.',
    audience: 'Grades 10–11',
    format: '4 × 90 min',
    when: 'April 2026',
    ran: '5 – 15 Apr 2026',
    coverImage: `${STORAGE}/1776147889640-bs2qgkwanb4.png`,
    coverAlt: 'Session 1 title slide: Data Science thinking and the big picture',
    slidesUrl: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view',
    announcementSlug: 'prisee-x-the-noders-data-science-and-artificial-intelligence-course-for-beginners',
    sessions: [
      {
        n: 1,
        title: 'Data Science thinking & the standard workflow',
        goal: 'The big picture, and how professionals actually work with data.',
        topics: ['Data science vs analytics', 'the 3 pillars', 'collect → clean → model → visualise', 'case study: IELTS scores'],
        date: 'Sun 5 Apr',
        pillar: 'Foundations',
        tools: 'Thinking & workflow',
        topicGroups: [
          { title: 'Overview', items: ['What data science is, and how it differs from analytics', 'The 3 pillars: tables, vision, NLP'] },
          { title: 'Standard workflow', items: ['Collection & pre-processing', 'Modelling & visualisation'] },
          { title: 'Case study', items: ['Analysing IELTS scores'] },
        ],
        materials: {
          slides: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view',
          video: 'https://www.youtube.com/watch?v=vGEgixKR8lA',
          notes: 'https://docs.google.com/document/d/e/2PACX-1vSkZwunwjs_JaDrjxMIAKNRTq-unp00QmxSDL6_e6aeiQJppYmVmKdo48udm4KYGehPcRW7ZcDaGAVd/pub',
        },
      },
      {
        n: 2,
        title: 'Processing & visualising tabular data',
        goal: 'Get comfortable with the everyday tools for data in tables.',
        topics: ['SQL queries', 'cleaning with Pandas', 'charts that answer a question'],
        date: 'Wed 8 Apr',
        pillar: 'Tables',
        tools: 'SQL · Pandas · Matplotlib',
        topicGroups: [
          { title: 'The tool kit', items: ['SQL to pull data out of a database', 'Pandas to process it', 'Matplotlib to chart it'] },
          { title: 'Hands-on', items: ['Basic SQL queries', 'Cleaning data with Pandas', 'Charts that answer a question'] },
        ],
        materials: {
          slides: 'https://www.canva.com/design/DAG5xorKDtg/I5_Ma3gPGtLuC4CXcnyWrw/view',
          video: 'https://www.youtube.com/watch?v=81h3Bysu6oc',
          notes: 'https://docs.google.com/document/d/e/2PACX-1vSKQSyxomwwYJQ4XooC-cBqGKJsaFwOzTtVRwBQPDIt6osNxrzj_LJDd9Sj8mnbD_3RqPxE6oG8Gdau/pub',
          notebook: 'https://colab.research.google.com/drive/1An4g-yczGnwz75e0B7Akpezzz8G1XrGX?usp=sharing',
        },
      },
      {
        n: 3,
        title: 'Computer vision & first machine learning',
        goal: 'Treat images as numbers, then teach a model to classify them.',
        topics: ['pixel matrices', 'resize & grayscale', 'KNN', 'intro to CNNs', 'handwritten digits'],
        date: 'Sun 12 Apr',
        pillar: 'Images',
        tools: 'KNN · CNN',
        topicGroups: [
          { title: 'Image fundamentals', items: ['Images as pixel matrices', 'Pre-processing: resize, grayscale'] },
          { title: 'Algorithms', items: ['KNN and how it classifies', 'An introduction to CNNs and deep learning'] },
          { title: 'Practice', items: ['Handwritten digit recognition'] },
        ],
        materials: {
          slides: 'https://www.canva.com/design/DAG6gEMB0TM/jGfQyCUd3g1brWst6WF_9w/view',
          video: 'https://www.youtube.com/watch?v=jSQLXLTBEhE',
          notes: 'https://docs.google.com/document/d/e/2PACX-1vSA4oO7kdPIkTDd5OUd0bMxwBMkqLhU27y5eR9iz2ymTjPUQRCvDpQ6DTGO4Xl_fK1IcyV6ZVlkfgAW/pub',
          notebook: 'https://colab.research.google.com/drive/1lD1AMTLALgHB4AQ8DjQ94N3iBSpeACoO?usp=sharing',
        },
      },
      {
        n: 4,
        title: 'Language processing & evaluating models',
        goal: 'Turn text into features, and choose the right way to judge a model.',
        topics: ['tokenisation', 'BoW, TF-IDF, embeddings', 'accuracy vs F1', 'choosing a metric'],
        date: 'Wed 15 Apr',
        pillar: 'Text',
        tools: 'TF-IDF · embeddings · F1',
        topicGroups: [
          { title: 'NLP fundamentals', items: ['Text cleaning & tokenisation', 'BoW, TF-IDF and word embeddings'] },
          { title: 'Evaluating models', items: ['Key metrics: accuracy, F1 and more', 'Choosing a metric for the context'] },
        ],
        materials: {
          slides: 'https://www.canva.com/design/DAG8VnHsx_8/99IxQ-xH48xY4hfG9USddg/view',
          video: 'https://www.youtube.com/watch?v=TvU_e2Kvp_Y',
          notes: 'https://docs.google.com/document/d/e/2PACX-1vScKMjc_YQMo-s-3-8wdkhTGyg8-0yN4ti52thiyH3EQ1B6sb6FP4pGI8kMI4iY2Q5jmsB6qjFxK56U/pub',
          notebook: 'https://colab.research.google.com/drive/1zKTsGbxZC97R6mrROg6V4F5hZKPDGmW6?usp=sharing',
        },
      },
    ],
  },
]

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug) ?? null
}

/** Fill in when the next course is announced; null shows "No course enrolling". */
export const NEXT_COURSE: { name: string; when: string; href: string; open: boolean } | null = null

/** Totals derived from the data above (used by the homepage facts row). */
export const PROGRAM_TOTALS = {
  contests: CONTESTS.length,
  paicSubmissions: 891,
  courseSessions: COURSES.reduce((sum, c) => sum + c.sessions.length, 0),
}
