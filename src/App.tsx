import { useState, useEffect } from 'react'

type Review = { id: number; name: string; text: string; stars: number; tag: string }

const INITIAL_REVIEWS: Review[] = [
  { id: 1, name: "Mike R.", text: "Simplest shop in OC and that's why I love it. No app, no BS. Walk in, $30, best classic I've had. Michael remembers how I like it every time.", stars: 5, tag: "Google • Walk-in • 2w ago" },
  { id: 2, name: "J. Torres", text: "Michael's got over 5 years in Ocean City and it shows. Clean, quick, $30 flat. Walked in on a Tuesday, no wait.", stars: 5, tag: "Google • Walk-in • 1mo ago" },
  { id: 3, name: "Carlos D.", text: "One chair, one cut — done right. That's the whole point. No upsell. $30, in and out sharp. New favorite.", stars: 4, tag: "Google • Walk-in • 3w ago" },
]

// ============================================================
// PHOTOS — put these 3 files in the public/ folder EXACTLY:
//   public/shop-hero.jpg      = storefront building
//   public/shop-detail.jpg    = interior chairs
//   public/michael.jpg        = Michael portrait
// ============================================================

const IMAGES = {
  heroShop: "/shop-hero.jpg",
  detailChair: "/shop-detail.jpg",
  michaelPortrait: "/michael.jpg",
}

export default function App() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Queue / Next Chair — ONE spot per person
  const [peopleAhead] = useState(1)
  const [nowMin, setNowMin] = useState(() => new Date().getMinutes())
  const [inQueue, setInQueue] = useState<boolean>(() => {
    try { return localStorage.getItem('baldy_in_queue') === '1' } catch { return false }
  })

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('baldy_reviews')
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS
    } catch { return INITIAL_REVIEWS }
  })
  const [newStars, setNewStars] = useState(5)
  const [newName, setNewName] = useState("")
  const [newText, setNewText] = useState("")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    const iv = setInterval(() => setNowMin(new Date().getMinutes()), 30000)
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(iv) }
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3400)
      return () => clearTimeout(t)
    }
  }, [toast])

  useEffect(() => {
    try { localStorage.setItem('baldy_reviews', JSON.stringify(reviews)) } catch {}
  }, [reviews])

  useEffect(() => {
    try { localStorage.setItem('baldy_in_queue', inQueue ? '1' : '0') } catch {}
  }, [inQueue])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const waitMins = peopleAhead === 0 ? 5 + (nowMin % 6) : peopleAhead * 18 + 8 + (nowMin % 7)

  const handleJoinQueue = () => {
    if (inQueue) {
      setToast("You're already in line — one spot per person. You can only join once.")
      return
    }
    setInQueue(true)
    setToast(`You're in line! ${peopleAhead === 0 ? "No one ahead" : `${peopleAhead} ahead`} — Michael will see you soon. One spot only.`)
  }

  const handleLeaveQueue = () => {
    if (!inQueue) {
      setToast("You're not in the queue right now.")
      return
    }
    setInQueue(false)
    setToast("You left the queue — tap Join again if you change your mind.")
  }

  const hours = [
    { day: "Monday", time: "9:00 AM – 4:00 PM" },
    { day: "Tuesday", time: "9:00 AM – 4:00 PM" },
    { day: "Wednesday", time: "9:00 AM – 4:00 PM" },
    { day: "Thursday", time: "9:00 AM – 4:00 PM" },
    { day: "Friday", time: "9:00 AM – 4:00 PM" },
    { day: "Saturday", time: "9:00 AM – 2:00 PM", highlight: true },
    { day: "Sunday", time: "Closed", closed: true },
  ]

  const avgRating = reviews.length ? (reviews.reduce((a,b)=>a+b.stars,0)/reviews.length).toFixed(1) : "4.7"

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newText.trim()) { setToast("Add your name and review"); return }
    const r: Review = { id: Date.now(), name: newName.trim(), text: newText.trim(), stars: newStars, tag: "Just now • Walk-in" }
    setReviews(prev => [r, ...prev])
    setNewName(""); setNewText(""); setNewStars(5)
    setReviewOpen(false)
    setToast(`Thanks ${r.name}! Review added — ${r.stars} stars`)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#111111] selection:bg-[#C5A059] selection:text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Bar */}
      <div className="bg-[#111111] text-[#FDF8F0] text-[11px] sm:text-xs tracking-widest uppercase font-semibold">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:5136384928" className="flex items-center gap-2 hover:text-[#C5A059] transition-colors">
              <span className="w-5 h-5 rounded-full bg-[#C5A059] flex items-center justify-center text-[#111111] text-[10px]">✂</span>
              513-638-4928
            </a>
            <span className="hidden md:inline-flex items-center gap-2 opacity-80">
              <span className="w-1 h-1 bg-[#C5A059] rounded-full" />
              9935 Stephen Decatur Hwy, Ocean City, MD 21842
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 tracking-[0.18em]">Owner: Michael • Walk-Ins Only</span>
            <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block" />
            <span className="bg-[#C5A059] text-black px-2.5 py-1 rounded-full text-[10px] tracking-widest">4.7★ • Over 5 Years • ONE SPOT RULE</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all ${scrolled ? 'bg-[#FDF8F0]/90 border-black/10 shadow-sm' : 'bg-[#FDF8F0] border-black/5'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] sm:h-[80px]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="Baldy The Barber Logo" className="w-[68px] h-[68px] sm:w-[78px] sm:h-[78px] object-contain -my-1 drop-shadow-sm" />
              <div className="hidden sm:block text-left leading-none">
                <div className="text-[11px] tracking-[0.2em] font-bold text-[#C5A059]">OCEAN CITY, MD • MICHAEL</div>
                <div className="text-[9px] tracking-widest text-black/60 font-semibold mt-1">ONE CHAIR • ONE SPOT IN QUEUE • CUT RIGHT.</div>
              </div>
            </button>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: 'The Cut', id: 'services' },
                { label: 'About Michael', id: 'about' },
                { label: 'Reviews', id: 'reviews' },
                { label: 'Hours & Location', id: 'visit' },
              ].map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="text-[13px] font-semibold tracking-widest uppercase text-black/70 hover:text-black transition-colors relative group">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C5A059] group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a href="tel:5136384928" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-bold tracking-widest uppercase px-5 py-3 rounded-full border border-black/15 hover:bg-black hover:text-white hover:border-black transition-all">
                Call Michael
              </a>
              <button onClick={() => scrollTo('visit')} className="inline-flex items-center gap-2 bg-[#111111] text-white text-[13px] font-bold tracking-widest uppercase px-5 sm:px-7 py-3 sm:py-3.5 rounded-full hover:bg-black transition-colors shadow-lg shadow-black/20">
                {inQueue ? "✓ You're In Line" : "Walk In Today"}
                <span className={`hidden sm:inline-flex w-2 h-2 rounded-full ${inQueue ? 'bg-[#C5A059] animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              </button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden w-11 h-11 rounded-full border border-black/10 flex items-center justify-center bg-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="lg:hidden border-t border-black/10 bg-[#FDF8F0] px-4 py-6 space-y-1">
            {[
              { label: 'The $30 Classic Cut', id: 'services' },
              { label: 'About Michael', id: 'about' },
              { label: 'Reviews — 4.7★', id: 'reviews' },
              { label: 'Visit Us', id: 'visit' },
            ].map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="w-full text-left py-3 text-sm font-semibold tracking-widest uppercase border-b border-black/5 last:border-0">
                {item.label}
              </button>
            ))}
            <div className="mt-4 bg-[#111111] text-white rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-bold text-white/60">Live Queue — One Spot Only</div>
                  <div className="font-black text-sm">{peopleAhead} ahead • {inQueue ? "You're in line ✓" : "Not in line"} • ~{waitMins} min</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={handleJoinQueue} disabled={inQueue} className={`rounded-full px-4 py-2.5 text-xs font-black uppercase transition-colors ${inQueue ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10' : 'bg-[#C5A059] text-black hover:bg-[#D4B27A]'}`}>
                  {inQueue ? "✓ In Line" : "+ Join"}
                </button>
                <button onClick={handleLeaveQueue} disabled={!inQueue} className={`rounded-full px-4 py-2.5 text-xs font-black uppercase transition-colors ${!inQueue ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:bg-zinc-100'}`}>
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-8 py-6 sm:py-8 lg:py-10">
            <div className="relative bg-[#0B0B0C] rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-10 lg:p-12 text-white flex flex-col min-h-[560px] sm:min-h-[620px]">
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(-45deg, transparent 0 12px, white 12px 13px)` }} />
              <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#C5A059]/20 blur-[90px] rounded-full -translate-y-1/2 translate-x-1/3" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2.5 mb-6">
                  <span className="inline-flex items-center gap-2 bg-[#C5A059] text-black border border-[#C5A059] rounded-full px-3.5 py-1.5">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                    <span className="text-[11px] font-black tracking-[0.18em] uppercase">Walk-Ins Only • One Spot Per Person</span>
                  </span>
                  <span className="inline-flex items-center bg-white/10 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white/80">
                    4.7★ • Over 5 Yrs • Michael
                  </span>
                </div>

                <div className="mb-4 inline-flex rotate-[-1.5deg] bg-white text-black px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase">
                  Motto: Cut Right. Stay Sharp.
                </div>

                <h1 className="leading-[0.88] tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <span className="block text-[42px] sm:text-[60px] lg:text-[66px] font-black">ONE</span>
                  <span className="block text-[42px] sm:text-[60px] lg:text-[66px] font-black text-[#C5A059] italic">CHAIR.</span>
                  <span className="block text-[42px] sm:text-[60px] lg:text-[66px] font-black">ONE CUT.</span>
                  <span className="block text-[42px] sm:text-[60px] lg:text-[66px] font-black">ONE <span className="text-[#C5A059]">SPOT.</span></span>
                </h1>

                <p className="mt-6 text-[15px] sm:text-[16px] leading-relaxed text-white/70 max-w-[520px]">
                  Michael's rule: <span className="text-white font-bold">one person, one spot in line.</span> No double bookings. Join once, wait your turn, get your $30 classic.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={handleJoinQueue} disabled={inQueue} className={`inline-flex items-center gap-2 font-extrabold tracking-widest uppercase text-[13px] px-7 py-4 rounded-full transition-colors shadow-lg ${inQueue ? 'bg-white/10 text-white/50 border border-white/10 cursor-not-allowed' : 'bg-[#C5A059] text-black hover:bg-[#D4B27A] shadow-[#C5A059]/20'}`}>
                    {inQueue ? "✓ You're In The Queue (One Spot Only)" : "Join Queue — One Spot Only"}
                    {!inQueue && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                  </button>
                  <a href="tel:5136384928" className="inline-flex items-center gap-2 bg-white text-black font-extrabold tracking-widest uppercase text-[13px] px-7 py-4 rounded-full hover:bg-zinc-100 transition-colors">
                    Call Michael — 513-638-4928
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 max-w-[520px]">
                  {[
                    { value: inQueue ? "IN LINE ✓" : "NOT IN LINE", label: "Your Status • One Spot" },
                    { value: `${peopleAhead} AHEAD`, label: "People Ahead" },
                    { value: `${waitMins} MIN`, label: "Est. Wait" },
                  ].map(s => (
                    <div key={s.label} className={`rounded-2xl p-3 text-center backdrop-blur border ${s.value.includes('IN LINE ✓') ? 'bg-[#C5A059]/20 border-[#C5A059]/30' : 'bg-white/[0.07] border-white/10'}`}>
                      <div className="font-black text-[11px] sm:text-[13px] tracking-tight">{s.value}</div>
                      <div className="text-[10px] tracking-widest uppercase font-semibold text-white/60 leading-tight mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-auto -mx-6 sm:-mx-10 lg:-mx-12 -mb-6 sm:-mb-10 lg:-mb-12 pt-6">
                <div className="bg-[#C5A059] text-black mx-6 sm:mx-10 lg:mx-12 rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">1</span>
                    <div className="leading-tight">
                      <div className="text-[11px] font-black tracking-widest uppercase">Queue Rule — One Spot Per Person</div>
                      <div className="text-[13px] font-bold">{peopleAhead} ahead • {inQueue ? "You have 1 spot" : "Join to hold your spot"} • ~{waitMins} min</div>
                    </div>
                  </div>
                  <button onClick={() => setInfoOpen(true)} className="text-[11px] font-black tracking-widest uppercase bg-black text-white px-3 py-1.5 rounded-full hover:bg-zinc-900">
                    How It Works
                  </button>
                </div>
                <div className="h-6" />
              </div>
            </div>

            {/* Right visuals */}
            <div className="grid grid-rows-[1.35fr_0.75fr] gap-6 min-h-[560px] sm:min-h-[620px]">
              <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#EDE6D6]">
                <img src={IMAGES.heroShop} alt="Baldy The Barber storefront" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 sm:left-5 sm:right-5 bg-white rounded-[18px] p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-black/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-sm shrink-0">M</div>
                      <div>
                        <div className="text-[12px] font-black tracking-widest uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          {inQueue ? "You're in line • One spot" : "Michael is cutting • Live"}
                        </div>
                        <div className="text-[15px] font-black leading-tight">{inQueue ? `Your spot — ${peopleAhead} ahead` : `Next chair in ~${waitMins} min`}</div>
                        <div className="text-xs text-black/60">{inQueue ? "You can only hold one spot" : peopleAhead === 0 ? "No wait — walk right in" : `${peopleAhead} ${peopleAhead===1?'person':'people'} ahead of you`}</div>
                      </div>
                    </div>
                    <span className={`hidden sm:inline-flex text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${inQueue ? 'bg-emerald-500 text-white' : 'bg-[#C5A059] text-black'}`}>{inQueue ? "1 SPOT HELD" : "$30 CLASSIC"}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full transition-all duration-500" style={{ width: `${peopleAhead===0?100: Math.max(15, 100 - peopleAhead*22)}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-black/50">{inQueue ? "In Line" : `~${waitMins}m`}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={handleLeaveQueue} disabled={!inQueue} className={`rounded-full py-2.5 text-xs font-black uppercase tracking-widest transition-colors border ${!inQueue ? 'bg-zinc-100 text-black/30 border-black/5 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-black border-transparent'}`}>
                      {inQueue ? "Leave My Spot" : "Not In Line"}
                    </button>
                    <button onClick={handleJoinQueue} disabled={inQueue} className={`rounded-full py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${inQueue ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed' : 'bg-[#111111] hover:bg-black text-white'}`}>
                      {inQueue ? "✓ One Spot Only" : "+ Join — One Spot"}
                    </button>
                  </div>
                  <div className="mt-3 text-center text-[10px] font-semibold tracking-wide text-black/40 uppercase">
                    {inQueue ? "You can only join once — one spot per person" : "Tap join once — you get one spot, no doubles"}
                  </div>
                </div>

                <div className="absolute top-0 right-6 sm:right-8 w-10 h-full opacity-90 hidden sm:block">
                  <div className="w-full h-full bg-[repeating-linear-gradient(45deg,white_0_12px,#C41E3A_12px_24px,#1A3A5F_24px_36px)]" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-6 bg-gradient-to-b from-[#C5A059] to-[#8B6F3A] rounded-t-full border border-black/20" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-6 bg-gradient-to-b from-[#8B6F3A] to-[#C5A059] rounded-b-full border border-black/20" />
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="relative rounded-[28px] overflow-hidden bg-[#111111] p-6 flex flex-col justify-between text-white">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '18px 18px' }} />
                  <div className="relative">
                    <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A059]">Queue Policy</div>
                    <div className="text-[18px] sm:text-[20px] font-black leading-tight mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>One person.<br />One spot.<br />No doubles.</div>
                    <div className="mt-2 text-xs text-white/60 leading-relaxed max-w-[220px]">Michael's rule keeps it fair — you can only hold one spot at a time.</div>
                  </div>
                  <div className="relative mt-4 flex items-center gap-2">
                    <button onClick={handleJoinQueue} disabled={inQueue} className={`text-[11px] tracking-widest uppercase font-black px-3.5 py-2 rounded-full transition-colors ${inQueue ? 'bg-emerald-500 text-white' : 'bg-white text-black'}`}>
                      {inQueue ? "✓ In Queue" : "Join Once"}
                    </button>
                    {inQueue && <span className="text-[10px] text-white/50">Tap Leave to free spot</span>}
                  </div>
                </div>
                <div className="relative rounded-[28px] overflow-hidden bg-[#C5A059] p-1">
                  <img src={IMAGES.detailChair} alt="Barber chairs inside the shop" className="w-full h-full object-cover rounded-[24px]" />
                  <div className="absolute bottom-2 left-2 right-2 bg-black text-white rounded-full px-3 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-widest uppercase">One Spot Rule</span>
                    <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#111111] text-[#C5A059] border-y border-white/10 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-6 mx-6 text-[13px] font-black tracking-[0.2em] uppercase">
              <span>One Spot Per Person</span>
              <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
              <span>Cut Right. Stay Sharp.</span>
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              <span>Walk-Ins Only • $30 Classic • 4.7★</span>
              <span className="w-1.5 h-1.5 bg-[#C41E3A] rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <section id="services" className="py-14 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#111111] text-white rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase">
                <span className="w-5 h-5 rounded-full bg-[#C5A059] flex items-center justify-center text-black">✂</span>
                One Chair • One Spot Per Person • $30 Flat
              </div>
              <h2 className="mt-4 text-[34px] sm:text-[52px] font-black tracking-tight leading-[0.9]" style={{ fontFamily: 'Playfair Display, serif' }}>
                The classic.<br />
                <span className="text-[#C5A059] italic font-black">$30. One spot.</span>
              </h2>
            </div>
            <div className="lg:max-w-[500px]">
              <p className="text-[15px] leading-relaxed text-black/60">
                Michael enforces one spot per person so no one can block the line. Join once, wait your turn, $30 classic.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-[#111111] text-white rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase">
                <span className={`w-2 h-2 rounded-full ${inQueue ? 'bg-emerald-400 animate-pulse' : 'bg-[#C5A059] animate-pulse'}`} />
                {inQueue ? `You're in line • ${peopleAhead} ahead • ${waitMins} min` : `Live: ${peopleAhead} ahead • ${waitMins} min • Join once`}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            <div className="bg-[#111111] text-white rounded-[32px] p-7 sm:p-10 relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-[#C5A059]/15 blur-[70px] rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black tracking-[0.2em] uppercase text-[#C5A059]">Michael's Rule</div>
                    <h3 className="mt-2 text-[32px] sm:text-[40px] font-black leading-none tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Classic Haircut
                    </h3>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="bg-white text-black rounded-full px-4 py-1.5 font-black text-lg">$30</span>
                      <span className="bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs font-bold tracking-widest uppercase">One Spot / Person</span>
                      <span className="hidden sm:inline-flex bg-[#C5A059] text-black rounded-full px-3 py-1.5 text-xs font-black tracking-widest uppercase">Michael • Owner</span>
                    </div>
                  </div>
                  <img src="/logo.png" alt="logo" className="w-16 h-16 object-contain bg-white rounded-2xl p-1 shadow-lg hidden sm:block" />
                </div>

                <div className="mt-8 grid sm:grid-cols-2 gap-8">
                  <div>
                    <div className="text-[11px] font-black tracking-widest uppercase text-white/50">What's Included — Same $30</div>
                    <ul className="mt-3 space-y-2.5">
                      {[
                        "Precision scissor & clipper classic",
                        "Straight-razor neck cleanup",
                        "Natural edge & sideburns",
                        "One spot in queue per person",
                        "Hot lather + brush off",
                      ].map(item => (
                        <li key={item} className="flex gap-3 text-sm text-white/80 leading-tight">
                          <span className="w-5 h-5 rounded-full bg-[#C5A059] text-black flex items-center justify-center shrink-0 text-[11px] font-black">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
                    <div className="text-xs font-black tracking-widest uppercase text-[#C5A059]">One Spot Only — No Doubles</div>
                    <p className="mt-2 text-sm text-white/60">
                      Join once, hold your place. Leave if plans change, then you can rejoin. Prevents line blocking.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={handleJoinQueue} disabled={inQueue} className={`rounded-full py-2.5 text-xs font-black tracking-widest uppercase transition-colors ${inQueue ? 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed' : 'bg-[#C5A059] text-black hover:bg-[#D4B27A]'}`}>
                        {inQueue ? "✓ Already In" : "+ Join Queue"}
                      </button>
                      <button onClick={handleLeaveQueue} disabled={!inQueue} className={`rounded-full py-2.5 text-xs font-black tracking-widest uppercase transition-colors border ${!inQueue ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-100 border-transparent'}`}>
                        Leave Spot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest uppercase">Live Queue — One Spot Rule</span>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${inQueue ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white'}`}>{inQueue ? "You're In" : `${peopleAhead} Ahead`}</span>
                </div>
                <div className="mt-4 bg-[#FDF8F0] border border-black/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black leading-none">{inQueue ? "You're in line" : `${peopleAhead} ${peopleAhead===1?'person':'people'} waiting`}</div>
                      <div className="text-xs text-black/60 font-semibold mt-1">{inQueue ? `One spot only • ${peopleAhead} ahead • ~${waitMins} min` : `Est. wait ~${waitMins} min • One spot per person`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black tracking-widest uppercase text-black/40">Your Status</div>
                      <div className={`font-black text-[13px] px-3 py-1 rounded-full ${inQueue ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-black/60'}`}>{inQueue ? "✓ In Queue" : "Not In"}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C5A059] rounded-full transition-all" style={{ width: `${peopleAhead===0?100:Math.max(20,100-peopleAhead*18)}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={handleLeaveQueue} disabled={!inQueue} className={`rounded-full py-2.5 text-xs font-black uppercase transition-colors ${!inQueue ? 'bg-zinc-100 text-black/20 border border-black/5 cursor-not-allowed' : 'bg-white border border-black/10 hover:bg-zinc-50'}`}>Leave Spot</button>
                    <button onClick={handleJoinQueue} disabled={inQueue} className={`rounded-full py-2.5 text-xs font-black uppercase transition-colors ${inQueue ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}>{inQueue ? "✓ One Spot Held" : "+ Join Once"}</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDE6D6] rounded-[28px] p-6 border border-black/5">
                <h4 className="font-black text-[16px] leading-tight">One spot per person — why?</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-black/60">
                  Stops someone from spamming the queue. You tap join once, you hold one place. Leave if plans change, then you can rejoin. Keeps it fair on busy Saturdays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Michael */}
      <section id="about" className="py-6 sm:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[32px] border border-black/10 overflow-hidden grid lg:grid-cols-2">
            <div className="relative min-h-[420px] sm:min-h-[560px] bg-[#111111] overflow-hidden">
              <img src={IMAGES.michaelPortrait} alt="Michael — owner of Baldy The Barber" className="absolute inset-0 w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 max-w-[380px]">
                  <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-lg shrink-0">M</div>
                  <div>
                    <div className="font-black text-sm leading-none">Michael — Owner & Barber</div>
                    <div className="text-xs text-black/60 leading-tight mt-1">“One chair, one spot per person, $30 classic. No one can hold two places — keeps it fair.”</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-6 left-6 bg-[#C5A059] text-black rounded-full px-4 py-2 text-xs font-black tracking-widest uppercase">
                Meet Michael — One Spot Rule
              </div>
            </div>
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.18em] uppercase text-[#C5A059]">
                <span className="w-8 h-[2px] bg-[#C5A059]" />
                Queue Policy
              </div>
              <h2 className="mt-3 text-[32px] sm:text-[38px] font-black leading-[0.95] tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                One spot.<br /> No <span className="text-[#C5A059]">doubles.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-black/60">
                You can only join the queue once until you leave. Tap Join, you hold your place. Tap Leave, it's free. Michael added this so one person can't block the board — fair for everyone on Route 611.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { k: inQueue ? "In Line ✓" : "Tap Join", v: "One spot only per person" },
                  { k: "4.7★ Rated", v: `${reviews.length} walk-in reviews` },
                  { k: "5+ Yrs OC", v: "Michael • Owner" },
                ].map(item => (
                  <div key={item.k} className="bg-[#FDF8F0] border border-black/5 rounded-2xl p-4 text-center">
                    <div className="font-black text-[13px] leading-tight">{item.k}</div>
                    <div className="text-[11px] leading-tight text-black/60 mt-1">{item.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={handleJoinQueue} disabled={inQueue} className={`flex-1 rounded-full py-3.5 text-[13px] font-black tracking-widest uppercase transition-colors ${inQueue ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}>
                  {inQueue ? "✓ You're In (One Spot)" : "Join Queue Once"}
                </button>
                <button onClick={handleLeaveQueue} disabled={!inQueue} className={`flex-1 rounded-full py-3.5 text-[13px] font-black tracking-widest uppercase transition-colors border ${!inQueue ? 'bg-zinc-100 text-black/30 border-black/5 cursor-not-allowed' : 'bg-white border-black/10 hover:bg-zinc-50'}`}>
                  Leave Spot
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-14 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#111111] text-white rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase">
                <span className="w-5 h-5 rounded-full bg-[#C5A059] flex items-center justify-center text-black">★</span>
                {avgRating} Stars • One Spot Rule • Owner Michael
              </div>
              <h2 className="mt-4 text-[30px] sm:text-[40px] font-black leading-[0.9] tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Real cuts.<br /> <span className="text-[#C5A059] italic">One spot each.</span>
              </h2>
            </div>
            <div className="flex gap-3">
              <button onClick={()=> setReviewOpen(true)} className="inline-flex items-center gap-2 bg-[#C5A059] text-black rounded-full px-6 py-3 text-sm font-black tracking-widest uppercase hover:bg-[#D4B27A] transition-colors">
                Leave a Review
              </button>
              <button onClick={()=> { navigator.clipboard?.writeText(window.location.href); setToast("Link copied") }} className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-6 py-3 text-sm font-black tracking-widest uppercase">
                Share
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white border border-black/10 rounded-[24px] p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#C5A059] text-sm">
                    {Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < r.stars ? "" : "opacity-20"}>★</span>)}
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase bg-[#FDF8F0] border border-black/5 px-2.5 py-1 rounded-full">{r.stars}.0</span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-black/70 flex-1">“{r.text}”</p>
                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                  <div className="font-black text-sm flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs">{r.name[0]}</span>
                    {r.name}
                  </div>
                  <div className="text-[11px] text-black/40 font-semibold">{r.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="py-14 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
            <div className="bg-[#111111] rounded-[32px] overflow-hidden text-white p-6 sm:p-8 lg:p-10 relative">
              <div className="absolute top-0 right-0 w-[360px] h-[360px] bg-[#C5A059]/15 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-[#C5A059] text-black rounded-full px-3 py-1.5 text-[11px] font-black tracking-[0.18em] uppercase">
                  Owner Michael • One Spot Only • {inQueue ? "You're In" : `${peopleAhead} Ahead`}
                </div>
                <h2 className="mt-4 text-[30px] sm:text-[36px] font-black leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
                  One spot<br />
                  <span className="text-[#C5A059]">per person.</span>
                </h2>

                <div className="mt-6 bg-white rounded-[20px] p-5 text-[#111111]">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-[13px] tracking-widest uppercase">Live Queue — One Spot Rule</div>
                    <span className={`text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${inQueue ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white'}`}>{inQueue ? "You: In Line" : `${peopleAhead} Waiting`}</span>
                  </div>
                  <div className="mt-3 bg-[#FDF8F0] border border-black/5 rounded-2xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{peopleAhead} ahead of you</span>
                      <span className="font-black">~{waitMins} min wait</span>
                    </div>
                    <div className="mt-2 text-[11px] text-black/50">{inQueue ? "✓ You hold one spot — can't join again until you leave" : "Tap Join once to hold your spot — one per person"}</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={handleJoinQueue} disabled={inQueue} className={`rounded-full py-2.5 text-xs font-black uppercase ${inQueue ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}>{inQueue ? "✓ One Spot Held" : "+ Join Once"}</button>
                      <button onClick={handleLeaveQueue} disabled={!inQueue} className={`rounded-full py-2.5 text-xs font-black uppercase border ${!inQueue ? 'bg-zinc-100 text-black/20 border-black/5 cursor-not-allowed' : 'bg-white border-black/10 hover:bg-zinc-50'}`}>Leave</button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white rounded-[20px] p-5 text-[#111111]">
                  <div className="font-black text-[13px] tracking-widest uppercase flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#C5A059] flex items-center justify-center">◷</span>
                    Hours — Walk-Ins Only
                  </div>
                  <div className="mt-4 divide-y divide-black/5">
                    {hours.map(h => (
                      <div key={h.day} className={`flex items-center justify-between py-2.5 text-sm ${h.closed ? 'opacity-60' : ''} ${h.highlight ? 'font-bold' : ''}`}>
                        <span className={`${h.highlight ? 'text-[#111111]' : h.closed ? 'text-black/50' : 'text-black/70'} font-semibold`}>{h.day}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${h.closed ? 'bg-zinc-100 text-black/50' : h.highlight ? 'bg-[#111111] text-white' : 'bg-zinc-100 text-black'}`}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[11px] text-black/50 font-medium">9935 Stephen Decatur Hwy, Ocean City, MD 21842</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a href="tel:5136384928" className="bg-[#C5A059] text-black rounded-full py-3.5 text-center font-black text-[13px] tracking-widest uppercase hover:bg-[#D4B27A] transition-colors">
                    Call Michael
                  </a>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=9935+Stephen+Decatur+Hwy+Ocean+City+MD+21842" target="_blank" rel="noreferrer" className="bg-white text-black rounded-full py-3.5 text-center font-black text-[13px] tracking-widest uppercase hover:bg-zinc-100 transition-colors">
                    Directions
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-black/10 overflow-hidden flex flex-col">
              <div className="h-[380px] sm:h-[440px] relative bg-[#EDE6D6] overflow-hidden">
                <iframe
                  title="Baldy the Barber Map"
                  src="https://www.google.com/maps?q=9935+Stephen+Decatur+Hwy+Ocean+City+MD+21842&z=15&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[340px] bg-white rounded-2xl p-4 shadow-xl border border-black/10">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="logo" className="w-12 h-12 object-contain" />
                    <div>
                      <div className="font-black text-sm leading-none">Baldy The Barber — Michael</div>
                      <div className="text-xs text-black/60">4.7★ • One Spot Per Person</div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${inQueue ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white'}`}>{inQueue ? "You're In ✓" : `${peopleAhead} ahead`}</span>
                        <span className="text-black/60">~{waitMins} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-7 mt-auto">
                <h3 className="font-black text-[16px]">One Spot Per Person — Fair Line</h3>
                <p className="mt-2 text-sm text-black/60">Join once, hold one spot. Can't double-book. Leave if you need to, then rejoin. Keeps Saturdays fair.</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={handleJoinQueue} disabled={inQueue} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black tracking-widest uppercase ${inQueue ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' : 'bg-[#111111] text-white'}`}>
                    {inQueue ? "✓ You're In Line" : "Join Queue — Once Only"}
                  </button>
                  <button onClick={handleLeaveQueue} disabled={!inQueue} className={`px-5 py-2.5 text-xs font-black uppercase rounded-full border ${!inQueue ? 'border-black/5 text-black/20 cursor-not-allowed' : 'border-black/10 hover:bg-zinc-50'}`}>Leave</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#C5A059] rounded-[28px] px-6 sm:px-10 py-8 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent 0 20px, black 20px 21px)` }} />
            <div className="relative flex items-center gap-4">
              <img src="/logo.png" alt="logo" className="w-16 h-16 object-contain bg-white rounded-2xl p-1 shadow-lg hidden sm:block" />
              <div>
                <div className="text-[12px] font-black tracking-[0.18em] uppercase text-black/60">One Spot Per Person • {inQueue ? "You're In" : "Join Once"}</div>
                <div className="text-[24px] sm:text-[30px] font-black leading-none tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{inQueue ? "You hold one spot." : "One tap. One spot."}<br className="sm:hidden" /> No doubles.</div>
              </div>
            </div>
            <div className="relative flex flex-wrap gap-3 w-full lg:w-auto">
              <button onClick={handleJoinQueue} disabled={inQueue} className={`flex-1 lg:flex-none rounded-full px-8 py-4 font-black tracking-widest uppercase text-sm transition-colors ${inQueue ? 'bg-black/10 text-black/40 border border-black/10 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-900'}`}>{inQueue ? "✓ In Line — One Spot Only" : "Join Queue Once"}</button>
              <button onClick={handleLeaveQueue} disabled={!inQueue} className={`flex-1 lg:flex-none rounded-full px-8 py-4 font-black tracking-widest uppercase text-sm border transition-colors ${!inQueue ? 'bg-white/50 text-black/30 border-black/10 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-50 border-black/10'}`}>Leave Spot</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0B0C] text-white pt-10 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] gap-8 pb-8 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Baldy Logo" className="w-14 h-14 object-contain bg-white rounded-2xl p-1" />
                <div>
                  <div className="font-black tracking-tight leading-none text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>BALDY THE BARBER</div>
                  <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-white/50">Michael • One Spot Rule • 4.7★</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-[360px]">
                One chair, $30 classic, one spot per person in queue. Walk-ins only, Route 611. Fair line, sharp cut.
              </p>
            </div>
            <div>
              <div className="text-xs font-black tracking-widest uppercase text-white/40">Queue Rule</div>
              <div className="mt-4 text-sm text-white/70 leading-relaxed">You can only join once until you leave. Prevents double booking, keeps wait honest.</div>
            </div>
            <div>
              <div className="text-xs font-black tracking-widest uppercase text-white/40">Hours</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex justify-between text-white/70"><span>Mon–Fri</span><span className="text-white font-bold">9–4</span></li>
                <li className="flex justify-between text-white/70"><span>Saturday</span><span className="text-white font-bold">9–2</span></li>
                <li className="flex justify-between text-white/40"><span>Sunday</span><span>Closed</span></li>
              </ul>
            </div>
            <div className="bg-white text-[#111111] rounded-2xl p-5">
              <div className="text-xs font-black tracking-widest uppercase">Queue Status</div>
              <div className="mt-2 font-black">{inQueue ? "✓ You're in line — One spot" : "Not in line — Join once"}</div>
              <div className="text-xs text-black/60 mt-1">{peopleAhead} ahead • ~{waitMins} min • 9935 Stephen Decatur Hwy</div>
              <button onClick={inQueue ? handleLeaveQueue : handleJoinQueue} className={`mt-4 w-full rounded-full py-3 text-xs font-black tracking-widest uppercase ${inQueue ? 'bg-zinc-100 border border-black/10 text-black' : 'bg-[#111111] text-white'}`}>
                {inQueue ? "Leave My Spot" : "Join Queue — One Spot Only"}
              </button>
            </div>
          </div>
          <div className="pt-6 text-xs text-white/40">© {new Date().getFullYear()} Baldy The Barber — Owner Michael • One Spot Per Person • $30 Classic</div>
        </div>
      </footer>

      {/* Info Modal */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)} />
          <div className="relative bg-[#FDF8F0] w-full sm:max-w-[520px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-auto max-h-[90vh]">
            <div className="sticky top-0 bg-[#FDF8F0] border-b border-black/10 px-6 py-5 flex items-center justify-between">
              <div className="font-black">One Spot Per Person — How It Works</div>
              <button onClick={() => setInfoOpen(false)} className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4 text-sm leading-relaxed">
              <p><b>Rule:</b> You can only hold one spot at a time. Tap Join once, you're in. Tap again and it tells you you're already in. Leave to free your spot.</p>
              <p><b>Why?</b> Stops someone from spamming the board and jumping line. Keeps it fair — Michael sees real count.</p>
              <p><b>Current:</b> {peopleAhead} people ahead, ~{waitMins} min. {inQueue ? "You have 1 spot held." : "You're not in line yet — tap Join once."}</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={handleJoinQueue} disabled={inQueue} className={`rounded-full py-3 text-xs font-black uppercase ${inQueue ? 'bg-zinc-100 text-black/30 cursor-not-allowed' : 'bg-[#111111] text-white'}`}>{inQueue ? "✓ Already In" : "Join Once"}</button>
                <button onClick={handleLeaveQueue} disabled={!inQueue} className={`rounded-full py-3 text-xs font-black uppercase border ${!inQueue ? 'bg-white text-black/20 border-black/5 cursor-not-allowed' : 'bg-white border-black/10'}`}>Leave Spot</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewOpen(false)} />
          <div className="relative bg-[#FDF8F0] w-full sm:max-w-[520px] max-h-[92vh] overflow-auto rounded-t-[28px] sm:rounded-[28px] shadow-2xl border border-black/10">
            <div className="sticky top-0 bg-[#FDF8F0] border-b border-black/10 px-6 py-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-black">★</div>
                <div>
                  <div className="font-black leading-none">Leave a Review for Michael</div>
                  <div className="text-xs text-black/50 font-semibold">4.7★ average</div>
                </div>
              </div>
              <button onClick={() => setReviewOpen(false)} className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAddReview} className="px-6 py-6 space-y-5">
              <div>
                <label className="text-xs font-black tracking-widest uppercase text-black/60">Your Rating</label>
                <div className="mt-2 flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={()=> setNewStars(n)} className={`w-11 h-11 rounded-full border flex items-center justify-center text-lg ${newStars>=n ? 'bg-[#111111] text-[#C5A059] border-[#111111]' : 'bg-white border-black/10 text-black/30'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black tracking-widest uppercase text-black/60">Your Name</label>
                <input value={newName} onChange={e=>setNewName(e.target.value)} required placeholder="e.g. Alex" className="mt-2 w-full bg-white border border-black/10 rounded-2xl px-4 py-3.5 text-sm font-semibold" />
              </div>
              <div>
                <label className="text-xs font-black tracking-widest uppercase text-black/60">Your Review</label>
                <textarea value={newText} onChange={e=>setNewText(e.target.value)} required rows={4} placeholder="How was your cut?" className="mt-2 w-full bg-white border border-black/10 rounded-2xl px-4 py-3.5 text-sm" />
              </div>
              <button type="submit" className="w-full bg-[#111111] text-white rounded-full py-4 font-black tracking-widest uppercase text-sm">Post Review — {newStars}★</button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3 text-sm font-semibold max-w-[90vw]">
          <span className="w-7 h-7 rounded-full bg-[#C5A059] flex items-center justify-center text-black">✓</span>
          <span className="truncate">{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        .animate-marquee {
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  )
}
