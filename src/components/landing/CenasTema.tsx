import type { TemaNoticia } from '@/data/noticias'

const MARCA = '#0a5a96', CLARA = '#2395c6', NOITE = '#052f4d'

function Ia() {
  const nos: [number, number][] = [[70, 52], [250, 52], [70, 132], [250, 132]]
  return (
    <>
      {nos.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y} L160 92`} className="cena-fio" style={{ animationDelay: `${0.2 + i * 0.25}s` }} />
          <circle cx={x} cy={y} r={11} fill="#fff" stroke={CLARA} strokeWidth={3} className="cena-pop" style={{ animationDelay: `${i * 0.25}s` }} />
        </g>
      ))}
      <rect x={134} y={66} width={52} height={52} rx={12} fill="#fff" stroke={MARCA} strokeWidth={3.5} />
      <path d="M160 78l3.6 10.4L174 92l-10.4 3.6L160 106l-3.6-10.4L146 92l10.4-3.6z" fill={MARCA} className="cena-brilho" />
    </>
  )
}

function Cidade() {
  const preds: [number, number, number][] = [[40, 84, 44], [92, 52, 76], [150, 68, 60], [208, 36, 92], [260, 76, 52]]
  return (
    <>
      <path d="M20 128H300" stroke={MARCA} strokeWidth={3} strokeLinecap="round" />
      {preds.map(([x, y, h], i) => (
        <g key={i}>
          <rect x={x} y={y + 44 - 44 + (128 - y - h) + 0} width={40} height={h} rx={4} fill="#fff" stroke={MARCA} strokeWidth={3} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={x + 9 + (k % 2) * 16} y={128 - h + 10 + Math.floor(k / 2) * 18 + (k === 2 ? 0 : 0)} width={9} height={9} rx={2} fill="#e6a93e" className="cena-janela" style={{ animationDelay: `${i * 0.28 + k * 0.12}s` }} />
          ))}
        </g>
      ))}
    </>
  )
}

function Cidadao() {
  const pessoa = (x: number, y: number, k: number, c: string) => (
    <g key={x}>
      <circle cx={x} cy={y - 12 * k} r={8 * k} fill={c} />
      <path d={`M${x - 15 * k} ${y + 18 * k} a${15 * k} ${16 * k} 0 0 1 ${30 * k} 0z`} fill={c} />
    </g>
  )
  return (
    <>
      <circle cx={160} cy={102} r={56} fill="#fff" />
      {pessoa(130, 108, 1, CLARA)}{pessoa(190, 108, 1, CLARA)}{pessoa(160, 102, 1.3, MARCA)}
      <path d="M160 70c-9-7-9-15-4-16 2 0 3 1 4 3 1-2 2-3 4-3 5 1 5 9-4 16z" fill="#e0603e" className="cena-batida" />
    </>
  )
}

function Mil() {
  return (
    <>
      <circle cx={160} cy={92} r={52} fill="#fff" stroke={MARCA} strokeWidth={3.5} />
      <path d="M108 92h104M160 40c18 14 26 32 26 52s-8 38-26 52c-18-14-26-32-26-52s8-38 26-52z" fill="none" stroke={CLARA} strokeWidth={2.5} className="cena-fio" pathLength={1} />
      <g className="cena-pop" style={{ animationDelay: '0.6s' }}>
        <circle cx={206} cy={130} r={20} fill="#3db18c" />
        <path d="M197 130l7 7 12-14" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx={112} cy={56} r={6} fill={NOITE} className="cena-batida" />
    </>
  )
}

const CENAS: Record<TemaNoticia, () => React.ReactNode> = { ia: Ia, cidade: Cidade, cidadao: Cidadao, mil: Mil }

/** Ilustração própria de cada tema; só `transform`, `opacity` e `stroke-dashoffset` se movem. */
export function CenaTema({ tema, className = '' }: { tema: TemaNoticia; className?: string }) {
  const Cena = CENAS[tema]
  return (
    <svg viewBox="0 0 320 184" aria-hidden="true" focusable="false" data-tema={tema} className={`cena ${className}`}>
      <Cena />
    </svg>
  )
}
