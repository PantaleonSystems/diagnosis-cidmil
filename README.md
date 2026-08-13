# Plataforma de Diagnóstico Cidades MIL — CIIDCMIL

Transforma o framework das Cidades MIL (UNESCO / CIIDCMIL) em diagnóstico objetivo e
auditável. MVP do **módulo Saúde**: 43 métricas (63–105) em 5 pilares, índice **ISPS**
e plano de ação.

**Princípio de produto — cálculo cego:** o avaliador nunca digita a nota. Ele informa
números absolutos ou escolhe um nível numa régua 0–4; a nota é derivada por fórmula em
[`src/lib/calculos.ts`](src/lib/calculos.ts). É isso que dá credibilidade e permite
comparar cidades.

Stack: React 19 · TypeScript · Vite 8 · Tailwind 4 · React Router · Supabase · Vercel.

---

## Rodando localmente

```bash
nvm use                 # Node 20.19.6 (.nvmrc) — o tooling não roda no 21.x
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck + build de produção |
| `npm test` | testes do cálculo, do ISPS e do plano de ação |
| `npm run lint` | oxlint |
| `npm run seed:gen` | regenera a migration do catálogo a partir de `src/data/metricas.ts` |

## Configurando o Supabase

```bash
npx supabase login                                   # abre o browser
npx supabase projects create diagnosis-cidmil        # ou crie pelo painel
npx supabase link --project-ref <ref-do-projeto>
npx supabase db push                                 # aplica schema + seed
```

Depois, em **Project Settings → API**, copie `Project URL` e a chave `anon public` para
o `.env.local`.

### Se o `db push` não conectar

Erro do tipo `failed to connect as temp role: Connection terminated unexpectedly`
significa que a porta do Postgres (5432/6543) está bloqueada na sua rede — VPN
corporativa, firewall ou ISP. O projeto está fino; o que não passa é a conexão.

Alternativa que roda sobre HTTPS e sempre funciona:

**SQL Editor → New query → cole
[`supabase/aplicar-no-sql-editor.sql`](supabase/aplicar-no-sql-editor.sql) → Run.**

Esse arquivo é a concatenação das migrations e é idempotente — pode ser reaplicado.
Para regenerá-lo depois de mudar o schema:

```bash
npm run seed:gen && npm run sql:bundle
```

### Credenciando um avaliador

Toda conta nasce com `credenciado = false` e cai na tela "aguardando credenciamento" —
a RLS bloqueia o acesso aos dados, não só a interface. Para liberar alguém:

**Table Editor → `profiles` → marque `credenciado` = true.**

Ou pelo SQL Editor:

```sql
update public.profiles set credenciado = true where id = (
  select id from auth.users where email = 'avaliador@ciidcmil.org'
);
```

## Deploy na Vercel

1. Importe o repositório — o framework Vite é detectado automaticamente.
2. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Deploy. O [`vercel.json`](vercel.json) já faz o rewrite de SPA para as rotas do
   client (`/app/cidades` acessada direto funciona).

> Só a chave **anon** vai para o front. Nunca a `service_role`. Quem protege os dados é
> a Row Level Security do banco, não o segredo da chave.

---

## Como o projeto está organizado

```
src/
  data/metricas.ts      # catálogo das 43 métricas — fonte única, gera o seed
  lib/
    calculos.ts         # cálculo cego: números → nota 0–4
    isps.ts             # média por pilar, ISPS ponderado, Regra de Ouro
    plano.ts            # plano de ação derivado das notas reais
    auth.tsx            # sessão do Supabase + perfil
    catalogo.tsx        # de-para número da métrica ↔ uuid do banco
    cidadeAtiva.tsx     # cidade/avaliação selecionada (persistida)
    respostas.ts        # carga + upsert com debounce de 600ms
  components/           # ui/, layout/, metrics/, charts/, auth/
  pages/                # Landing, Login, Signup, Dashboard, Avaliacao,
                        # Resultados, Plano, Cidades
supabase/migrations/    # schema + RLS, e o seed do catálogo
scripts/gen-seed.ts     # gera o seed a partir de src/data/metricas.ts
```

### Regras de domínio que valem conhecer

- **Pesos dos pilares:** 0.35 · 0.25 · 0.20 · 0.15 · 0.05 (somam 1,0). ISPS é a soma
  ponderada das médias.
- **Níveis de maturidade:** ≤1.5 Reativa · ≤2.5 Concessiva · ≤3.4 Participativa ·
  \>3.4 Cogestiva.
- **Regra de Ouro:** se o Pilar 1 (Governança Participativa) tem média < 2,0, a cidade
  fica travada no Nível 2 independentemente do ISPS. A nota real continua visível, com
  o aviso ao lado.
- **Métrica 100:** o protótipo a listava em dois pilares. Ela pertence ao Pilar 1
  (Governança) — daí o total de 43 e não 44.

### Mudando o catálogo

Edite `src/data/metricas.ts`, rode `npm run seed:gen` e aplique com
`npx supabase db push`. Front e banco saem do mesmo arquivo, então não divergem.

---

## Fora de escopo neste MVP

- Camada de verificação / blockchain (fase futura).
- Os outros 12 módulos do framework — aparecem como "em breve".
- Tela de administração: credenciar avaliadores é feito pelo painel do Supabase.
- Logotipo oficial: `src/components/layout/Marca.tsx` traz um placeholder tipográfico.
  Para usar o logo real, coloque o arquivo em `src/assets/` e troque por um `<img>`.
