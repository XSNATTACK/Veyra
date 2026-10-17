"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { track } from "@vercel/analytics";
import { EASE_SNAP } from "./motion-tokens";

const TYPES = [
  { label: "Business Website", hint: "Clarity, credibility, conversion" },
  { label: "Web Application", hint: "Workflows made intuitive" },
  { label: "Digital Product", hint: "Concept through production" },
  { label: "AI-Enabled Experience", hint: "Assistance with utility" },
  { label: "Something else", hint: "Describe it in your words" },
] as const;

const BUDGETS = ["< $3k", "$3–8k", "$8–20k", "$20k+", "To discuss"] as const;
const TIMELINES = ["Flexible", "< 1 month", "1–3 months", "3+ months"] as const;

const STEPS = ["Project", "Scope", "Details", "Review"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Pill({
  selected,
  onClick,
  children,
  wide,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`meta inline-flex items-center gap-2 border px-4 py-3 text-[11px] tracking-[0.14em] uppercase transition-all duration-300 ${
        wide ? "w-full justify-between text-left" : ""
      } ${
        selected
          ? "border-[#FF4D00] bg-[#FF4D00]/15 text-white shadow-[0_0_24px_-8px_rgba(255,77,0,0.7)]"
          : "border-[#F4F2ED]/15 text-[#A7A5A0] hover:border-[#F4F2ED]/40 hover:text-white"
      }`}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
          selected ? "border-[#FF4D00] bg-[#FF4D00] text-white" : "border-[#F4F2ED]/25"
        }`}
      >
        {selected && <Check size={12} />}
      </span>
    </button>
  );
}

export function ContactForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>(BUDGETS[4]);
  const [timeline, setTimeline] = useState<string>(TIMELINES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [brief, setBrief] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const go = (next: number) => {
    setError(null);
    // per-step validation
    if (next > step) {
      if (step === 0 && !type) {
        setError("Pick the closest project type — it routes your inquiry correctly.");
        return;
      }
      if (step === 2) {
        if (!name.trim() || !email.trim() || !brief.trim()) {
          setError("Name, email, and project summary are required to send.");
          return;
        }
        if (!EMAIL_RE.test(email.trim())) {
          setError("That email address does not look valid.");
          return;
        }
        if (brief.trim().length < 10) {
          setError("Describe the project in a little more detail (10+ characters).");
          return;
        }
      }
    }
    setDir(next > step ? 1 : -1);
    setStep(Math.min(STEPS.length - 1, Math.max(0, next)));
  };

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (String(data.get("website") ?? "").trim() !== "") {
      setSent(true);
      return;
    }
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: "",
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          brief: `${type ? `[${type}] ` : ""}${brief.trim()}`,
          context: context.trim(),
          budget,
          timeline,
          projectType: type,
        }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      track("inquiry_submitted");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-[#F4F2ED]/15 bg-[#101013] p-8 sm:p-12" role="status" aria-live="polite">
        <CheckCircle2 className="text-[#FF4D00]" size={28} aria-hidden />
        <h2 className="font-display mt-4 text-4xl font-semibold">
          Received<span className="serif-accent text-[#FF4D00]">.</span>
        </h2>
        <p className="mt-3 max-w-md leading-relaxed text-[#A7A5A0]">
          Thank you{type ? ` — your ${type.toLowerCase()} inquiry is noted` : " — your inquiry is noted"}.
          Expect a considered reply within two business days. If it&apos;s a fit, the next step
          is a short call to define scope.
        </p>
        <p className="meta mt-6 text-[11px] tracking-[0.2em] text-[#6E6D6A] uppercase">
          {type} · {budget} · {timeline}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#F4F2ED]/15 bg-[#101013] p-6 sm:p-10" aria-label="Project inquiry wizard">
      {/* progress */}
      <div className="flex items-center justify-between">
        <ol className="flex items-center gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && go(i)}
                disabled={i >= step}
                aria-label={`Go to ${s}`}
                className={`meta tnum flex h-8 w-8 items-center justify-center rounded-full border text-[11px] transition-colors ${
                  i < step
                    ? "border-[#FF4D00] bg-[#FF4D00] text-white"
                    : i === step
                      ? "border-[#FF4D00] text-[#FF4D00]"
                      : "border-[#F4F2ED]/15 text-[#6E6D6A]"
                }`}
              >
                {i < step ? <Check size={13} aria-hidden /> : i + 1}
              </button>
              <span className={`meta hidden text-[10px] tracking-[0.18em] uppercase sm:inline ${i === step ? "text-white" : "text-[#6E6D6A]"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <span aria-hidden className="mx-1 h-px w-4 bg-[#F4F2ED]/15 sm:w-8" />}
            </li>
          ))}
        </ol>
        <span className="meta tnum text-[11px] tracking-[0.18em] text-[#6E6D6A]">0{step + 1} / 04</span>
      </div>
      <div className="mt-4 h-[2px] overflow-hidden rounded bg-[#F4F2ED]/10" aria-hidden>
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[#FF4D00] to-[#FF8A3D]"
          animate={{ scaleX: (step + 1) / STEPS.length }}
          transition={{ duration: 0.5, ease: EASE_SNAP }}
        />
      </div>

      <form onSubmit={onSend} noValidate className="mt-8 min-h-[380px]">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ x: 48 * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -48 * dir, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_SNAP }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                What are we <span className="serif-accent text-[#FF4D00]">building?</span>
              </h2>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {TYPES.map((t) => (
                  <Pill key={t.label} wide selected={type === t.label} onClick={() => setType(t.label)}>
                    <span>
                      <span className="block text-xs font-bold">{t.label}</span>
                      <span className="mt-0.5 block text-[10px] tracking-normal text-current normal-case opacity-60">{t.hint}</span>
                    </span>
                  </Pill>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ x: 48 * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -48 * dir, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_SNAP }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Budget <span className="text-[#6E6D6A]">&</span> <span className="serif-accent text-[#FF4D00]">timeline.</span>
              </h2>
              <p className="eyebrow mt-6">Budget range</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Pill key={b} selected={budget === b} onClick={() => setBudget(b)}>{b}</Pill>
                ))}
              </div>
              <p className="eyebrow mt-7">Timeline</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIMELINES.map((t) => (
                  <Pill key={t} selected={timeline === t} onClick={() => setTimeline(t)}>{t}</Pill>
                ))}
              </div>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-[#6E6D6A]">
                Ranges are enough — precision can wait for the call. Honest numbers get the fastest replies.
              </p>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ x: 48 * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -48 * dir, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_SNAP }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                The <span className="serif-accent text-[#FF4D00]">details.</span>
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="cf-name" className="eyebrow">Name *</label>
                  <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" className="field mt-1" />
                </div>
                <div>
                  <label htmlFor="cf-email" className="eyebrow">Email *</label>
                  <input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" className="field mt-1" />
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="cf-company" className="eyebrow">Company / Project</label>
                <input id="cf-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder="Company or project name" className="field mt-1" />
              </div>
              <div className="mt-6">
                <label htmlFor="cf-brief" className="eyebrow">What are you building? *</label>
                <textarea id="cf-brief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="What you're working on, where you're trying to go, and what needs to be built." className="field resize-y" />
              </div>
              <div className="mt-6">
                <label htmlFor="cf-context" className="eyebrow">Additional context</label>
                <textarea id="cf-context" value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder="Constraints, references, deadlines." className="field resize-y" />
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ x: 48 * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -48 * dir, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_SNAP }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to <span className="serif-accent text-[#FF4D00]">send?</span>
              </h2>
              <dl className="mt-6 divide-y divide-[#F4F2ED]/10 border-y border-[#F4F2ED]/10">
                {[
                  { k: "Project", v: type ?? "—", edit: 0 },
                  { k: "Budget", v: budget, edit: 1 },
                  { k: "Timeline", v: timeline, edit: 1 },
                  { k: "Contact", v: `${name} · ${email}${company ? ` · ${company}` : ""}`, edit: 2 },
                ].map((r) => (
                  <div key={r.k} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="meta text-[10px] tracking-[0.22em] text-[#6E6D6A] uppercase">{r.k}</dt>
                    <dd className="max-w-[60%] truncate text-right text-sm text-[#F4F2ED]">{r.v}</dd>
                    <button type="button" onClick={() => go(r.edit)} className="u-link meta shrink-0 text-[10px] tracking-[0.18em] uppercase">
                      Edit
                    </button>
                  </div>
                ))}
                <div className="py-3.5">
                  <dt className="meta text-[10px] tracking-[0.22em] text-[#6E6D6A] uppercase">Brief</dt>
                  <dd className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#A7A5A0]">{brief}</dd>
                </div>
              </dl>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-6 border border-[#FF4D00]/50 bg-[#FF4D00]/10 px-4 py-3 text-sm text-[#F4F2ED]">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="meta inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#A7A5A0] transition-colors hover:text-white disabled:opacity-30"
          >
            <ArrowLeft size={14} aria-hidden /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              className="group btn-primary inline-flex items-center gap-2 bg-[#F4F2ED] px-7 py-3.5 text-sm font-semibold tracking-[0.08em] text-black uppercase"
            >
              Continue
              <ArrowRight size={15} className="cta-arrow" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={sending}
              className="group btn-primary inline-flex items-center gap-2 bg-[#F4F2ED] px-7 py-3.5 text-sm font-semibold tracking-[0.08em] text-black uppercase disabled:cursor-wait disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send inquiry"}
              <ArrowRight size={15} className="cta-arrow" aria-hidden />
            </button>
          )}
        </div>
        <p className="meta mt-4 text-[11px] tracking-[0.14em] text-[#6E6D6A] uppercase">
          No newsletters. No sharing. Replies within two business days.
        </p>
      </form>
    </div>
  );
}
