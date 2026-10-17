import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const BUDGETS = ["< $3k", "$3–8k", "$8–20k", "$20k+", "To discuss"] as const;
const TIMELINES = ["Flexible", "< 1 month", "1–3 months", "3+ months"] as const;
const TYPES = [
  "Business Website",
  "Web Application",
  "Digital Product",
  "AI-Enabled Experience",
  "Something else",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const payloadSchema = z.object({
  website: z.string().max(200).optional().default(""),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).refine((v) => EMAIL_RE.test(v), "invalid"),
  company: z.string().trim().max(200).optional().default(""),
  brief: z.string().trim().min(10).max(5000),
  context: z.string().trim().max(2000).optional().default(""),
  budget: z.enum(BUDGETS).optional().default("To discuss"),
  timeline: z.enum(TIMELINES).optional().default("Flexible"),
  projectType: z.enum(TYPES).nullable().optional(),
});

// Best-effort in-memory rate limit: 5 submissions per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

function esc(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many inquiries. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path[0];
    const message =
      field === "email"
        ? "That email address does not look valid."
        : field === "brief"
          ? "Please describe the project in a little more detail (10+ characters)."
          : field === "name"
            ? "Please complete name, email, and project summary so the inquiry is actionable."
            : "Invalid project type, budget, or timeline selection.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { name, email, company, brief, context, budget, timeline, projectType } =
    parsed.data;

  // Honeypot: bots fill this, humans never see it. Accept silently.
  if (parsed.data.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from =
    process.env.CONTACT_FROM || "Veyra Inquiry <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.error("[contact] missing RESEND_API_KEY or CONTACT_TO");
    return NextResponse.json(
      { error: "Inquiries are temporarily unavailable. Please email xsnckp@gmail.com directly." },
      { status: 500 },
    );
  }

  const subject = `[Veyra] ${projectType ?? "New inquiry"} — ${name}`;
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    `Type: ${projectType ?? "—"}`,
    `Budget: ${budget}`,
    `Timeline: ${timeline}`,
    ``,
    `Brief:`,
    brief,
    context ? `\nContext:\n${context}` : null,
  ].filter((l): l is string => l !== null);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      text: lines.join("\n"),
      html: `<div style="font-family:sans-serif;line-height:1.6">${
        lines
          .map((l) =>
            l === "" ? "<br>" : `<p style="margin:0 0 8px">${esc(l).replace(/\n/g, "<br>")}</p>`,
          )
          .join("")
      }</div>`,
    });
    if (error) {
      console.error("[contact] resend error", error);
      return NextResponse.json(
        { error: "Could not send your inquiry. Please try again or email xsnckp@gmail.com directly." },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("[contact] send failed", e);
    return NextResponse.json(
      { error: "Could not send your inquiry. Please try again or email xsnckp@gmail.com directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
