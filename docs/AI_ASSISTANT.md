# 🤖 AI Assistant - OpenAI Function Calling

AI Assistant për sistemin e prezencës që përdor OpenAI GPT-5.4 me Function Calling për query dhe raporte.

## 🚀 Setup (5 minuta)

### 1. Merrni OpenAI API Key
1. Shkoni te https://platform.openai.com/api-keys
2. Krijoni account ose bëni login
3. Klikoni "Create new secret key"
4. Kopjoni key-in (fillon me `sk-`)

### 2. Konfiguroni Environment
```bash
# Kopjoni example file
cp .env.example .env.local

# Hapeni .env.local dhe shtoni:
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Testoni
```bash
npm run dev
# Shkoni te /ai-assistant dhe provoni: "Show system statistics"
```

## 💡 Si Funksionon

```
Ju shkruani mesazh në shqip ose anglisht
    ↓
GPT-5.4 kupton qëllimin tuaj
    ↓
Zgjedh automatikisht funksionin e duhur
    ↓
Merr të dhënat nga database
    ↓
Kthen përgjigje në gjuhë natyrale
```

**Shembuj:**
```
"Trego studentët në Infoek202"
"Sa mungesa ka studenti X ?"  → AI pyet për lëndën dhe tipin (Leksion/Seminar)
"Datat kur ka munguar studenti X ?"  → AI pyet për lëndën dhe tipin
"Endrit Mustafaj, Projektim DB, Seminar"  → Fuzzy matching zgjidh emrin e lëndës automatikisht
"Nxirr listen NK per klasen ... per lenden ... per seminaret"
```

## 🧠 Sjellja Inteligjente e Funksioneve

### Pyetje për Lëndën dhe Tipin
Kur pyetet për mungesat e një studenti pa specifikuar lëndën dhe tipin e mësimit, funksionet kthejnë automatikisht listën e lëndëve/tipeve të disponueshme:

```
Përdoruesi: "Sa mungesa ka Endrit Mustafaj?"

AI: Ju lutem specifikoni lëndën dhe tipin e mësimit:
  - Projektim dhe analizë e bazave të të dhënave: Leksion, Seminar
  - Matematikë: Leksion
  - Programim Web: Leksion, Seminar

Përdoruesi: "Projektim DB, Seminar"

AI: Endrit Mustafaj ka 1 mungesë në Projektim dhe analizë e bazave
    të të dhënave (Seminar)...
```

### Fuzzy Subject Name Matching
Emrat e lëndëve zgjidhen automatikisht me fuzzy matching:
- **Normalizim diakritikash:** "analize" → matcho "analizë", "çeshtje" → matcho "çështje"
- **Fjalë kyçe:** "Projektim DB" → matcho "Projektim dhe analizë e bazave të të dhënave"
- **Stop words shqip:** Injoronen fjalët: dhe, e, te, i, ne, per, me, nga, se
- **Kodi i lëndës:** Mund të përdoret edhe kodi (p.sh. "INF201")

## 📋 Operacionet e Disponueshme

### 📊 Query (Shikimi i të dhënave)
- System statistics - `"Trego statistikat"`
- Students - `"Lista e studentëve në Infoek202"`
- Student details - `"Detajet e studentit X"`
- Classes - `"Trego klasat"`
- Lectures - `"Leksionet e sotme"`
- Attendance - `"Prezenca për leksion 123"`
- Statistics - `"Sa mungesa ka studenti X?"` (pyet për lëndën/tipin nëse mungon)

### 📈 Raporte
- NK/OK lista - `"Lista NK për klasën X, lëndën Y"`
- Rekordet individuale - `"Datat kur ka munguar studenti X"` (pyet për lëndën/tipin nëse mungon)

> **Shënim:** AI Assistant ka vetëm akses leximi (read-only). Nuk mund të krijojë, ndryshojë ose fshijë të dhëna.
> 
> **Shënim:** Emrat e lëndëve pranojnë fuzzy matching — shkruani shkurtimisht ("Projektim DB" në vend të emrit të plotë).

## 🏗️ Struktura Teknike

```
lib/openai/
  ├── functions.ts          # Funksionet query që GPT-5.4 mund të thërrasë
  │                         # (description përfshin rregullat e biznesit)
  └── functionHandlers.ts   # Implementimi i funksioneve (Prisma, read-only)
  │                         # - resolveSubjectByName: fuzzy matching lëndësh
  │                         # - resolveStudentByName: fuzzy matching studentësh  
  │                         # - normalizeAlbanian: normalizim diakritikash (ë→e, ç→c)
  │                         # - needsMoreInfo: kërkon lëndë/tip kur mungon

app/api/
  └── ai-chat/route.ts      # Endpoint kryesor

components/ai/
  └── AIAgentChat.tsx       # Chat UI
```

## 🛠️ Si të Shtoni Funksion të Ri

### 1. Definoni në `lib/openai/functions.ts`
```typescript
{
  type: 'function',
  function: {
    name: 'get_assignments',
    description: 'Merr detyrat për një klasë',
    parameters: {
      type: 'object',
      properties: {
        classId: { type: 'number' }
      },
      required: ['classId']
    }
  }
}
```

### 2. Implementoni në `lib/openai/functionHandlers.ts`
```typescript
export async function getAssignments(params: { classId: number }) {
  return await prisma.assignment.findMany({
    where: { classId: params.classId }
  });
}
```

### 3. Shtoni në switch në `app/api/ai-chat/route.ts`
```typescript
case 'get_assignments':
  return await handlers.getAssignments(args);
```

**Gati!** GPT-5.4 do ta kuptojë automatikisht kur ta përdorë.

## 📊 Performance & Cost

| Metrikë | Vlerë |
|---------|-------|
| **Shpejtësia mesatare** | 2-4 sekonda |
| **Kosto për query** | ~$0.005 |
| **Model** | GPT-5.4 (i shpejtë & i aftë) |
| **Gjuha** | Shqip & Anglisht |

**Kosto mujore (1000 users, 50 queries):** ~$250/month

## 🐛 Troubleshooting

### "Error 429: Quota exceeded" ⚠️
**Problemi:** OpenAI API key-i juaj nuk ka kredite.

**Zgjidhja:**
1. Shkoni te https://platform.openai.com/account/billing
2. Shtoni metodë pagese (credit card)
3. Vendosni budget limit (minimum $5)
4. Prisni disa minuta që të aktivizohet

**Alternative:**
- Krijoni account të ri OpenAI (kredite falas për fillim)
- Përdorni API key të një account tjetër

### "Error processing request"
- Kontrolloni `OPENAI_API_KEY` në `.env.local`
- Verifikoni key te https://platform.openai.com/api-keys
- Kontrolloni kreditet në OpenAI account

### "Unauthorized"
- Sigurohuni që jeni të loguar
- Session-i mund të jetë expired, bëni login përsëri

### Përgjigje të ngadalta
- Kontrolloni https://status.openai.com/
- Kontrolloni lidhjen me internet
- Kontrolloni database connection

## 🔒 Siguria

✅ **Authentication** - JWT token i detyrueshëm  
✅ **Authorization** - Role-based (Admin vs Professor)  
✅ **Activity Logs** - Të gjitha operacionet regjistrohen  
✅ **Input Validation** - JSON Schema validation  
✅ **Error Handling** - Mesazhe të sigurta gabimi  

## 📈 Avantazhet vs MCP Server

| Aspekt | OpenAI | MCP |
|--------|--------|-----|
| Performance | ⚡ 2-4s | 🐌 5-10s |
| Deployment | ✅ 1 app | ❌ 2 services |
| Cost | 💰 Më lirë | 💰💰 Më shtrenjtë |
| Mirëmbajtje | 🟢 E lehtë | 🔴 E vështirë |
| Kompleksitet | 🟢 E thjeshtë | 🔴 Komplekse |

**Për web apps: OpenAI Function Calling është zgjedhja e duhur.**

## 🧪 Testimi

### Test Bazik
```
"Hello" → Pritni përgjigje që shpjegon aftësitë
```

### Test Query
```
"Trego statistikat" → Pritni numër studentësh, profesorësh, etj
"Lista e studentëve në Infoek202" → Pritni listë studentësh
```

### Test Raporte
```
"Lista NK për klasën Infoek202, lëndën Web Development, për seminaret"
→ Pritni listë studentësh NK/OK
```

### Test Fuzzy Subject Matching
```
"Sa mungesa ka Endrit Mustafaj?" → Pritni pyetje për lëndën dhe tipin
"Projektim DB, Seminar" → Pritni statistika (matcho emrin e plotë të lëndës)
"analize db" → Matcho "Analizë e bazave të të dhënave"
```

### Test Rekordet Individuale
```
"Datat kur ka munguar studenti Endrit Mustafaj"
→ Printo listë datash me statusin e prezencës
```

---

**Gati për përdorim!** 🎉

Për pyetje: Kontrolloni logs në server ose OpenAI dashboard.
