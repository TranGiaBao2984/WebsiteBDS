'use client';

import { useLanguage } from '@/app/context/LanguageContext';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ text, fullScreen = false }: LoaderProps) {
  const { currentLang } = useLanguage();
  const label =
    text ?? (currentLang === 'ja' ? '読み込み中...' : 'Loading...');

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 ${
        fullScreen ? 'min-h-[60vh] py-20' : 'py-14'
      }`}
    >
      <div
        aria-label="Orange and tan hamster running in a metal wheel"
        role="img"
        className="wheel-and-hamster"
      >
        <div className="wheel" />
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear" />
              <div className="hamster__eye" />
              <div className="hamster__nose" />
            </div>
            <div className="hamster__limb hamster__limb--fr" />
            <div className="hamster__limb hamster__limb--fl" />
            <div className="hamster__limb hamster__limb--br" />
            <div className="hamster__limb hamster__limb--bl" />
            <div className="hamster__tail" />
          </div>
        </div>
        <div className="spoke" />
      </div>

      {label && (
        <p className="text-xs font-semibold tracking-wider text-[#66605A] uppercase">
          {label}
        </p>
      )}
    </div>
  );
}