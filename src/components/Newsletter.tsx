"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-ink py-16 text-white">
      <Reveal className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">
          The Norfu List
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          First Access. Every Friday.
        </h2>
        <p className="mt-3 text-sm text-white/70">
          New drops, restock alerts and member-only prices — straight to your inbox.
        </p>
        {status === "done" ? (
          <p className="mt-8 text-sm font-semibold tracking-wide text-white">
            You&rsquo;re on the list. See you Friday. ✦
          </p>
        ) : (
          <>
            <form
              className="mx-auto mt-8 flex max-w-md border border-white/30"
              onSubmit={submit}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="shrink-0 bg-white px-6 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {status === "sending" ? "…" : "Join"}
              </button>
            </form>
            {status === "error" && (
              <p className="mt-3 text-xs text-red-300">
                Something went wrong — please check the email and try again.
              </p>
            )}
          </>
        )}
      </Reveal>
    </section>
  );
}
