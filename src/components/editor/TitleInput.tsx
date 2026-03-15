type Props = {
  value: string;
  onChange: (value: string) => void;
  onFocusBody: () => void;
};

export default function TitleInput({ value, onChange, onFocusBody }: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onFocusBody();
    }
  }

  return (
    <input
      type="text"
      aria-label="タイトル"
      placeholder="タイトル"
      maxLength={200}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full bg-transparent font-(family-name:--font-heading) text-[22px] font-bold tracking-[0.04em] text-(--color-text) outline-none placeholder:text-(--color-text-sub) md:text-[28px]"
    />
  );
}
