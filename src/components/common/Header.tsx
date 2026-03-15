type Props = { children: React.ReactNode };

export default function Header({ children }: Props) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-(--color-border) bg-(--color-bg) px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
      {children}
    </header>
  );
}
