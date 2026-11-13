/** Funções puras do mapa da landing: simplificar, projetar, enquadrar e calcular o zoom entre vistas. */
export type Vista = [x: number, y: number, w: number, h: number]
type Ponto = [number, number]

const K = Math.cos((-14 * Math.PI) / 180)

/** Projeção equiretangular simples centrada no Brasil (unidades de 40 por grau). */
export function projetar(lon: number, lat: number): Ponto {
  return [(lon + 74) * K * 40, (6 - lat) * 40]
}

function distSeg(p: Ponto, a: Ponto, b: Ponto): number {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  if (l2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function dp(pts: Ponto[], tol: number): Ponto[] {
  if (pts.length < 3) return pts
  let maior = 0, idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distSeg(pts[i], pts[0], pts[pts.length - 1])
    if (d > maior) { maior = d; idx = i }
  }
  if (maior <= tol) return [pts[0], pts[pts.length - 1]]
  return [...dp(pts.slice(0, idx + 1), tol).slice(0, -1), ...dp(pts.slice(idx), tol)]
}

/** Douglas-Peucker. Anel fechado é dividido no ponto mais distante do primeiro. */
export function simplificar(pontos: Ponto[], tolerancia: number): Ponto[] {
  if (pontos.length < 4) return pontos
  const ini = pontos[0], fim = pontos[pontos.length - 1]
  if (ini[0] !== fim[0] || ini[1] !== fim[1]) return dp(pontos, tolerancia)
  let idx = 0, maior = -1
  for (let i = 1; i < pontos.length - 1; i++) {
    const d = Math.hypot(pontos[i][0] - ini[0], pontos[i][1] - ini[1])
    if (d > maior) { maior = d; idx = i }
  }
  const a = dp(pontos.slice(0, idx + 1), tolerancia)
  const b = dp(pontos.slice(idx), tolerancia)
  return [...a.slice(0, -1), ...b]
}

const n = (v: number) => String(Math.round(v * 10) / 10)

/** Um subcaminho fechado (M ... Z) por anel. */
export function caminhoSvg(aneis: Ponto[][]): string {
  return aneis.map((a) => 'M' + a.map(([x, y]) => `${n(x)} ${n(y)}`).join(' ') + 'Z').join('')
}

/** Vista que contém o bbox com folga e a razão de aspecto do quadro. */
export function enquadrar(bbox: Vista, aspecto: number, folga = 1.25): Vista {
  let W = bbox[2] * folga, H = bbox[3] * folga
  if (W / H < aspecto) W = H * aspecto
  else H = W / aspecto
  return [bbox[0] + bbox[2] / 2 - W / 2, bbox[1] + bbox[3] / 2 - H / 2, W, H]
}

/**
 * Transformação (translate + scale, origem no centro) que leva uma camada
 * desenhada na vista `de` a coincidir com a vista `para`, em pixels de tela.
 */
export function calcularZoom(de: Vista, para: Vista, largura: number, altura: number) {
  const s = de[2] / para[2]
  const px = ((para[0] - de[0]) / de[2]) * largura
  const py = ((para[1] - de[1]) / de[3]) * altura
  const cx = largura / 2, cy = altura / 2
  return { s, tx: -cx - s * (px - cx), ty: -cy - s * (py - cy) }
}

/** Retângulo que contém todos os números de um caminho SVG (pares x y). */
export function bboxDe(d: string): Vista {
  const v = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (let i = 0; i + 1 < v.length; i += 2) {
    x0 = Math.min(x0, v[i]); x1 = Math.max(x1, v[i])
    y0 = Math.min(y0, v[i + 1]); y1 = Math.max(y1, v[i + 1])
  }
  return [x0, y0, x1 - x0, y1 - y0]
}
