import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Leaf,
  Plus,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'starr-mantra-quotes-v1';
const SWIPE_THRESHOLD = 58;

const starterQuotes = [
  {
    id: makeId(),
    text: 'Imagination is more important than knowledge.',
    author: 'Albert Einstein',
    source: '',
    tag: 'Vision',
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(),
    text: 'One must still have chaos in oneself to be able to give birth to a dancing star.',
    author: 'Friedrich Nietzsche',
    source: 'Thus Spoke Zarathustra',
    tag: 'Creative Fire',
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(),
    text: 'We know what we are, but know not what we may be.',
    author: 'William Shakespeare',
    source: 'Hamlet',
    tag: 'Becoming',
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId(),
    text: 'The people who are crazy enough to think they can change the world are the ones who do.',
    author: 'Apple',
    source: 'Think Different',
    tag: 'Change',
    createdAt: new Date().toISOString(),
  },
];

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starterQuotes;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : starterQuotes;
  } catch {
    return starterQuotes;
  }
}

function cleanQuote(item) {
  return {
    id: item.id || makeId(),
    text: String(item.text || '').trim(),
    author: String(item.author || 'Unknown').trim(),
    source: String(item.source || '').trim(),
    tag: String(item.tag || 'Mantra').trim(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function StarrTreeMark() {
  return (
    <div className="mark" aria-hidden="true">
      <div className="markGlow" />
      <svg viewBox="0 0 96 96" role="img">
        <path className="trunk" d="M48 78 C48 60 48 47 48 28" />
        <path className="leafA" d="M48 43 C33 33 25 23 20 11 C35 13 47 23 48 37" />
        <path className="leafB" d="M49 40 C62 27 73 20 86 18 C82 34 68 43 50 45" />
        <path className="leafC" d="M47 56 C31 48 17 46 7 48 C16 62 31 67 47 60" />
        <path className="leafD" d="M49 57 C64 49 78 50 90 55 C78 68 61 69 49 61" />
        <circle className="fruit" cx="48" cy="20" r="5" />
        <circle className="fruit small" cx="31" cy="38" r="3" />
        <circle className="fruit small" cx="68" cy="35" r="3" />
        <path className="root" d="M25 82 C37 89 59 89 71 82" />
      </svg>
    </div>
  );
}

function QuoteCard({ quote, dragX, isDragging, onPointerDown, onPointerMove, onPointerUp }) {
  const rotation = Math.max(-8, Math.min(8, dragX / 22));

  return (
    <article
      className={`quoteCard ${isDragging ? 'dragging' : ''}`}
      style={{ transform: `translateX(${dragX}px) rotate(${rotation}deg)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="cardTexture" />
      <div className="cardTopline">
        <span className="tag"><Leaf size={15} />{quote.tag || 'Mantra'}</span>
        <Sparkles className="sparkIcon" size={20} />
      </div>
      <blockquote>“{quote.text}”</blockquote>
      <footer>
        <p>— {quote.author || 'Unknown'}</p>
        {quote.source ? <span>{quote.source}</span> : null}
      </footer>
      <div className="swipeHint">Swipe left or right</div>
    </article>
  );
}

function QuoteForm({ form, setForm, onSubmit, onClose }) {
  return (
    <form className="quoteForm" onSubmit={onSubmit}>
      <div className="formHeader">
        <strong>Plant a new mantra</strong>
        <button type="button" className="iconBtn ghost" onClick={onClose} aria-label="Close quote form"><X size={18} /></button>
      </div>
      <textarea
        value={form.text}
        onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
        placeholder="Quote text"
        rows={4}
        required
      />
      <div className="formGrid">
        <input value={form.author} onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))} placeholder="Author" />
        <input value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} placeholder="Book, song, speech..." />
        <input value={form.tag} onChange={(event) => setForm((current) => ({ ...current, tag: event.target.value }))} placeholder="Tag" />
      </div>
      <button className="primaryBtn" type="submit"><Plus size={18} /> Add to the tree</button>
    </form>
  );
}

function App() {
  const [quotes, setQuotes] = useState(loadQuotes);
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ text: '', author: '', source: '', tag: '' });
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef(null);
  const fileRef = useRef(null);

  const filteredQuotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((quote) => [quote.text, quote.author, quote.source, quote.tag].join(' ').toLowerCase().includes(q));
  }, [quotes, query]);

  const activeQuote = filteredQuotes[index] || filteredQuotes[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  useEffect(() => {
    if (index >= filteredQuotes.length) setIndex(0);
  }, [filteredQuotes.length, index]);

  function goNext() {
    if (!filteredQuotes.length) return;
    setDragX(0);
    setIndex((current) => (current + 1) % filteredQuotes.length);
  }

  function goPrev() {
    if (!filteredQuotes.length) return;
    setDragX(0);
    setIndex((current) => (current - 1 + filteredQuotes.length) % filteredQuotes.length);
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStart.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
  }

  function onPointerMove(event) {
    if (!pointerStart.current) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      event.preventDefault();
      setDragX(dx);
    }
  }

  function onPointerUp() {
    if (!pointerStart.current) return;
    const finalX = dragX;
    pointerStart.current = null;
    setIsDragging(false);
    if (finalX > SWIPE_THRESHOLD) goPrev();
    else if (finalX < -SWIPE_THRESHOLD) goNext();
    else setDragX(0);
  }

  function addQuote(event) {
    event.preventDefault();
    if (!form.text.trim()) return;
    const nextQuote = cleanQuote({ ...form, id: makeId(), createdAt: new Date().toISOString() });
    setQuotes((current) => [nextQuote, ...current]);
    setForm({ text: '', author: '', source: '', tag: '' });
    setFormOpen(false);
    setQuery('');
    setIndex(0);
  }

  function deleteActive() {
    if (!activeQuote) return;
    setQuotes((current) => current.filter((quote) => quote.id !== activeQuote.id));
    setIndex(0);
  }

  function shuffleQuote() {
    if (filteredQuotes.length < 2) return;
    let next = Math.floor(Math.random() * filteredQuotes.length);
    if (next === index) next = (next + 1) % filteredQuotes.length;
    setIndex(next);
  }

  function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'starr-mantra-quotes.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function importQuotes(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const cleaned = Array.isArray(parsed) ? parsed.map(cleanQuote).filter((quote) => quote.text) : [];
        if (!cleaned.length) throw new Error('No quotes found.');
        setQuotes(cleaned);
        setIndex(0);
        setQuery('');
      } catch {
        alert('Could not import that file. Use a JSON export from Starr Mantra.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <main className="appShell">
      <div className="aurora one" />
      <div className="aurora two" />
      <div className="stars" />

      <section className="layout">
        <header className="hero">
          <div className="brandRow">
            <StarrTreeMark />
            <div>
              <p className="eyebrow">Starr-Tree Archive</p>
              <h1>Starr Mantra</h1>
              <p className="subhead">A quote book that grows with you. Swipe the cards, plant new mantras, and keep the wisdom close.</p>
            </div>
          </div>

          <div className="heroActions">
            <button className="primaryBtn" onClick={() => setFormOpen(true)}><Plus size={18} /> New quote</button>
            <button className="secondaryBtn" onClick={exportQuotes}><Download size={18} /> Export</button>
          </div>
        </header>

        <section className="toolbar" aria-label="Quote tools">
          <label className="searchBox">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setIndex(0); }}
              placeholder="Search quote, author, tag..."
            />
          </label>
          <div className="toolButtons">
            <button className="iconBtn" onClick={shuffleQuote} aria-label="Shuffle quotes"><Shuffle size={18} /></button>
            <button className="iconBtn" onClick={() => fileRef.current?.click()} aria-label="Import quotes"><Upload size={18} /></button>
            <button className="iconBtn danger" onClick={deleteActive} aria-label="Delete active quote"><Trash2 size={18} /></button>
            <input ref={fileRef} className="hiddenInput" type="file" accept="application/json" onChange={importQuotes} />
          </div>
        </section>

        {formOpen && <QuoteForm form={form} setForm={setForm} onSubmit={addQuote} onClose={() => setFormOpen(false)} />}

        <section className="stage" aria-label="Swipeable mantra card carousel">
          <button className="navArrow left" onClick={goPrev} aria-label="Previous quote"><ChevronLeft size={30} /></button>

          <div className="cardZone">
            {activeQuote ? (
              <QuoteCard
                key={activeQuote.id}
                quote={activeQuote}
                dragX={dragX}
                isDragging={isDragging}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            ) : (
              <div className="emptyCard"><BookOpen size={40} /><p>No quotes found. Clear search or add a new mantra.</p></div>
            )}
          </div>

          <button className="navArrow right" onClick={goNext} aria-label="Next quote"><ChevronRight size={30} /></button>
        </section>

        <section className="statusBar">
          <span>{filteredQuotes.length ? `${index + 1} / ${filteredQuotes.length}` : '0 / 0'}</span>
          <span><Star size={14} /> {quotes.length} saved</span>
          <span>Auto-saves on this device</span>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
