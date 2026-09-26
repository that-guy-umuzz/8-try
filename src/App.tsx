import { type FormEvent, useEffect, useMemo, useState } from 'react'

type Review = {
  id: number
  name: string
  text: string
  stars: number
  tag: string
}

const MAX_QUEUE_SPOTS = 2

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Mike R.',
    text:
      "Simplest shop in OC and that's why I love it. No app, no BS. Walk in, $30, best classic I've had. Michael remembers how I like it every time.",
    stars: 5,
    tag: 'Google • Walk-in • 1mo ago',
  },
  {
    id: 2,
    name: 'J. Torres',
    text:
      "Michael's got over 5 years in Ocean City and it shows. Clean, quick, $30 flat. Walked in on a Tuesday, no wait.",
    stars: 5,
    tag: 'Google • Walk-in • 2w ago',
  },
  {
    id: 3,
    name: 'Carlos D.',
    text:
      "One chair, one cut — done right. That's the whole point. No upsell. $30, in and out sharp. New favorite.",
    stars: 4,
    tag: 'Google • Walk-in • 3w ago',
  },
]

const IMAGES = {
  heroShop: '/shop-hero.jpg',
  detailChair: '/shop-detail.jpg',
  michaelPortrait: '/michael.jpg',
}

const NAV_ITEMS = [
  { label: 'The Cut', id: 'services' },
  { label: 'About Michael', id: 'about' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Hours & Location', id: 'visit' },
]

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const scrollTo = (id: string) => {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function App() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [nowMin, setNowMin] = useState(() => new Date().getMinutes())

  const [inQueue, setInQueue] = useState<number>(() => {
    if (typeof window === 'undefined') return 0

    try {
      const saved = window.localStorage.getItem('baldy_in_queue')
      if (saved === null) return 0
      const value = Number.parseInt(saved, 10)
      if (Number.isNaN(value)) return 0
      return Math.min(MAX_QUEUE_SPOTS, Math.max(0, value))
    } catch {
      return 0
    }
  })

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS

    try {
      const saved = window.localStorage.getItem('baldy_reviews')
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS
    } catch {
      return INITIAL_REVIEWS
    }
  })

  const [newStars, setNewStars] = useState(5)
  const [newName, setNewName] = useState('')
  const [newText, setNewText] = useState('')

  const avgRating = useMemo(
    () => (reviews.length ? reviews.reduce((sum, item) => sum + item.stars, 0) / reviews.length : 0),
    [reviews]
  )

  const peopleAhead = useMemo(() => {
    if (inQueue === 0) return 3
    if (inQueue === 1) return 2
    return 1
  }, [inQueue])

  const waitMins = useMemo(() => {
    if (inQueue === 0) return Math.max(5, peopleAhead * 7)
    if (inQueue === 1) return Math.max(5, peopleAhead * 6)
    return Math.max(5, peopleAhead * 5)
  }, [inQueue, peopleAhead])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)

    const intervalId = window.setInterval(() => setNowMin(new Date().getMinutes()), 30000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 3400)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    try {
      window.localStorage.setItem('baldy_in_queue', String(inQueue))
    } catch {
      // no-op
    }
  }, [inQueue])

  useEffect(() => {
    try {
      window.localStorage.setItem('baldy_reviews', JSON.stringify(reviews))
    } catch {
      // no-op
    }
  }, [reviews])

  const handleJoinQueue = () => {
    if (inQueue >= MAX_QUEUE_SPOTS) {
      setToast("You're already holding both queue spots.")
      return
    }

    const nextSpots = inQueue + 1
    setInQueue(nextSpots)

    if (nextSpots === MAX_QUEUE_SPOTS) {
      setToast("You're holding 2 spots in line.")
      return
    }

    setToast(
      peopleAhead === 0
        ? "You're in line! No one ahead — Michael will see you soon."
        : `You're holding 1 spot in line — ${peopleAhead} ahead.`
    )
  }

  const handleLeaveQueue = () => {
    if (inQueue <= 0) {
      setToast("You're not in the queue right now.")
      return
    }

    const remainingSpots = inQueue - 1
    setInQueue(remainingSpots)

    setToast(
      remainingSpots === 0
        ? 'You left the queue.'
        : "One queue spot removed — you're still holding 1 spot."
    )
  }

  const handleAddReview = (event: FormEvent) => {
    event.preventDefault()

    const name = newName.trim()
    const text = newText.trim()
    if (!name || !text) return

    const review: Review = {
      id: Date.now(),
      name,
      text,
      stars: newStars,
      tag: 'Google • Walk-in • just now',
    }

    setReviews((current) => [review, ...current])
    setNewName('')
    setNewText('')
    setNewStars(5)
    setReviewOpen(false)
    setToast(`Thanks ${review.name}! Review added — ${review.stars} stars`)
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''

    try {
      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url)
      }
      setToast('Link copied')
    } catch {
      setToast('Share link available in your browser')
    }
  }

  const queueText =
    inQueue === 0 ? 'Not in line' : inQueue === 1 ? 'Holding 1 spot' : 'Holding 2 spots'

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-[#111111] selection:bg-[#C5A059] selection:text-white"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="bg-[#111111] text-[#FDF8F0] text-[11px] sm:text-xs tracking-widest uppercase font-semibold">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:5136384928" className="flex items-center gap-2 transition-colors hover:text-[#C5A059]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-[10px] text-[#111111]">
                ✂
              </span>
              513-638-4928
            </a>
            <span className="hidden items-center gap-2 opacity-80 md:inline-flex">
              <span className="h-1 w-1 rounded-full bg-[#C5A059]" />
              9935 Stephen Decatur Hwy, Ocean City, MD 21842
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 tracking-[0.18em]">
              Owner: Michael • Walk-Ins Only
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
            <span className="rounded-full bg-[#C5A059] px-2.5 py-1 text-[10px] tracking-widest text-black">
              4.7★ • Over 5 Years • TWO SPOT RULE
            </span>
          </div>
        </div>
      </div>

      <nav
        className={cx(
          'sticky top-0 z-40 border-b backdrop-blur-xl transition-all',
          scrolled ? 'border-black/10 bg-[#FDF8F0]/90 shadow-sm' : 'border-black/5 bg-[#FDF8F0]'
        )}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between sm:h-[80px]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex shrink-0 items-center gap-3">
              <img
                src="/logo.png"
                alt="Baldy The Barber Logo"
                className="-my-1 h-[68px] w-[68px] object-contain drop-shadow-sm sm:h-[78px] sm:w-[78px]"
              />
              <div className="hidden text-left leading-none sm:block">
                <div className="text-[11px] font-bold tracking-[0.2em] text-[#C5A059]">
                  OCEAN CITY, MD • MICHAEL
                </div>
                <div className="mt-1 text-[9px] font-semibold tracking-widest text-black/60">
                  ONE CHAIR • TWO SPOTS MAX • CUT RIGHT.
                </div>
              </div>
            </button>

            <div className="hidden items-center gap-8 lg:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="group relative text-[13px] font-semibold uppercase tracking-widest text-black/70 transition-colors hover:text-black"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#C5A059] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="tel:5136384928"
                className="hidden items-center gap-2 rounded-full border border-black/15 px-5 py-3 text-[13px] font-bold uppercase tracking-widest transition-colors hover:bg-black hover:text-white sm:inline-flex"
              >
                Call Michael
              </a>
              <button
                onClick={() => scrollTo('visit')}
                className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-[13px] font-bold uppercase tracking-widest text-white sm:px-7 sm:py-3.5"
              >
                {inQueue ? "✓ You're In Line" : 'Walk In Today'}
                <span
                  className={cx(
                    'hidden h-2 w-2 rounded-full sm:inline-flex',
                    inQueue ? 'bg-[#C5A059] animate-pulse' : 'bg-emerald-400 animate-pulse'
                  )}
                />
              </button>
              <button
                onClick={() => setMobileMenu((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-black/10 bg-[#FDF8F0] px-4 py-6 lg:hidden">
            <div className="space-y-1">
              {[
                { label: 'The $30 Classic Cut', id: 'services' },
                { label: 'About Michael', id: 'about' },
                { label: 'Reviews — 4.7★', id: 'reviews' },
                { label: 'Visit Us', id: 'visit' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollTo(item.id)
                    setMobileMenu(false)
                  }}
                  className="w-full border-b border-black/5 py-3 text-left text-sm font-semibold uppercase tracking-widest last:border-0"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-[#111111] p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    Live Queue — Two Spots Max
                  </div>
                  <div className="text-sm font-black">
                    {peopleAhead} ahead • {queueText} • ~{waitMins} min
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={handleJoinQueue}
                  disabled={inQueue >= MAX_QUEUE_SPOTS}
                  className={cx(
                    'rounded-full px-4 py-2.5 text-xs font-black uppercase transition-colors',
                    inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-white/10 text-white/40' : 'bg-white text-black'
                  )}
                >
                  {inQueue >= MAX_QUEUE_SPOTS ? '✓ Full' : inQueue === 1 ? '+ 2nd Spot' : '+ Join'}
                </button>
                <button
                  onClick={handleLeaveQueue}
                  disabled={!inQueue}
                  className={cx(
                    'rounded-full px-4 py-2.5 text-xs font-black uppercase transition-colors',
                    !inQueue ? 'cursor-not-allowed bg-white/5 text-white/30' : 'bg-[#C5A059] text-black'
                  )}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 py-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-10">
            <div className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[28px] bg-[#0B0B0C] p-6 text-white sm:min-h-[620px] sm:p-10 lg:p-12">
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 12px, white 12px 13px)' }}
              />
              <div className="absolute -translate-y-1/2 translate-x-1/3 rounded-full bg-[#C5A059]/20 blur-[90px]" />

              <div className="relative">
                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059] bg-[#C5A059] px-3.5 py-1.5 text-black">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                      Walk-Ins Only • Two Spots Max
                    </span>
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/80 backdrop-blur">
                    4.7★ • Over 5 Yrs • Michael
                  </span>
                </div>

                <div className="mb-4 inline-flex rotate-[-1.5deg] rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-black">
                  Motto: stay sharp for every season.
                </div>

                <h1 className="leading-[0.88] tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <span className="block text-[42px] font-black sm:text-[60px] lg:text-[66px]">BEST</span>
                  <span className="block text-[42px] font-black italic text-[#C5A059] sm:text-[60px] lg:text-[66px]">
                    BARBER
                  </span>
                  <span className="block text-[42px] font-black sm:text-[60px] lg:text-[66px]">IN WEST.</span>
                  <span className="block text-[42px] font-black sm:text-[60px] lg:text-[66px]">
                    OC <span className="text-[#C5A059]">SPOT.</span>
                  </span>
                </h1>

                <p className="mt-6 max-w-[520px] text-[15px] leading-relaxed text-white/70 sm:text-[16px]">
                  Michael's rule: <span className="font-bold text-white">one person can hold up to two spots.</span> Join once, or twice if needed, then wait your turn.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={handleJoinQueue}
                    disabled={inQueue >= MAX_QUEUE_SPOTS}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-full px-7 py-4 text-[13px] font-extrabold uppercase tracking-widest transition-colors',
                      inQueue >= MAX_QUEUE_SPOTS
                        ? 'cursor-not-allowed bg-emerald-100 text-emerald-900'
                        : 'bg-[#C5A059] text-black hover:bg-[#d4b77d]'
                    )}
                  >
                    {inQueue >= MAX_QUEUE_SPOTS
                      ? '✓ You Have Both Spots'
                      : inQueue === 1
                        ? 'Join 2nd Spot — Max 2'
                        : 'Join Queue — Up To 2 Spots'}
                  </button>

                  <a
                    href="tel:5136384928"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[13px] font-extrabold uppercase tracking-widest text-black transition-colors hover:bg-zinc-100"
                  >
                    Call Michael — 513-638-4928
                  </a>
                </div>

                <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
                  {[
                    { value: inQueue === 0 ? 'NOT IN LINE' : inQueue === 1 ? '1 SPOT ✓' : '2 SPOTS ✓', label: 'Your Status • Max 2' },
                    { value: `${peopleAhead} AHEAD`, label: 'People Ahead' },
                    { value: `${waitMins} MIN`, label: 'Est. Wait' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={cx(
                        'rounded-2xl border p-3 text-center backdrop-blur',
                        stat.value.includes('1 SPOT') || stat.value.includes('2 SPOTS')
                          ? 'border-[#C5A059]/30 bg-[#C5A059]/20'
                          : 'border-white/10 bg-white/[0.07]'
                      )}
                    >
                      <div className="text-[11px] font-black tracking-tight sm:text-[13px]">{stat.value}</div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/60 leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-auto -mx-6 pt-6 sm:-mx-10 lg:-mx-12 sm:-mb-10 lg:-mb-12">
                <div className="mx-6 rounded-2xl bg-[#C5A059] px-4 py-3 text-black sm:mx-10 lg:mx-12 sm:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-black text-white">
                        {Math.min(inQueue, 2) || 1}
                      </span>
                      <div className="leading-tight">
                        <div className="text-[11px] font-black uppercase tracking-widest">
                          Queue Rule — Up To Two Spots
                        </div>
                        <div className="text-[13px] font-bold">
                          {peopleAhead} ahead • {queueText} • ~{waitMins} min
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setInfoOpen(true)}
                      className="rounded-full bg-black px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-zinc-900"
                    >
                      How It Works
                    </button>
                  </div>
                </div>
                <div className="h-6" />
              </div>
            </div>

            <div className="grid min-h-[560px] grid-rows-[1.35fr_0.75fr] gap-6 sm:min-h-[620px]">
              <div className="relative overflow-hidden rounded-[28px] bg-[#EDE6D6] sm:rounded-[32px]">
                <img src={IMAGES.heroShop} alt="Baldy The Barber storefront" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 rounded-[18px] border border-black/5 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:left-5 sm:right-5 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-sm font-black text-white">
                        M
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                          {inQueue ? `You're in line • ${inQueue} spot${inQueue > 1 ? 's' : ''}` : 'Michael is cutting • Live'}
                        </div>
                        <div className="text-[15px] font-black leading-tight">
                          {inQueue ? `Your queue — ${peopleAhead} ahead` : `Next chair in ~${waitMins} min`}
                        </div>
                        <div className="text-xs text-black/60">
                          {inQueue
                            ? inQueue === 1
                              ? 'You can still add one more spot'
                              : 'You are holding both available spots'
                            : peopleAhead === 0
                              ? 'No wait — walk right in'
                              : `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} waiting`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cx(
                        'hidden rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest sm:inline-flex',
                        inQueue ? 'bg-emerald-500 text-white' : 'bg-[#C5A059] text-black'
                      )}
                    >
                      {inQueue ? `${inQueue} Spot${inQueue > 1 ? 's' : ''}` : 'Live'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-[#111111] transition-all duration-500"
                        style={{ width: `${peopleAhead === 0 ? 100 : Math.max(15, 100 - peopleAhead * 22)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-black/50">{inQueue ? `Queue ${inQueue}` : `~${waitMins}m`}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleLeaveQueue}
                      disabled={!inQueue}
                      className={cx(
                        'rounded-full border py-2.5 text-xs font-black uppercase tracking-widest transition-colors',
                        !inQueue ? 'cursor-not-allowed border-black/5 bg-zinc-100 text-black/20' : 'border-black/10 bg-white text-black'
                      )}
                    >
                      {inQueue ? 'Leave My Spot' : 'Not In Line'}
                    </button>
                    <button
                      onClick={handleJoinQueue}
                      disabled={inQueue >= MAX_QUEUE_SPOTS}
                      className={cx(
                        'rounded-full py-2.5 text-xs font-black uppercase tracking-widest transition-colors',
                        inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-100 text-emerald-700' : 'bg-[#111111] text-white'
                      )}
                    >
                      {inQueue >= MAX_QUEUE_SPOTS ? '✓ Max 2' : inQueue === 1 ? '+ 2nd Spot' : '+ Join — 1 Spot'}
                    </button>
                  </div>
                  <div className="mt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-black/40">
                    {inQueue === 0
                      ? 'Tap join once — you can add up to 2 spots'
                      : inQueue === 1
                        ? 'You can still add one more spot'
                        : 'You are holding both available spots'}
                  </div>
                </div>

                <div className="absolute right-6 top-0 hidden h-full w-10 opacity-90 sm:right-8 sm:block">
                  <div className="h-full w-full bg-[repeating-linear-gradient(45deg,white_0_12px,#C41E3A_12px_24px,#1A3A5F_24px_36px)]" />
                  <div className="absolute -top-1 left-1/2 h-6 w-12 -translate-x-1/2 rounded-t-full border border-black/20 bg-gradient-to-b from-[#C5A059] to-[#8B6F3A]" />
                  <div className="absolute -bottom-1 left-1/2 h-6 w-12 -translate-x-1/2 rounded-b-full border border-black/20 bg-gradient-to-b from-[#8B6F3A] to-[#C5A059]" />
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-[#111111] p-6 text-white">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                      backgroundSize: '18px 18px',
                    }}
                  />

                  <div className="relative">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Queue Policy</div>
                    <div className="mt-1 text-[18px] font-black leading-tight sm:text-[20px]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      One person.<br />
                      Up to two spots.<br />
                      No doubles.
                    </div>
                    <div className="mt-2 max-w-[220px] text-xs leading-relaxed text-white/60">
                      Michael's rule keeps it fair — you can hold up to two spots at a time.
                    </div>
                  </div>

                  <div className="relative mt-4 flex items-center gap-2">
                    <button
                      onClick={handleJoinQueue}
                      disabled={inQueue >= MAX_QUEUE_SPOTS}
                      className={cx(
                        'rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-widest transition-colors',
                        inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-100 text-emerald-900' : 'bg-[#C5A059] text-black'
                      )}
                    >
                      {inQueue >= MAX_QUEUE_SPOTS ? '✓ Maxed' : inQueue ? 'Add Spot' : 'Join Once'}
                    </button>
                    {inQueue > 0 && <span className="text-[10px] text-white/50">Tap Leave to free a spot</span>}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] bg-[#C5A059] p-1">
                  <img src={IMAGES.detailChair} alt="Barber chairs inside the shop" className="h-full w-full rounded-[24px] object-cover" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-full bg-black px-3 py-2 text-white">
                    <span className="text-[11px] font-black uppercase tracking-widest">Two Spot Rule</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-black">{Math.min(inQueue, 2) || 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/10 bg-[#111111] text-[#C5A059]">
        <div className="flex animate-marquee whitespace-nowrap py-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} className="mx-6 flex items-center gap-6 text-[13px] font-black uppercase tracking-[0.2em]">
              <span>Up To Two Spots</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
              <span>Cut Right. Stay Sharp.</span>
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>Walk-Ins Only • $30 Classic • 4.7★</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C41E3A]" />
            </span>
          ))}
        </div>
      </div>

      <section id="services" className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-black">✂</span>
                One Chair • Up To Two Spots • $30 Flat
              </div>
              <h2
                className="mt-4 text-[34px] font-black leading-[0.9] tracking-tight sm:text-[52px]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                The classic.<br />
                <span className="text-[#C5A059] italic">$30. Up to 2 spots.</span>
              </h2>
            </div>

            <div className="lg:max-w-[500px]">
              <p className="text-[15px] leading-relaxed text-black/60">
                Michael allows up to two queue spots per person so you can still hold a place without crowding the line.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
                <span
                  className={cx(
                    'h-2 w-2 rounded-full',
                    inQueue ? 'animate-pulse bg-emerald-400' : 'animate-pulse bg-[#C5A059]'
                  )}
                />
                {inQueue
                  ? `You're in line • ${inQueue} spot${inQueue > 1 ? 's' : ''} • ${waitMins} min`
                  : `Live: ${peopleAhead} ahead • ${waitMins} min • Up to 2 spots`}
              </div>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[32px] bg-[#111111] p-7 text-white shadow-2xl sm:p-10">
              <div className="absolute right-0 top-0 h-[380px] w-[380px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[#C5A059]/15 blur-[70px]" />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C5A059]">
                      Michael's Rule
                    </div>
                    <h3
                      className="mt-2 text-[32px] font-black leading-none tracking-tight sm:text-[40px]"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      Classic Haircut
                    </h3>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="rounded-full bg-white px-4 py-1.5 text-lg font-black text-black">$30</span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                        Up To 2 Spots / Person
                      </span>
                      <span className="hidden rounded-full bg-[#C5A059] px-3 py-1.5 text-xs font-black uppercase tracking-widest text-black sm:inline-flex">
                        Michael • Owner
                      </span>
                    </div>
                  </div>
                  <img src="/logo.png" alt="logo" className="hidden h-16 w-16 rounded-2xl bg-white object-contain p-1 shadow-lg sm:block" />
                </div>

                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-white/50">
                      What's Included — Same $30
                    </div>
                    <ul className="mt-3 space-y-2.5">
                      {[
                        'Precision scissor & clipper classic',
                        'Straight-razor neck cleanup',
                        'Natural edge & sideburns',
                        'Up to two queue spots per person',
                        'Hot lather + brush off',
                      ].map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-tight text-white/80">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-[11px] font-black text-black">
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <div className="text-xs font-black uppercase tracking-widest text-[#C5A059]">
                      Up To 2 Spots — No Doubles
                    </div>
                    <p className="mt-2 text-sm text-white/60">
                      Join once, or add a second if needed. Leave if plans change, then you can rejoin.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={handleJoinQueue}
                        disabled={inQueue >= MAX_QUEUE_SPOTS}
                        className={cx(
                          'rounded-full py-2.5 text-xs font-black uppercase tracking-widest transition-colors',
                          inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-white/10 text-white/40' : 'bg-white text-black'
                        )}
                      >
                        {inQueue >= MAX_QUEUE_SPOTS ? '✓ Full' : inQueue === 1 ? '+ 2nd Spot' : '+ Join Queue'}
                      </button>
                      <button
                        onClick={handleLeaveQueue}
                        disabled={inQueue <= 0}
                        className={cx(
                          'rounded-full border py-2.5 text-xs font-black uppercase tracking-widest transition-colors',
                          inQueue <= 0 ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/40' : 'border-white/20 bg-transparent text-white'
                        )}
                      >
                        Leave Spot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest">Live Queue — Two Spot Rule</span>
                  <span
                    className={cx(
                      'rounded-full px-2.5 py-1 text-[11px] font-black',
                      inQueue ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white'
                    )}
                  >
                    {inQueue === 0 ? `${peopleAhead} Ahead` : `${inQueue} Spot${inQueue > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-black/5 bg-[#FDF8F0] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black leading-none">
                        {inQueue === 0
                          ? `${peopleAhead} waiting`
                          : inQueue === 1
                            ? 'You hold 1 spot'
                            : 'You hold 2 spots'}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-black/60">
                        {inQueue === 0
                          ? `Est. wait ~${waitMins} min • Up to 2 spots per person`
                          : `You have ${inQueue} spot${inQueue > 1 ? 's' : ''} • ~${waitMins} min`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black uppercase tracking-widest text-black/40">Status</div>
                      <div
                        className={cx(
                          'mt-1 rounded-full px-3 py-1 text-[13px] font-black',
                          inQueue ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-black/60'
                        )}
                      >
                        {queueText}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-[#C5A059] transition-all"
                      style={{ width: `${peopleAhead === 0 ? 100 : Math.max(20, 100 - peopleAhead * 18)}%` }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleLeaveQueue}
                      disabled={inQueue <= 0}
                      className={cx(
                        'rounded-full py-2.5 text-xs font-black uppercase transition-colors',
                        inQueue <= 0 ? 'cursor-not-allowed bg-zinc-100 text-black/20' : 'bg-[#111111] text-white'
                      )}
                    >
                      Leave
                    </button>
                    <button
                      onClick={handleJoinQueue}
                      disabled={inQueue >= MAX_QUEUE_SPOTS}
                      className={cx(
                        'rounded-full py-2.5 text-xs font-black uppercase transition-colors',
                        inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-50 text-emerald-700' : 'bg-[#C5A059] text-black'
                      )}
                    >
                      {inQueue >= MAX_QUEUE_SPOTS ? 'Full' : inQueue ? 'Add' : 'Join'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-black/5 bg-[#EDE6D6] p-6">
                <h4 className="text-[16px] font-black leading-tight">Up to two spots — why?</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-black/60">
                  Gives you flexibility without creating a crowding problem. You can join once or add a second spot, then leave when you're done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-6 sm:py-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[32px] border border-black/10 bg-white lg:grid-cols-2">
            <div className="relative min-h-[420px] overflow-hidden bg-[#111111] sm:min-h-[560px]">
              <img src={IMAGES.michaelPortrait} alt="Michael — owner of Baldy The Barber" className="absolute inset-0 h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex max-w-[380px] items-center gap-4 rounded-2xl bg-white p-4 sm:p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111111] text-lg font-black text-white">
                    M
                  </div>
                  <div>
                    <div className="text-sm font-black leading-none">Michael — Owner & Barber</div>
                    <div className="mt-1 text-xs leading-tight text-black/60">
                      “You can hold up to two spots, but no one can block the whole line.”
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute left-6 top-6 rounded-full bg-[#C5A059] px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
                Meet Michael — Max Two Spots
              </div>
            </div>

            <div className="p-6 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#C5A059]">
                <span className="h-[2px] w-8 bg-[#C5A059]" />
                Queue Policy
              </div>
              <h2
                className="mt-3 text-[32px] font-black leading-[0.95] tracking-tight sm:text-[38px]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Up to two.<br /> No <span className="text-[#C5A059]">crowding.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-black/60">
                You can hold up to two spots until you leave. Tap Join, you hold your place. Tap Leave, your spots free up.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { key: inQueue === 0 ? 'Tap Join' : inQueue === 1 ? '1 Spot ✓' : '2 Spots ✓', value: 'Up to two spots per person' },
                  { key: '4.7★ Rated', value: `${reviews.length} walk-in reviews` },
                  { key: '5+ Yrs OC', value: 'Michael • Owner' },
                ].map((item) => (
                  <div key={item.key} className="rounded-2xl border border-black/5 bg-[#FDF8F0] p-4 text-center">
                    <div className="text-[13px] font-black leading-tight">{item.key}</div>
                    <div className="mt-1 text-[11px] leading-tight text-black/60">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleJoinQueue}
                  disabled={inQueue >= MAX_QUEUE_SPOTS}
                  className={cx(
                    'flex-1 rounded-full py-3.5 text-[13px] font-black uppercase tracking-widest transition-colors',
                    inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-100 text-emerald-900' : 'bg-[#111111] text-white'
                  )}
                >
                  {inQueue >= MAX_QUEUE_SPOTS ? '✓ You Have 2 Spots' : inQueue ? 'Add Another Spot' : 'Join Queue'}
                </button>
                <button
                  onClick={handleLeaveQueue}
                  disabled={inQueue <= 0}
                  className={cx(
                    'flex-1 rounded-full border py-3.5 text-[13px] font-black uppercase tracking-widest transition-colors',
                    inQueue <= 0 ? 'cursor-not-allowed border-black/5 bg-white text-black/20' : 'border-black/10 bg-[#FDF8F0] text-black'
                  )}
                >
                  Leave Spot
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-black">★</span>
                {avgRating.toFixed(1)} Stars • Two Spot Rule • Owner Michael
              </div>
              <h2
                className="mt-4 text-[30px] font-black leading-[0.9] tracking-tight sm:text-[40px]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Real cuts.<br /> <span className="text-[#C5A059] italic">Up to two spots.</span>
              </h2>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewOpen(true)}
                className="rounded-full bg-[#C5A059] px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-[#d4b77d]"
              >
                Leave a Review
              </button>
              <button
                onClick={handleShare}
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-zinc-50"
              >
                Share
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="flex flex-col rounded-[24px] border border-black/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex text-sm text-[#C5A059]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span key={starIndex} className={cx(starIndex < review.stars ? '' : 'opacity-20')}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rounded-full border border-black/5 bg-[#FDF8F0] px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest">
                    {review.stars}.0
                  </span>
                </div>

                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-black/70">“{review.text}”</p>

                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                  <div className="flex items-center gap-2 text-sm font-black">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-xs text-white">
                      {review.name[0]}
                    </span>
                    {review.name}
                  </div>
                  <div className="text-[11px] font-semibold text-black/40">{review.tag}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden rounded-[32px] bg-[#111111] p-6 text-white sm:p-8 lg:p-10">
              <div className="absolute right-0 top-0 h-[360px] w-[360px] -translate-y-1/2 translate-x-1/3 rounded-full bg-[#C5A059]/15 blur-[80px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-black">
                  Owner Michael • Two Spots Max • {inQueue ? `${inQueue} Active` : `${peopleAhead} Ahead`}
                </div>

                <h2 className="mt-4 text-[30px] font-black leading-none sm:text-[36px]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Two spots<br />
                  <span className="text-[#C5A059]">for the line.</span>
                </h2>

                <div className="mt-6 rounded-[20px] bg-white p-5 text-[#111111]">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-black uppercase tracking-widest">Live Queue — Two Spot Rule</div>
                    <span
                      className={cx(
                        'rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-widest',
                        inQueue ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white'
                      )}
                    >
                      {inQueue ? 'You: Active' : 'Queue Live'}
                    </span>
                  </div>

                  <div className="mt-3 rounded-2xl border border-black/5 bg-[#FDF8F0] p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{peopleAhead} ahead of you</span>
                      <span className="font-black">~{waitMins} min wait</span>
                    </div>
                    <div className="mt-2 text-[11px] text-black/50">
                      {inQueue === 0
                        ? 'Tap Join once to hold your spot — up to 2 total'
                        : inQueue === 1
                          ? 'You hold 1 spot — you can still add another'
                          : 'You hold 2 spots — you are at the limit'}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={handleJoinQueue}
                        disabled={inQueue >= MAX_QUEUE_SPOTS}
                        className={cx(
                          'rounded-full py-2.5 text-xs font-black uppercase transition-colors',
                          inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-50 text-emerald-700' : 'bg-[#111111] text-white'
                        )}
                      >
                        {inQueue >= MAX_QUEUE_SPOTS ? '✓ At Max' : inQueue ? 'Add Spot' : 'Join Queue'}
                      </button>
                      <button
                        onClick={handleLeaveQueue}
                        disabled={inQueue <= 0}
                        className={cx(
                          'rounded-full border py-2.5 text-xs font-black uppercase transition-colors',
                          inQueue <= 0 ? 'cursor-not-allowed border-black/5 bg-zinc-100 text-black/20' : 'border-black/10 bg-white text-black'
                        )}
                      >
                        Leave Spot
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] bg-white p-5 text-[#111111]">
                  <div className="flex items-center gap-2 text-[13px] font-black uppercase tracking-widest">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C5A059]">◷</span>
                    Hours — Walk-Ins Only
                  </div>

                  <div className="mt-4 divide-y divide-black/5">
                    {[
                      { day: 'Mon–Fri', time: '9–4', highlight: true },
                      { day: 'Saturday', time: '9–2', highlight: false },
                      { day: 'Sunday', time: 'Closed', closed: true, highlight: false },
                    ].map((hours) => (
                      <div
                        key={hours.day}
                        className={cx(
                          'flex items-center justify-between py-2.5 text-sm',
                          hours.closed ? 'opacity-60' : '',
                          hours.highlight ? 'font-bold' : ''
                        )}
                      >
                        <span
                          className={cx(
                            hours.highlight ? 'text-[#111111]' : hours.closed ? 'text-black/50' : 'text-black/70',
                            'font-semibold'
                          )}
                        >
                          {hours.day}
                        </span>
                        <span
                          className={cx(
                            'rounded-full px-3 py-1 text-xs font-bold',
                            hours.closed ? 'bg-zinc-100 text-black/50' : hours.highlight ? 'bg-[#111111] text-white' : 'bg-zinc-100 text-black'
                          )}
                        >
                          {hours.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-[11px] font-medium text-black/50">
                    9935 Stephen Decatur Hwy, Ocean City, MD 21842
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a
                    href="tel:5136384928"
                    className="rounded-full bg-[#C5A059] py-3.5 text-center text-[13px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#d4b77d]"
                  >
                    Call Michael
                  </a>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=9935+Stephen+Decatur+Hwy+Ocean+City+MD+21842"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white py-3.5 text-center text-[13px] font-black uppercase tracking-widest text-black transition-colors hover:bg-zinc-100"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-[32px] border border-black/10 bg-white">
              <div className="relative h-[380px] overflow-hidden bg-[#EDE6D6] sm:h-[440px]">
                <iframe
                  title="Baldy the Barber Map"
                  src="https://www.google.com/maps?q=9935+Stephen+Decatur+Hwy+Ocean+City+MD+21842&z=15&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-2xl border border-black/10 bg-white p-4 shadow-xl sm:left-auto sm:right-4 sm:w-[340px]">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="logo" className="h-12 w-12 object-contain" />
                    <div>
                      <div className="text-sm font-black leading-none">Baldy The Barber — Michael</div>
                      <div className="text-xs text-black/60">4.7★ • Up to Two Spots</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className={cx(
                            'rounded-full px-2 py-0.5 text-[10px]',
                            inQueue ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white'
                          )}
                        >
                          {inQueue ? `${inQueue} Spot${inQueue > 1 ? 's' : ''} ✓` : `${peopleAhead} ahead`}
                        </span>
                        <span className="text-black/60">~{waitMins} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-6 sm:p-7">
                <h3 className="text-[16px] font-black">Up To Two Spots — Fair Line</h3>
                <p className="mt-2 text-sm text-black/60">
                  Join once, or add a second spot. Can't double-book beyond the limit. Leave if you need to, then rejoin.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleJoinQueue}
                    disabled={inQueue >= MAX_QUEUE_SPOTS}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest',
                      inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-100 text-emerald-700' : 'bg-[#111111] text-white'
                    )}
                  >
                    {inQueue >= MAX_QUEUE_SPOTS ? '✓ At Max' : inQueue ? 'Add Another Spot' : 'Join Queue — Up To 2'}
                  </button>
                  <button
                    onClick={handleLeaveQueue}
                    disabled={inQueue <= 0}
                    className={cx(
                      'rounded-full border px-5 py-2.5 text-xs font-black uppercase',
                      inQueue <= 0 ? 'cursor-not-allowed border-black/5 text-black/20' : 'border-black/10 bg-[#FDF8F0] text-black'
                    )}
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-[#C5A059] px-6 py-8 sm:px-10 sm:py-10 lg:flex-row">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 20px, black 20px 21px)' }}
            />

            <div className="relative flex items-center gap-4">
              <img src="/logo.png" alt="logo" className="hidden h-16 w-16 rounded-2xl bg-white object-contain p-1 shadow-lg sm:block" />
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.18em] text-black/60">
                  Up To Two Spots • {inQueue ? 'You Are In' : 'Join Up To 2'}
                </div>
                <div className="text-[24px] font-black leading-none tracking-tight sm:text-[30px]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {inQueue ? `You hold ${inQueue} spot${inQueue > 1 ? 's' : ''}.` : 'One tap. Two max.'}
                </div>
              </div>
            </div>

            <div className="relative flex w-full flex-wrap gap-3 lg:w-auto">
              <button
                onClick={handleJoinQueue}
                disabled={inQueue >= MAX_QUEUE_SPOTS}
                className={cx(
                  'flex-1 rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors lg:flex-none',
                  inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-emerald-100 text-emerald-900' : 'bg-[#111111] text-white'
                )}
              >
                {inQueue >= MAX_QUEUE_SPOTS ? '✓ Maxed' : inQueue ? 'Add Spot' : 'Join Queue'}
              </button>
              <button
                onClick={handleLeaveQueue}
                disabled={inQueue <= 0}
                className={cx(
                  'flex-1 rounded-full border px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors lg:flex-none',
                  inQueue <= 0 ? 'cursor-not-allowed border-black/10 bg-white/40 text-black/40' : 'border-black/10 bg-white text-black'
                )}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B0B0C] pt-10 pb-8 text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Baldy Logo" className="h-14 w-14 rounded-2xl bg-white object-contain p-1" />
                <div>
                  <div className="text-lg font-black leading-none tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    BALDY THE BARBER
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                    Michael • Up To Two Spots • 4.7★
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-[360px] text-sm leading-relaxed text-white/60">
                One chair, $30 classic, up to two queue spots per person. Walk-ins only, Route 611. Fair line, sharp cut.
              </p>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-widest text-white/40">Queue Rule</div>
              <div className="mt-4 text-sm leading-relaxed text-white/70">
                You can hold up to two spots until you leave. Prevents double booking, keeps the wait honest.
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-widest text-white/40">Hours</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex justify-between text-white/70">
                  <span>Mon–Fri</span>
                  <span className="font-bold text-white">9–4</span>
                </li>
                <li className="flex justify-between text-white/70">
                  <span>Saturday</span>
                  <span className="font-bold text-white">9–2</span>
                </li>
                <li className="flex justify-between text-white/40">
                  <span>Sunday</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-5 text-[#111111]">
              <div className="text-xs font-black uppercase tracking-widest">Queue Status</div>
              <div className="mt-2 font-black">
                {inQueue ? `✓ You're in line — ${inQueue} spot${inQueue > 1 ? 's' : ''}` : 'Not in line — Up to 2'}
              </div>
              <div className="mt-1 text-xs text-black/60">
                {peopleAhead} ahead • ~{waitMins} min • 9935 Stephen Decatur Hwy
              </div>
              <button
                onClick={inQueue ? handleLeaveQueue : handleJoinQueue}
                className={cx(
                  'mt-4 w-full rounded-full py-3 text-xs font-black uppercase tracking-widest',
                  inQueue ? 'bg-zinc-100 text-black' : 'bg-[#111111] text-white'
                )}
              >
                {inQueue ? 'Leave My Spot' : 'Join Queue — Up To 2'}
              </button>
            </div>
          </div>

          <div className="pt-6 text-xs text-white/40">
            © {new Date().getFullYear()} Baldy The Barber — Owner Michael • Up To Two Spots Per Person • $30 Classic
          </div>
        </div>
      </footer>

      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)} />
          <div className="relative max-h-[90vh] w-full overflow-auto rounded-t-[28px] bg-[#FDF8F0] shadow-2xl sm:max-w-[520px] sm:rounded-[28px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#FDF8F0] px-6 py-5">
              <div className="font-black">Two Spot Rule — How It Works</div>
              <button
                onClick={() => setInfoOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 p-6 text-sm leading-relaxed">
              <p>
                <b>Rule:</b> You can hold up to two spots at a time. Tap Join once or twice, then keep your place. Leave to free your spots.
              </p>
              <p>
                <b>Why:</b> Keeps the line fair while still giving people flexibility on busy days.
              </p>
              <p>
                <b>Current:</b> {peopleAhead} people ahead, ~{waitMins} min. {inQueue ? `You have ${inQueue} spot${inQueue > 1 ? 's' : ''} held.` : "You're not in line yet — tap Join once or twice."}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleJoinQueue}
                  disabled={inQueue >= MAX_QUEUE_SPOTS}
                  className={cx(
                    'rounded-full py-3 text-xs font-black uppercase',
                    inQueue >= MAX_QUEUE_SPOTS ? 'cursor-not-allowed bg-zinc-100 text-black/30' : 'bg-[#111111] text-white'
                  )}
                >
                  {inQueue >= MAX_QUEUE_SPOTS ? 'Already Full' : inQueue ? 'Add Spot' : 'Join'}
                </button>
                <button
                  onClick={handleLeaveQueue}
                  disabled={inQueue <= 0}
                  className={cx(
                    'rounded-full border py-3 text-xs font-black uppercase',
                    inQueue <= 0 ? 'cursor-not-allowed border-black/5 bg-white text-black/20' : 'border-black/10 bg-[#FDF8F0] text-black'
                  )}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewOpen(false)} />
          <div className="relative max-h-[92vh] w-full overflow-auto rounded-t-[28px] border border-black/10 bg-[#FDF8F0] shadow-2xl sm:max-w-[520px] sm:rounded-[28px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#FDF8F0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] font-black text-white">★</div>
                <div>
                  <div className="font-black leading-none">Leave a Review for Michael</div>
                  <div className="text-xs font-semibold text-black/50">4.7★ average</div>
                </div>
              </div>
              <button
                onClick={() => setReviewOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-5 px-6 py-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-black/60">Your Rating</label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewStars(rating)}
                      className={cx(
                        'flex h-11 w-11 items-center justify-center rounded-full border text-lg',
                        newStars >= rating ? 'border-[#111111] bg-[#111111] text-white' : 'border-black/10 bg-white text-black/50'
                      )}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-black/60">Your Name</label>
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  required
                  placeholder="e.g. Alex"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none ring-0 placeholder:text-black/30 focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-black/60">Your Review</label>
                <textarea
                  value={newText}
                  onChange={(event) => setNewText(event.target.value)}
                  required
                  rows={4}
                  placeholder="How was your cut?"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none placeholder:text-black/30 focus:border-[#111111]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#111111] py-4 text-sm font-black uppercase tracking-widest text-white"
              >
                Post Review — {newStars}★
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C5A059] text-black">✓</span>
          <span className="truncate">{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  )
}
