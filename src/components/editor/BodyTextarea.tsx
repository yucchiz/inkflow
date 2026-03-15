import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
};

function adjustHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export default function BodyTextarea({ value, onChange, textareaRef }: Props) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef ?? internalRef;

  function handleInput() {
    if (ref.current) {
      adjustHeight(ref.current);
    }
  }

  useEffect(() => {
    if (ref.current) {
      adjustHeight(ref.current);
    }
  }, [ref, value]);

  return (
    <textarea
      ref={ref}
      aria-label="本文"
      placeholder="書き始める..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={handleInput}
      className="min-h-[50vh] w-full resize-none overflow-hidden bg-transparent font-(family-name:--font-body) text-[16px] leading-[1.8] tracking-[0.02em] text-(--color-text) outline-none placeholder:text-(--color-text-sub) md:text-[18px] md:leading-[2.0]"
    />
  );
}
