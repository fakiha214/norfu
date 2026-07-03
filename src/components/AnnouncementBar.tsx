export default function AnnouncementBar({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  const strip = [...messages, ...messages];
  return (
    <div className="bg-ink text-white overflow-hidden">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2">
        {strip.map((msg, i) => (
          <span
            key={i}
            className="mx-8 text-[11px] font-medium tracking-[0.22em]"
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
