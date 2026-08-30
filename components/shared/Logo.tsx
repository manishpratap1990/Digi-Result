'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textClass?: string
  className?: string
  /** Wrap logo in a white box - useful on colored/dark backgrounds */
  withWhiteBg?: boolean
}

const SIZES = {
  sm:  { box: 'w-8 h-8',   pad: 'p-1',    px: 32,  py: 32 },
  md:  { box: 'w-12 h-12', pad: 'p-1.5',  px: 48,  py: 48 },
  lg:  { box: 'w-16 h-16', pad: 'p-2',    px: 64,  py: 64 },
  xl:  { box: 'w-20 h-20', pad: 'p-2.5',  px: 80,  py: 80 },
}

export default function Logo({ size = 'md', showText = false, textClass, className = '', withWhiteBg = false }: LogoProps) {
  const s = SIZES[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`
          ${s.box} rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center
          ${withWhiteBg ? `bg-white ${s.pad} shadow-sm border border-white/20` : 'bg-white/10 border border-white/10'}
          select-none
        `}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
      >
        <img
          src="/logo.png"
          alt="Digi Result"
          width={s.px}
          height={s.py}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ WebkitUserDrag: 'none', userSelect: 'none' } as React.CSSProperties}
        />
      </div>
      {showText && (
        <span className={textClass || 'font-bold text-gray-900 text-base'}>
          Digi Result
        </span>
      )}
    </div>
  )
}
