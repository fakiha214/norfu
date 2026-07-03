"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

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
        {done ? (
          <p className="mt-8 text-sm font-semibold tracking-wide text-white">
            You&rsquo;re on the list. See you Friday. ✦
          </p>
        ) : (
          <form
            className="mx-auto mt-8 flex max-w-md border border-white/30"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setDone(true);
            }}
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
              className="shrink-0 bg-white px-6 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-85"
            >
              Join
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
