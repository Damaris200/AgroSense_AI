import { cropItems } from '../../data/content';

const cropEmojis: { [key: string]: string } = {
  'Maize': '🌽',
  'Tomato': '🍅',
  'Groundnut': '🥜',
  'Plantain': '🍌',
  'Cassava': '🥔',
  'Beans': '🫘',
  'Rice': '🍚',
  'Sweet Potato': '🍠',
  'Onion': '🧅',
  'Leafy Greens': '🥬'
};

export function CropsSection() {
  return (
    <section id="crops" className="relative py-24 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-to-l from-emerald-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="mb-16 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-600" />
            Crop Support
            <span className="h-1 w-1 rounded-full bg-emerald-600" />
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-black text-zinc-950">
            Works with <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">your crops</span>
          </h2>
          <p className="max-w-2xl text-lg text-zinc-600">
            AgroSense supports staple and commercial crops across Central and West Africa. The AI continually learns about local varieties and conditions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 auto-rows-max">
          {cropItems.map((crop) => (
            <div
              key={crop.name}
              className="group relative rounded-2xl border-2 border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/30 px-4 py-8 text-center transition-all hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100/50 hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-1 cursor-pointer"
            >
              {/* Background glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-emerald-600/10 to-transparent" />

              <div className="relative space-y-3">
                {/* Emoji Icon */}
                <p className="text-5xl group-hover:scale-125 transition-transform duration-300">
                  {cropEmojis[crop.name] || '🌾'}
                </p>

                {/* Crop Tag */}
                <p className="font-display text-2xl font-bold text-emerald-600 group-hover:text-emerald-700 transition">
                  {crop.tag}
                </p>

                {/* Crop Name */}
                <p className="text-base font-semibold text-zinc-700 group-hover:text-zinc-900 transition">
                  {crop.name}
                </p>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-12 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🌾</span>
            <div>
              <h3 className="font-display text-xl font-bold text-zinc-950">Expanding Crop Coverage</h3>
              <p className="mt-2 text-zinc-700">
                New crops are added regularly based on farmer feedback and regional demand. Our ML models adapt to local varieties and growing conditions unique to your area.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
