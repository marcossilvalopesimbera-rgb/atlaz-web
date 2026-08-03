export function AbstractGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
      <svg viewBox="0 0 420 420" fill="none" className="h-full w-full opacity-95">
        <path d="M84 90H336" stroke="#d6d7de" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M84 90V330" stroke="#d6d7de" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M84 330H336" stroke="#d6d7de" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M336 90V330" stroke="#d6d7de" strokeWidth="1.5" strokeLinecap="round" />

        <path d="M104 142H208" stroke="#6b6bfc" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M208 142V236" stroke="#6b6bfc" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M208 236H124" stroke="#6b6bfc" strokeWidth="1.5" strokeLinecap="round" />

        <rect x="104" y="142" width="36" height="36" rx="10" fill="#6b6bfc" />

        <path d="M154 176L276 270" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M276 270H320" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M320 270V186" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="320" cy="186" r="6" fill="#94a3b8" />

        <circle cx="144" cy="292" r="5" fill="#cbd5e1" />
        <circle cx="298" cy="108" r="5" fill="#cbd5e1" />
      </svg>
    </div>
  );
}
