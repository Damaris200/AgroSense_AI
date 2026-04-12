import { useTheme } from '../../context/ThemeContext';

const steps = [
  {
    number: '01',
    title: 'Register your farm',
    description: 'Create your account, add your farm details, and set your preferred language.',
  },
  {
    number: '02',
    title: 'Submit daily observations',
    description: 'Record crop notes, weather changes, and field conditions in a simple mobile workflow.',
  },
  {
    number: '03',
    title: 'AI analyses weather + soil',
    description: 'AgroSense combines event-driven updates with agronomic logic to understand field risk.',
  },
  {
    number: '04',
    title: 'Receive actionable advice',
    description: 'Clear recommendations arrive quickly so irrigation, planting, and crop care stay on track.',
  },
];

export function HowItWorksSection() {
  const { isDark } = useTheme();

  return (
    <section
      id="how-it-works"
      className={`scroll-mt-28 py-20 transition-colors duration-300 sm:py-24 ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_35%),linear-gradient(180deg,#08130f_0%,#0f1c17_100%)] text-white'
          : 'bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf5_100%)] text-zinc-950'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div
            className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
              isDark ? 'border-white/10 bg-white/5 text-emerald-200' : 'border-emerald-100 bg-white text-emerald-700'
            }`}
          >
            How it works
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            A simple workflow that turns observations into action
          </h2>
          <p className={`text-base leading-8 sm:text-lg ${isDark ? 'text-emerald-50/80' : 'text-zinc-600'}`}>
            The journey is intentionally lightweight so a farmer can move from registration to meaningful guidance
            without friction.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            className={`absolute left-5 top-4 hidden h-[calc(100%-2rem)] w-px md:block ${
              isDark
                ? 'bg-gradient-to-b from-emerald-300/70 via-emerald-200/30 to-transparent'
                : 'bg-gradient-to-b from-emerald-500 via-emerald-200 to-transparent'
            }`}
          />

          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`relative grid gap-4 rounded-[2rem] border p-6 backdrop-blur-sm md:grid-cols-[72px_1fr] md:items-start md:gap-8 md:p-8 ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-white shadow-sm'
                }`}
              >
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-sm font-bold text-emerald-950 md:h-14 md:w-14 md:text-base">
                  {step.number}
                </div>
                <div>
                  <h3 className={`font-display text-2xl font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                    {step.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-3xl text-sm leading-7 sm:text-base ${
                      isDark ? 'text-emerald-50/78' : 'text-zinc-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
