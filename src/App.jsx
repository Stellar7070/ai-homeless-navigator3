import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone, MessageCircle, MapPin, Search, Heart, CheckSquare, Square,
  Type as TypeIcon, Utensils, Droplets, HeartPulse, Shirt,
  Bus, ShieldAlert, Sparkles, Plus, Trash2, Loader2, Home as HomeIcon,
  BookOpen, FileText, Briefcase, Send, X, ChevronDown, Library
} from "lucide-react";

/* ---------------------------------------------------------
   Design tokens (navy / white / green / light gray)
--------------------------------------------------------- */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@500;700;800&family=Source+Sans+3:wght@400;500;600&display=swap');`;

const COLORS = {
  navy900: "#0F1F3D",
  navy700: "#1B3A63",
  navy50: "#EDF1F7",
  green600: "#2F7A56",
  green100: "#E4F3EA",
  gray100: "#F4F6F7",
  gray300: "#DCE1E5",
  ink: "#182233",
  white: "#FFFFFF",
};

/* ---------------------------------------------------------
   Mock resource data (replace with a real database / API)
--------------------------------------------------------- */
const CATEGORIES = [
  { id: "shelter", label: "Shelter", icon: HomeIcon },
  { id: "food", label: "Food", icon: Utensils },
  { id: "hygiene", label: "Shower & Laundry", icon: Droplets },
  { id: "medical", label: "Medical & Mental Health", icon: HeartPulse },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "veterans", label: "Veterans", icon: ShieldAlert },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "library", label: "Library & Wi-Fi", icon: Library },
  { id: "transit", label: "Transportation", icon: Bus },
];

const MOCK_RESOURCES = [
  { id: 1, cat: "shelter", name: "Riverside Emergency Shelter", detail: "Beds available for individuals and families. Check-in after 4pm.", hours: "Open 24/7", phone: "555-0101", dist: "0.8 mi" },
  { id: 2, cat: "shelter", name: "New Hope Transitional Housing", detail: "90-day transitional program, case management included.", hours: "Office hrs 9am–5pm", phone: "555-0102", dist: "1.4 mi" },
  { id: 3, cat: "food", name: "Grace Community Food Bank", detail: "Free groceries, no ID required for first visit.", hours: "Mon/Wed/Fri 10am–2pm", phone: "555-0110", dist: "0.5 mi" },
  { id: 4, cat: "food", name: "St. Anthony's Soup Kitchen", detail: "Hot lunch served daily, all welcome.", hours: "Daily 11:30am–1pm", phone: "555-0111", dist: "1.1 mi" },
  { id: 5, cat: "hygiene", name: "Downtown Day Center Showers", detail: "Free showers, towels and hygiene kits provided.", hours: "Mon–Sat 7am–11am", phone: "555-0120", dist: "0.9 mi" },
  { id: 6, cat: "hygiene", name: "Community Laundry Project", detail: "Free wash & dry, one load per visit.", hours: "Tue/Thu 9am–1pm", phone: "555-0121", dist: "1.6 mi" },
  { id: 7, cat: "medical", name: "Open Door Health Clinic", detail: "Walk-in medical care regardless of insurance status.", hours: "Mon–Fri 8am–6pm", phone: "555-0130", dist: "1.0 mi" },
  { id: 8, cat: "medical", name: "Harborview Mental Health Access", detail: "Same-day mental health intake and counseling referrals.", hours: "Mon–Fri 9am–4pm", phone: "555-0131", dist: "2.1 mi" },
  { id: 9, cat: "clothing", name: "Second Chance Clothing Closet", detail: "Free seasonal clothing and interview attire.", hours: "Wed 10am–3pm", phone: "555-0140", dist: "1.3 mi" },
  { id: 10, cat: "veterans", name: "VA Regional Outreach Office", detail: "Benefits screening and veteran-specific housing referrals.", hours: "Mon–Fri 8am–4:30pm", phone: "555-0150", dist: "2.4 mi" },
  { id: 11, cat: "employment", name: "WorkFirst Job Center", detail: "Resume help, interview prep, and same-day day-labor postings.", hours: "Mon–Fri 8am–5pm", phone: "555-0160", dist: "1.7 mi" },
  { id: 12, cat: "library", name: "Central Public Library", detail: "Free computers, Wi-Fi, and phone charging, no library card needed to sit inside.", hours: "Daily 9am–8pm", phone: "555-0170", dist: "0.6 mi" },
  { id: 13, cat: "transit", name: "Metro Transit Pass Assistance", detail: "Reduced-fare and voucher program for qualifying riders.", hours: "Mon–Fri 9am–5pm", phone: "555-0180", dist: "1.2 mi" },
];

const GUIDES = [
  {
    id: "benefits",
    icon: FileText,
    title: "Applying for benefits",
    body: "SNAP, Medicaid, SSI/SSDI, and TANF are handled by your state's benefits office. Most let you start an application online or by phone, then finish with an in-person or phone interview. Bring any ID you have — a missing document is not a reason to be turned away from starting an application; ask about hardship or expedited processing if you have no address or income.",
  },
  {
    id: "documents",
    icon: FileText,
    title: "Replacing lost documents",
    body: "Start with a state ID or driver's license through your state DMV — many offer a reduced fee or fee waiver for people experiencing homelessness. A birth certificate is requested from the state of birth's vital records office. A free Social Security card replacement is available through the Social Security Administration. Case managers at shelters can often help cover fees or navigate the paperwork.",
  },
  {
    id: "employment",
    icon: Briefcase,
    title: "Finding work",
    body: "Local workforce centers offer free resume help, interview clothing, and job leads, including same-day day-labor work. Community colleges often have free short-term training programs tied directly to local job openings. A shelter address or a general-delivery mailing address at the post office can be used on applications if you don't have a permanent address yet.",
  },
];

/* ---------------------------------------------------------
   Local persistence (browser localStorage — this is a real
   website, not a Claude.ai artifact, so localStorage is fine)
--------------------------------------------------------- */
function loadLocal(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save failed", e);
  }
}

/* ---------------------------------------------------------
   Main App
--------------------------------------------------------- */
export default function App() {
  const [tab, setTab] = useState("ai");
  const [largeText, setLargeText] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [saved, setSaved] = useState(() => loadLocal("nav-saved-resources", []));
  const [checklist, setChecklist] = useState(() => loadLocal("nav-checklist", []));
  const [checklistInput, setChecklistInput] = useState("");

  const toggleSaved = (resource) => {
    setSaved((prev) => {
      const exists = prev.some((r) => r.id === resource.id);
      const next = exists ? prev.filter((r) => r.id !== resource.id) : [...prev, resource];
      saveLocal("nav-saved-resources", next);
      return next;
    });
  };

  const addChecklistItem = () => {
    if (!checklistInput.trim()) return;
    const next = [...checklist, { id: Date.now(), text: checklistInput.trim(), done: false }];
    setChecklist(next);
    saveLocal("nav-checklist", next);
    setChecklistInput("");
  };
  const toggleChecklistItem = (id) => {
    const next = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    setChecklist(next);
    saveLocal("nav-checklist", next);
  };
  const removeChecklistItem = (id) => {
    const next = checklist.filter((c) => c.id !== id);
    setChecklist(next);
    saveLocal("nav-checklist", next);
  };

  const filteredResources = activeCat
    ? MOCK_RESOURCES.filter((r) => r.cat === activeCat)
    : MOCK_RESOURCES;

  return (
    <div
      style={{
        fontFamily: "'Source Sans 3', sans-serif",
        background: COLORS.gray100,
        color: COLORS.ink,
        minHeight: "100vh",
        fontSize: largeText ? "18px" : "15px",
        lineHeight: 1.5,
      }}
    >
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        .lfHead { font-family: 'Libre Franklin', sans-serif; }
        .tapTarget:focus-visible { outline: 3px solid ${COLORS.green600}; outline-offset: 2px; }
        button, input { font-family: inherit; font-size: inherit; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Sticky emergency bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: COLORS.navy900,
          color: COLORS.white,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          borderBottom: `3px solid ${COLORS.green600}`,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85em", fontWeight: 600, marginRight: "4px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green600, animation: "livePulse 2s ease-in-out infinite" }} />
          Help is always one tap away
        </span>
        <EmergencyChip href="tel:911" label="Call 911" />
        <EmergencyChip href="tel:988" label="988 Crisis Lifeline" />
        <EmergencyChip href="sms:88788&body=START" label="Text START (DV)" />
        <EmergencyChip href="tel:988" label="Veteran Crisis Line" sub="press 1" />
      </div>

      {/* Header */}
      <header style={{ padding: "20px 20px 12px", background: COLORS.white, borderBottom: `1px solid ${COLORS.gray300}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="lfHead" style={{ margin: 0, fontSize: "1.5em", fontWeight: 800, color: COLORS.navy900 }}>
              AI Homeless Navigator
            </h1>
            <p style={{ margin: "2px 0 0", color: COLORS.navy700, fontWeight: 500, fontSize: "0.95em" }}>
              Helping people find hope, resources, and their next step.
            </p>
          </div>
          <button
            className="tapTarget"
            onClick={() => setLargeText((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: largeText ? COLORS.green100 : COLORS.gray100,
              border: `1px solid ${COLORS.gray300}`, borderRadius: 8,
              padding: "8px 12px", cursor: "pointer", color: COLORS.ink, fontWeight: 600,
            }}
            aria-pressed={largeText}
          >
            <TypeIcon size={16} /> Large text
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "14px", maxWidth: 420 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <MapPin size={16} style={{ position: "absolute", left: 10, top: 11, color: COLORS.navy700 }} />
            <input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setLocationLabel(locationInput)}
              placeholder="Enter ZIP code or city"
              style={{ width: "100%", padding: "9px 10px 9px 32px", borderRadius: 8, border: `1px solid ${COLORS.gray300}` }}
            />
          </div>
          <button
            className="tapTarget"
            onClick={() => setLocationLabel(locationInput)}
            style={{ background: COLORS.navy700, color: COLORS.white, border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 700, cursor: "pointer" }}
          >
            Set area
          </button>
        </div>
        {locationLabel && (
          <p style={{ margin: "8px 0 0", fontSize: "0.85em", color: COLORS.navy700 }}>
            Showing resources near <strong>{locationLabel}</strong> (demo data — wire up a real geocoding/Places API here)
          </p>
        )}
      </header>

      {/* Tabs */}
      <nav style={{ display: "flex", gap: 4, padding: "10px 20px 0", background: COLORS.white, borderBottom: `1px solid ${COLORS.gray300}`, overflowX: "auto" }}>
        {[
          { id: "ai", label: "Ask for Help", icon: MessageCircle },
          { id: "find", label: "Find Resources", icon: Search },
          { id: "guides", label: "Guides", icon: BookOpen },
          { id: "list", label: "My List", icon: Heart },
        ].map((t) => (
          <button
            key={t.id}
            className="tapTarget"
            onClick={() => setTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px", border: "none", background: "transparent",
              borderBottom: tab === t.id ? `3px solid ${COLORS.green600}` : "3px solid transparent",
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? COLORS.navy900 : COLORS.navy700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: 20, maxWidth: 760, margin: "0 auto" }}>
        {tab === "ai" && <AIAssistantPanel />}
        {tab === "find" && (
          <FindResourcesPanel
            activeCat={activeCat}
            setActiveCat={setActiveCat}
            resources={filteredResources}
            saved={saved}
            toggleSaved={toggleSaved}
          />
        )}
        {tab === "guides" && <GuidesPanel />}
        {tab === "list" && (
          <MyListPanel
            saved={saved}
            toggleSaved={toggleSaved}
            checklist={checklist}
            checklistInput={checklistInput}
            setChecklistInput={setChecklistInput}
            addChecklistItem={addChecklistItem}
            toggleChecklistItem={toggleChecklistItem}
            removeChecklistItem={removeChecklistItem}
          />
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "18px 20px 26px", color: COLORS.navy700, fontSize: "0.8em" }}>
        Demo build. Listings shown are sample data, not verified live resources.
        If you are in immediate danger, use the emergency bar above.
      </footer>
    </div>
  );
}

function EmergencyChip({ href, label, sub }) {
  return (
    <a
      href={href}
      className="tapTarget"
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: "rgba(255,255,255,0.1)", color: COLORS.white,
        padding: "6px 10px", borderRadius: 6, textDecoration: "none",
        fontSize: "0.85em", fontWeight: 600,
      }}
    >
      <Phone size={13} /> {label}
      {sub && <span style={{ opacity: 0.7, fontWeight: 400 }}>({sub})</span>}
    </a>
  );
}

/* ---------------------------------------------------------
   AI Assistant Panel — now calls our own /api/chat function
--------------------------------------------------------- */
function AIAssistantPanel() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I'm here to help. Tell me what you need right now — a place to sleep tonight, food, medical care, or anything else — and I'll walk you through the next step." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setSending(false);
    }
  }, [input, messages, sending]);

  return (
    <div style={{ background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.gray300}`, display: "flex", flexDirection: "column", height: 480 }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? COLORS.navy700 : COLORS.green100,
              color: m.role === "user" ? COLORS.white : COLORS.ink,
              padding: "10px 13px",
              borderRadius: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <div style={{ alignSelf: "flex-start", color: COLORS.navy700, display: "flex", alignItems: "center", gap: 6 }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Thinking…
          </div>
        )}
        {error && <div style={{ color: "#B42318", fontSize: "0.9em" }}>{error}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${COLORS.gray300}` }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="What do you need help with?"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${COLORS.gray300}` }}
        />
        <button
          className="tapTarget"
          onClick={send}
          disabled={sending}
          style={{ background: COLORS.green600, color: COLORS.white, border: "none", borderRadius: 8, padding: "0 16px", cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1 }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Find Resources Panel
--------------------------------------------------------- */
function FindResourcesPanel({ activeCat, setActiveCat, resources, saved, toggleSaved }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <CategoryChip label="All" active={!activeCat} onClick={() => setActiveCat(null)} icon={Sparkles} />
        {CATEGORIES.map((c) => (
          <CategoryChip key={c.id} label={c.label} icon={c.icon} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {resources.map((r) => {
          const isSaved = saved.some((s) => s.id === r.id);
          return (
            <div key={r.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray300}`, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: COLORS.navy900 }}>{r.name}</div>
                <div style={{ fontSize: "0.9em", margin: "3px 0" }}>{r.detail}</div>
                <div style={{ fontSize: "0.82em", color: COLORS.navy700, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>{r.hours}</span>
                  <span>{r.dist}</span>
                  <a href={`tel:${r.phone}`} style={{ color: COLORS.green600, fontWeight: 600, textDecoration: "none" }}>{r.phone}</a>
                </div>
              </div>
              <button
                className="tapTarget"
                onClick={() => toggleSaved(r)}
                aria-label={isSaved ? "Remove from my list" : "Save to my list"}
                style={{ background: "none", border: "none", cursor: "pointer", color: isSaved ? COLORS.green600 : COLORS.gray300, flexShrink: 0 }}
              >
                <Heart size={22} fill={isSaved ? COLORS.green600 : "none"} />
              </button>
            </div>
          );
        })}
        {resources.length === 0 && <p style={{ color: COLORS.navy700 }}>No sample listings in this category yet.</p>}
      </div>
    </div>
  );
}

function CategoryChip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      className="tapTarget"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderRadius: 20, cursor: "pointer",
        border: `1px solid ${active ? COLORS.navy700 : COLORS.gray300}`,
        background: active ? COLORS.navy700 : COLORS.white,
        color: active ? COLORS.white : COLORS.ink,
        fontSize: "0.85em", fontWeight: 600,
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

/* ---------------------------------------------------------
   Guides Panel
--------------------------------------------------------- */
function GuidesPanel() {
  const [open, setOpen] = useState(GUIDES[0].id);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {GUIDES.map((g) => (
        <div key={g.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray300}`, borderRadius: 10, overflow: "hidden" }}>
          <button
            className="tapTarget"
            onClick={() => setOpen(open === g.id ? null : g.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, color: COLORS.navy900 }}>
              <g.icon size={18} color={COLORS.green600} /> {g.title}
            </span>
            <ChevronDown size={18} style={{ transform: open === g.id ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {open === g.id && (
            <div style={{ padding: "0 14px 16px", color: COLORS.ink, fontSize: "0.95em" }}>{g.body}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   My List Panel (saved resources + checklist)
--------------------------------------------------------- */
function MyListPanel({ saved, toggleSaved, checklist, checklistInput, setChecklistInput, addChecklistItem, toggleChecklistItem, removeChecklistItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section>
        <h2 className="lfHead" style={{ fontSize: "1.1em", color: COLORS.navy900, margin: "0 0 10px" }}>Saved resources</h2>
        {saved.length === 0 && <p style={{ color: COLORS.navy700, fontSize: "0.9em" }}>Nothing saved yet — tap the heart on any resource to keep it here.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {saved.map((r) => (
            <div key={r.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray300}`, borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: COLORS.navy900 }}>{r.name}</div>
                <div style={{ fontSize: "0.82em", color: COLORS.navy700 }}>{r.hours} · {r.phone}</div>
              </div>
              <button className="tapTarget" onClick={() => toggleSaved(r)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green600 }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="lfHead" style={{ fontSize: "1.1em", color: COLORS.navy900, margin: "0 0 10px" }}>My checklist</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={checklistInput}
            onChange={(e) => setChecklistInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
            placeholder="Add a goal or appointment"
            style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1px solid ${COLORS.gray300}` }}
          />
          <button className="tapTarget" onClick={addChecklistItem} style={{ background: COLORS.navy700, color: COLORS.white, border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer" }}>
            <Plus size={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {checklist.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.white, border: `1px solid ${COLORS.gray300}`, borderRadius: 8, padding: "8px 12px" }}>
              <button className="tapTarget" onClick={() => toggleChecklistItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green600 }}>
                {item.done ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
              <span style={{ flex: 1, textDecoration: item.done ? "line-through" : "none", color: item.done ? COLORS.navy700 : COLORS.ink }}>{item.text}</span>
              <button className="tapTarget" onClick={() => removeChecklistItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray300 }}>
                <X size={16} />
              </button>
            </div>
          ))}
          {checklist.length === 0 && <p style={{ color: COLORS.navy700, fontSize: "0.9em" }}>No items yet — add appointments, documents to get, or goals.</p>}
        </div>
      </section>
    </div>
  );
}
