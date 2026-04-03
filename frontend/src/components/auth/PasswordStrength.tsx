interface PasswordStrengthProps {
  value: string;
}

function scorePassword(value: string) {
  let score = 0;

  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return score;
}

const labels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrength({ value }: PasswordStrengthProps) {
  const score = scorePassword(value);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((idx) => {
          const active = idx < score;
          const color = score <= 1 ? 'bg-rose-500' : score <= 2 ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <span
              key={idx}
              className={`h-1.5 flex-1 rounded-full ${active ? color : 'bg-zinc-200'}`}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <p className="mt-1 text-xs text-zinc-500">{labels[score]}</p>
    </div>
  );
}
