export function SunnySky() {
  const floats = ["👀", "💅", "☀️", "😭", "📱", "✨"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="animate-sun-glow absolute -right-6 top-4 h-36 w-36 rounded-full bg-sun shadow-[0_0_80px_var(--glow)] sm:right-10 sm:top-8 sm:h-44 sm:w-44" />
      <div className="animate-ray-spin absolute -right-10 top-0 h-48 w-48 opacity-30 sm:right-6 sm:top-4 sm:h-56 sm:w-56">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,#ffc93c55_20deg,transparent_40deg,#ffc93c44_60deg,transparent_80deg,#ffc93c55_100deg,transparent_120deg,#ffc93c44_140deg,transparent_160deg,#ffc93c55_180deg,transparent_200deg,#ffc93c44_220deg,transparent_240deg,#ffc93c55_260deg,transparent_280deg,#ffc93c44_300deg,transparent_320deg,#ffc93c55_340deg,transparent_360deg)]" />
      </div>

      <div className="animate-cloud-drift absolute left-[-4%] top-[18%] h-10 w-28 rounded-full bg-cloud/80 blur-[1px]" />
      <div
        className="animate-cloud-drift absolute left-[12%] top-[16%] h-14 w-40 rounded-full bg-cloud/70"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="animate-cloud-drift absolute right-[8%] top-[42%] h-9 w-32 rounded-full bg-cloud/65"
        style={{ animationDelay: "2.4s" }}
      />

      {floats.map((emoji, i) => (
        <span
          key={emoji + i}
          className="animate-cloud-drift absolute text-2xl opacity-40"
          style={{
            left: `${8 + i * 15}%`,
            top: `${20 + (i % 3) * 22}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${7 + i}s`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
