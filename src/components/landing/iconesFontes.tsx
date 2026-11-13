import type { ReactNode } from 'react'

export const TRACOS_FONTE: Record<string, ReactNode> = {
  portais: (<><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></>),
  cadastros: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h5" /></>),
  projetos: (<><path d="M6 21V4" /><path d="M6 5h11l-2.5 3.5L17 12H6" /></>),
  plataformas: (<><circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="20" r="2" /><path d="m6.5 7.5 3.5 3M17.5 7.5l-3.5 3M12 14.5V18" /></>),
  abertos: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" /></>),
  valores: (<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
}
