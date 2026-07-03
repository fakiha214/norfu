const MESSAGES = [
  "SUMMER SALE — UP TO 50% OFF",
  "FREE SHIPPING ON ORDERS ABOVE PKR 4,000",
  "NEW DROP EVERY FRIDAY",
  "EASY 14-DAY EXCHANGES NATIONWIDE",
];

export default function AnnouncementBar() {
  const strip = [...MESSAGES, ...MESSAGES];
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
