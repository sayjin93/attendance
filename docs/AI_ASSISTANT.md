# 🤖 AI Assistant - OpenAI Function Calling

AI Assistant për sistemin e prezencës që përdor OpenAI GPT-4 me Function Calling për operacione CRUD të avancuara.

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
GPT-4 kupton qëllimin tuaj
    ↓
Zgjedh automatikisht funksionin e duhur
    ↓
Ekzekuton operacionin në database
    ↓ Kthen përgjigje në gjuhë natyrale
```

**Shembuj:**
```
"Trego studentët në Infoek202"
"Create lecture for Web Development tomorrow"
"Shëno John Doe prezent sot"
"What's the attendance rate for Infoek202?"
```

## 📋 Operacionet e Disponueshme

### 📊 Query (Shikimi i të dhënave)
- System statistics - `"Trego statistikat"`
- Students - `"Lista e studentëve në Infoek202"`
- Classes - `"Trego klasat"`
- Lectures - `"Leksionet e sotme"`
- Attendance - `"Prezenca për leksion 123"`
- Statistics - `"Norma e prezencës për Infoek202"`

### ➕ Create (Krijimi)
- Lectures - `"Krijo leksion për Web Development në Infoek202 nesër"`
- Attendance - `"Shëno john@example.com prezent në leksionin e sotëm"`

### ✏️ Update (Ndryshimi)
- Attendance status - `"Ndrysho prezencën 456 në excused"`

### ❌ Delete (Fshirja)
- Lectures - `"Fshi leksionin 789"` (fshin edhe attendance records)

## 🏗️ Struktura Teknike

```
lib/openai/
  ├── functions.ts          # 14 funksione që GPT mund të thërrasë
  └── functionHandlers.ts   # Implementimi i funksioneve (Prisma)

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

**Gati!** GPT do ta kuptojë automatikisht kur ta përdorë.

## 📊 Performance & Cost

| Metrikë | Vlerë |
|---------|-------|
| **Shpejtësia mesatare** | 2-4 sekonda |
| **Kosto për query** | ~$0.005 |
| **Model** | GPT-4o (i shpejtë & i aftë) |
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

### Test Create
```
"Krijo leksion për Web Development në Infoek202 nesër"
→ Pritni konfirmim me ID të leksionit
```

### Test Multi-Step
```
"Trego leksionet e sotme dhe shëno John prezent në të parin"
→ Pritni të ekzekutohen 2 funksione
```

---

**Gati për përdorim!** 🎉

Për pyetje: Kontrolloni logs në server ose OpenAI dashboard.
