
// A simple implementation inspired by clsx and tailwind-merge
export function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(' ');
}
