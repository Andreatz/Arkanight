# ARKANIGHT — Sito Live Voting

Brand identity hub + sistema di sondaggi in tempo reale stile Mentimeter, costruito con **Next.js 15 + Supabase + Vercel**.

## Pagine

- `/` — Landing page brand con link ai social
- `/vote` — Pagina di voto mobile (aperta dal QR code)
- `/display` — Vista per il maxi-schermo dell'evento, con QR e risultati live
- `/admin` — Pannello di controllo (password protected) per creare e attivare sondaggi

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind 3
- Supabase Postgres + Realtime + RLS
- QR code generato lato client
- Deploy su Vercel

## Setup locale

```bash
cp .env.example .env.local
# Compila SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → API)
# Compila ADMIN_PASSWORD (qualcosa di forte!)

npm install
npm run dev
```

Apri http://localhost:3000

## Variabili d'ambiente (production / Vercel)

| Nome | Dove | Note |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | client | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Per le API admin — non pre-fissare con `NEXT_PUBLIC_` |
| `ADMIN_PASSWORD` | **server only** | Protegge `/admin` |

## Database schema

Già applicato sul progetto Supabase. Tabelle principali:

```sql
polls (id, question, options jsonb, is_active, created_at)
votes (id, poll_id, option_index, voter_id, created_at)
```

Con `unique(is_active=true)` per garantire un solo sondaggio live alla volta, e `unique(poll_id, voter_id)` per un voto per sessione browser.

## Workflow per l'evento

1. Vai su `/admin`, accedi con la password
2. Crea i sondaggi prima dell'inizio (puoi prepararne anche 5–10)
3. All'evento, apri `/display` sul PC collegato al maxi-schermo (F11 fullscreen)
4. Quando vuoi lanciare un sondaggio, premi **▶ Attiva** dal pannello admin
5. Il QR del sondaggio compare automaticamente sul display + sui telefoni dei votanti che hanno già aperto `/vote`
6. I voti si aggiornano in tempo reale ovunque (display, telefoni, admin)
7. Premi **◼ Stop** quando vuoi chiuderlo, poi attiva il successivo

## Sicurezza

- RLS attivo: gli utenti anonimi possono **solo** leggere `polls/votes` e inserire voti
- Modifica/cancellazione sondaggi solo via API server-side autenticate con cookie httpOnly
- Service role key mai esposta al browser
