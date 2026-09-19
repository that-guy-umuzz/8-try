import { useEffect, useMemo, useState } from 'react'

type Review = { id: number; name: string; text: string; stars: number; tag: string }

const INITIAL_REVIEWS: Review[] = [
  { id: 1, name: 'Mike R.', text: "Simplest shop in OC and that's why I love it. No app, no BS. Walk in, $30, best classic I've had.", stars: 5, tag: 'Google • Walk-in' },
  { id: 2, name: 'J. Torres', text: "Michael's got over 5 years in Ocean City and it shows. Clean, quick, $30 flat.", stars: 5, tag: 'Google • Walk-in' },
  { id: 3, name: 'Carlos D.', text: 'One chair, one cut — done right. No upsell. $30, in and out sharp.', stars: 4, tag: 'Google • Walk-in' },
]

const MAX_SPOTS = 2
const PEOPLE_AHEAD = 2

const readNumber = (key: string) => {
  try {
    const value = Number.parseInt(localStorage.getItem(key) || '0', 10)
    return Number.isFinite(value) ? Math.min(Math.max(value, 0), MAX_SPOTS) : 0
  } catch {
    return 0
  }
}

export default function App() {
  const [spots, setSpots] = useState(() => readNumber('baldy_join_count'))
  const [toast, setToast] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('baldy_reviews')
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS
    } catch {
      return INITIAL_REVIEWS
    }
  })
  const [reviewOpen, setReviewOpen] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [stars, setStars] = useState(5)

  const waitMins = useMemo(() => PEOPLE_AHEAD * 18 + 8, [])
  const average = useMemo(() => (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1), [reviews])

  useEffect(() => {
    try { localStorage.setItem('baldy_join_count', String(spots)) } catch {}
  }, [spots])

  useEffect(() => {
    try { localStorage.setItem('baldy_reviews', JSON.stringify(reviews)) } catch {}
  }, [reviews])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const joinQueue = () => {
    if (spots >= MAX_SPOTS) {
      setToast(`You already have ${MAX_SPOTS} spots — maximum reached.`)
      return
    }
    const next = spots + 1
    setSpots(next)
    setToast(`Joined! ${next}/${MAX_SPOTS} spots held. ${PEOPLE_AHEAD} ahead — Michael will see you soon.`)
  }

  const leaveQueue = () => {
    if (spots === 0) {
      setToast("You're not in the queue right now.")
      return
    }
    const next = spots - 1
    setSpots(next)
    setToast(next === 0 ? 'You left the queue.' : `Removed one spot. ${next}/${MAX_SPOTS} spot remains.`)
  }

  const addReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedText = text.trim()
    if (!trimmedName || !trimmedText) return
    setReviews(current => [...current, {
      id: Date.now(), name: trimmedName, text: trimmedText, stars,
      tag: 'Walk-in • Just now',
    }])
    setName('')
    setText('')
    setStars(5)
    setReviewOpen(false)
    setToast(`Thanks ${trimmedName}! Review added — ${stars} stars`)
  }

  const status = spots === 0 ? 'Not in line' : `${spots}/${MAX_SPOTS} spots held`

  return (
    <main className="min-h-screen bg-[#FDF8F0] text-[#111111]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="bg-[#111111] text-[#FDF8F0]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#C5A059]">OCEAN CITY, MD • MICHAEL</p>
            <h1 className="text-xl font-black">BALDY THE BARBER</h1>
          </div>
          <a className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-[#C5A059]" href="tel:5136384928">Call Michael</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[32px] bg-[#0B0B0C] p-8 text-white sm:p-12">
          <p className="inline-block rounded-full bg-[#C5A059] px-3 py-1 text-xs font-black uppercase tracking-widest text-black">Walk-ins only • up to two spots</p>
          <h2 className="mt-6 text-5xl font-black leading-[.9] sm:text-7xl">BEST<br /><span className="italic text-[#C5A059]">BARBER</span><br />IN WEST OC.</h2>
          <p className="mt-6 max-w-xl text-white/70">A $30 classic haircut from Michael. You can now hold up to two spots in the queue, so you can join for yourself and one other person.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={joinQueue} disabled={spots >= MAX_SPOTS} className="rounded-full bg-[#C5A059] px-6 py-4 text-sm font-black uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40">{spots >= MAX_SPOTS ? 'Two spots held' : 'Join queue'}</button>
            <button onClick={leaveQueue} disabled={spots === 0} className="rounded-full border border-white/30 px-6 py-4 text-sm font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40">Leave one spot</button>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><b className="block text-lg">{status}</b><small className="text-white/50">Your queue status</small></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><b className="block text-lg">{PEOPLE_AHEAD}</b><small className="text-white/50">People ahead</small></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><b className="block text-lg">~{waitMins}m</b><small className="text-white/50">Estimated wait</small></div>
          </div>
        </div>

        <div className="rounded-[32px] bg-[#C5A059] p-8 sm:p-12">
          <p className="text-xs font-black uppercase tracking-widest text-black/60">Live queue</p>
          <h2 className="mt-3 text-4xl font-black">Two spots max.</h2>
          <p className="mt-4 text-black/70">Each press of Join adds one spot. Press it twice to hold two spots. A third press is blocked. Leave removes one spot at a time.</p>
          <div className="mt-8 rounded-3xl bg-white p-6">
            <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest">Your spots</span><strong>{spots}/{MAX_SPOTS}</strong></div>
            <div className="mt-4 flex gap-2">{Array.from({ length: MAX_SPOTS }).map((_, index) => <span key={index} className={`h-4 flex-1 rounded-full ${index < spots ? 'bg-[#111111]' : 'bg-black/10'}`} />)}</div>
            <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={joinQueue} disabled={spots >= MAX_SPOTS} className="rounded-full bg-[#111111] py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-30">+ Add spot</button><button onClick={leaveQueue} disabled={spots === 0} className="rounded-full border border-black/10 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-30">Remove one</button></div>
          </div>
          <p className="mt-6 text-sm font-bold">9935 Stephen Decatur Hwy, Ocean City, MD 21842</p>
          <p className="mt-2 text-sm">Mon–Fri 9–4 • Saturday 9–2 • Sunday closed</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-[#C5A059]">{average}★ average</p><h2 className="mt-2 text-4xl font-black">Real cuts.</h2></div><button onClick={() => setReviewOpen(true)} className="rounded-full bg-[#111111] px-5 py-3 text-xs font-black uppercase tracking-widest text-white">Leave a review</button></div>
        <div className="grid gap-4 md:grid-cols-3">{reviews.map(review => <article key={review.id} className="rounded-3xl border border-black/10 bg-white p-6"><div className="text-[#C5A059]">{'★'.repeat(review.stars)}<span className="opacity-20">{'★'.repeat(5 - review.stars)}</span></div><p className="mt-3 text-sm leading-relaxed text-black/70">“{review.text}”</p><p className="mt-5 border-t border-black/5 pt-4 text-sm font-black">{review.name} <span className="font-normal text-black/40">• {review.tag}</span></p></article>)}</div>
      </section>

      {reviewOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><form onSubmit={addReview} className="w-full max-w-lg rounded-3xl bg-[#FDF8F0] p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Leave a review</h2><button type="button" onClick={() => setReviewOpen(false)} className="text-2xl">×</button></div><div className="mt-5 flex gap-2">{[1, 2, 3, 4, 5].map(value => <button type="button" key={value} onClick={() => setStars(value)} className="text-2xl">{value <= stars ? '★' : '☆'}</button>)}</div><input required value={name} onChange={event => setName(event.target.value)} placeholder="Your name" className="mt-5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3" /><textarea required value={text} onChange={event => setText(event.target.value)} placeholder="How was your cut?" rows={4} className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3" /><button className="mt-4 w-full rounded-full bg-[#111111] py-4 text-sm font-black uppercase tracking-widest text-white">Post review</button></form></div>}
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </main>
  )
}
