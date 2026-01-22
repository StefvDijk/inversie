---
name: bewindvoering
description: Domain knowledge for Dutch financial guardianship (bewindvoering) applications. Use when building features related to allowances, budgets, client management, legal compliance, or communication with clients under financial guardianship.
---

# Bewindvoering Domain Expertise

## Wat is Bewindvoering?

Bewindvoering is een Nederlandse wettelijke beschermingsmaatregel waarbij een door de rechtbank aangestelde bewindvoerder het financiële beheer overneemt voor mensen die dit zelf niet kunnen.

## Vormen van Bewind

### Schuldenbewind
- Voor mensen met problematische schulden
- Bewindvoerder beheert alle financiën
- Doel: financiën stabiliseren, werken naar schuldenoplossing
- Vaak tijdelijk (3-5 jaar bij WSNP traject)

### Beschermingsbewind (Toestandsbewind)
- Voor mensen die door geestelijke/lichamelijke beperkingen financiën niet kunnen beheren
- Meer permanente regeling
- Focus op financiële stabiliteit en bescherming
- Voorbeelden: dementie, verstandelijke beperking, verslaving

### Curatele
- Zwaarste vorm van bescherming
- Geldt voor alle rechtshandelingen, niet alleen financieel
- Persoon wordt handelingsonbekwaam
- Curator moet meeste beslissingen nemen

## Financiële Structuur

### Rekeningen Systeem

```
┌────────────────────────────────────────────────────┐
│                  INKOMSTEN                         │
│         (Loon, uitkering, toeslagen)              │
└────────────────────────┬───────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│              BEHEERREKENING                        │
│         (Bewindvoerder beheert)                   │
│                                                    │
│  • Alle inkomsten komen hier binnen               │
│  • Vaste lasten worden betaald                    │
│  • Schulden worden afgelost                       │
│  • Client heeft GEEN toegang                      │
└───────┬────────────────────────────┬──────────────┘
        │                            │
        ▼                            ▼
┌───────────────────┐    ┌───────────────────────────┐
│  LEEFGELDREKENING │    │      SPAARREKENING        │
│                   │    │                           │
│ • Wekelijks/      │    │ • Reserveringen           │
│   maandelijks     │    │ • Vakantiegeld            │
│   budget          │    │ • Onverwachte kosten      │
│ • Client heeft    │    │ • Client heeft GEEN       │
│   pinpas          │    │   directe toegang         │
└───────────────────┘    └───────────────────────────┘
```

### Leefgeld Berekening

```typescript
// Standaard berekening
interface BudgetCalculation {
  monthlyIncome: number;        // Totale inkomsten
  fixedExpenses: number;        // Vaste lasten (huur, energie, verzekeringen)
  debtPayments: number;         // Schuldenafbetaling
  savings: number;              // Reserveringen
  allowance: number;            // Leefgeld = rest
}

// Voorbeeld:
// Inkomen: €1.400
// Vaste lasten: €800
// Schulden: €200
// Sparen: €50
// Leefgeld: €350/maand = €80,77/week
```

### Typische Budgetverdeling

| Post | Percentage | Voorbeeld (€1.400 inkomen) |
|------|------------|---------------------------|
| Huur | 30-40% | €420 |
| Energie | 8-12% | €140 |
| Verzekeringen | 5-8% | €100 |
| Schulden | 10-20% | €200 |
| Leefgeld | 25-35% | €350 |
| Sparen | 3-5% | €50 |

## Leefgeld Aanvraag Proces

### Standaard Flow

1. **Cliënt dient aanvraag in**
   - Bedrag
   - Reden/doel
   - Eventueel bewijs (offerte, factuur)

2. **Bewindvoerder beoordeelt**
   - Past het in het budget?
   - Is het noodzakelijk?
   - Is de reden geldig?

3. **Beslissing**
   - Goedkeuren → automatische overboeking
   - Afwijzen → uitleg naar cliënt
   - Gedeeltelijk goedkeuren → alternatief aanbieden

### Geldige Redenen voor Extra Leefgeld

**Meestal goedgekeurd:**
- Medische kosten (niet vergoed door verzekering)
- Essentiële huishoudelijke artikelen
- Reiskosten voor medische afspraken
- Schoolkosten kinderen
- Reparatie kapotte wasmachine/koelkast

**Afhankelijk van situatie:**
- Verjaardagscadeau (redelijk bedrag)
- Kerstcadeau kinderen
- Huisdierkosten
- Hobby/sport contributie

**Meestal afgewezen:**
- Luxe artikelen
- Tweede telefoon
- Vakanties (tenzij gespaard)
- Gokken/loterij
- Leningen aan derden

### Rode Vlaggen

```typescript
const redFlags = [
  'Frequente extra aanvragen (>2 per maand)',
  'Vage omschrijvingen',
  'Bedrag past niet bij reden',
  'Aanvraag voor contant geld',
  'Herhaalde aanvragen voor zelfde categorie',
  'Aanvraag vlak na betaling leefgeld',
  'Druk uitoefenen voor snelle goedkeuring'
];
```

## Communicatie met Cliënten

### Taalgebruik

**DO:**
- Gebruik eenvoudig Nederlands (B1 niveau)
- Korte zinnen (max 15 woorden)
- Actieve zinnen
- Concreetheid

**DON'T:**
- Vakjargon ("budgetplan", "reservering vormen")
- Dubbele ontkenningen
- Passieve zinnen
- Vage termen ("binnenkort", "mogelijk")

### Voorbeeldberichten

**Goedkeuring:**
```
Beste [naam],

Goed nieuws! Je aanvraag voor €[bedrag] is goedgekeurd.
Reden: [omschrijving]

Het geld staat morgen op je leefgeldrekening.

Groet,
[bewindvoerder]
```

**Afwijzing (met uitleg en alternatief):**
```
Beste [naam],

Bedankt voor je aanvraag voor €[bedrag] voor [doel].

Helaas kan ik dit nu niet goedkeuren.
Reden: [concrete uitleg]

Wat ik wel kan doen:
- [alternatief 1]
- [alternatief 2]

Heb je vragen? Stuur me gerust een bericht.

Groet,
[bewindvoerder]
```

**Vraag om meer informatie:**
```
Beste [naam],

Ik heb je aanvraag ontvangen voor €[bedrag].

Om deze te kunnen beoordelen heb ik nog iets nodig:
- [specifiek document/informatie]

Kun je dit naar me sturen?

Groet,
[bewindvoerder]
```

## Juridische Vereisten

### AVG/GDPR Compliance

**Gevoelige gegevens:**
- BSN (Burgerservicenummer) - HOOGST GEVOELIG
- Medische informatie
- Schuldeninformatie
- Bankrekeningnummers

**Vereisten:**
```typescript
// BSN moet versleuteld opgeslagen
encryptedBsn = AES256.encrypt(bsn, ENCRYPTION_KEY);

// Toegang tot BSN moet gelogd
await auditLog.create({
  action: 'VIEW_BSN',
  userId: currentUser.id,
  clientId: client.id,
  timestamp: new Date(),
  reason: 'Verificatie voor rechtbank'
});

// Bewaartermijn: 7 jaar na einde bewind
retentionDate = endOfBewind.addYears(7);
```

### Rechtbank Rapportage

**Jaarlijkse Rekening & Verantwoording:**
- Overzicht alle inkomsten
- Overzicht alle uitgaven
- Vermogensontwikkeling
- Schuldenontwikkeling
- Bijzonderheden

**Toestemming nodig van rechter voor:**
- Verkoop onroerend goed
- Aangaan van leningen
- Schikkingen boven bepaald bedrag
- Beëindiging bewind

### Klachtenprocedure

1. Cliënt kan klagen bij bewindvoerder
2. Als onopgelost: klacht bij kantoor/organisatie
3. Als onopgelost: klacht bij kantonrechter
4. Rechter kan bewindvoerder ontslaan

## Technische Implementatie Tips

### Bedragen

```typescript
// ALTIJD opslaan in centen (integers)
// Dit voorkomt floating point problemen

// ✅ GOED
amount: 7550  // = €75,50

// ❌ FOUT
amount: 75.50  // Floating point issues!

// Conversie functies
const toCents = (euros: number): number => Math.round(euros * 100);
const toEuros = (cents: number): number => cents / 100;

// Weergave
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
};
// Output: "€ 75,50"
```

### Datum/Tijd

```typescript
// Opslaan: UTC
// Weergeven: Europe/Amsterdam

import { formatInTimeZone } from 'date-fns-tz';
import { nl } from 'date-fns/locale';

const formatForClient = (date: Date): string => {
  return formatInTimeZone(
    date,
    'Europe/Amsterdam',
    'd MMMM yyyy',
    { locale: nl }
  );
};
// Output: "15 januari 2026"
```

### Status Waarden

```typescript
enum AllowanceRequestStatus {
  PENDING = 'pending',       // Wacht op beoordeling
  APPROVED = 'approved',     // Goedgekeurd
  REJECTED = 'rejected',     // Afgewezen
  CANCELLED = 'cancelled',   // Geannuleerd door cliënt
  PAID = 'paid',            // Uitbetaald
  EXPIRED = 'expired'       // Verlopen (niet behandeld binnen X dagen)
}

// Status transities
const allowedTransitions: Record<AllowanceRequestStatus, AllowanceRequestStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled', 'expired'],
  approved: ['paid', 'cancelled'],
  rejected: [],  // Eindstatus
  cancelled: [], // Eindstatus
  paid: [],      // Eindstatus
  expired: []    // Eindstatus
};
```

### Validatie

```typescript
import { z } from 'zod';

const allowanceRequestSchema = z.object({
  amount: z.number()
    .int('Bedrag moet een geheel getal zijn (in centen)')
    .min(100, 'Minimum aanvraag is €1,00')
    .max(100000, 'Maximum aanvraag is €1.000,00'),
  
  reason: z.string()
    .min(10, 'Geef een duidelijke omschrijving (min 10 tekens)')
    .max(500, 'Omschrijving te lang (max 500 tekens)'),
  
  category: z.enum([
    'medical',
    'household',
    'transport',
    'clothing',
    'education',
    'other'
  ]),
  
  urgency: z.enum(['normal', 'urgent']).default('normal'),
  
  attachments: z.array(z.string().url()).optional()
});
```

### Notificaties

```typescript
// Template voor push notificatie
const notificationTemplates = {
  requestApproved: {
    title: 'Aanvraag goedgekeurd',
    body: 'Je aanvraag voor €{amount} is goedgekeurd. Het geld staat morgen op je rekening.'
  },
  requestRejected: {
    title: 'Aanvraag afgewezen',
    body: 'Je aanvraag voor €{amount} is helaas afgewezen. Bekijk de app voor meer informatie.'
  },
  newMessage: {
    title: 'Nieuw bericht',
    body: '{senderName} heeft je een bericht gestuurd.'
  },
  allowanceDeposited: {
    title: 'Leefgeld gestort',
    body: 'Er is €{amount} gestort op je leefgeldrekening.'
  },
  lowBalance: {
    title: 'Saldo bijna op',
    body: 'Je hebt nog €{balance} op je leefgeldrekening.'
  }
};
```

## Inclusief Beslissen

Sommige organisaties (zoals Inversie Bewind) werken met "Inclusief Beslissen" - een methodiek waarbij cliënten meer betrokken worden bij financiële beslissingen.

### Principes

1. **Informeren** - Cliënt heeft recht op informatie
2. **Betrekken** - Vraag mening van cliënt
3. **Eigen regie** - Waar mogelijk, laat cliënt kiezen
4. **Ondersteunen** - Help bij beslissing, neem niet over

### Implementatie in App

```typescript
// Beslissingsmodule vragen
interface DecisionQuestion {
  id: string;
  question: string;           // De vraag
  helpText: string;           // Uitleg
  options: DecisionOption[];  // Keuzemogelijkheden
  category: 'financial' | 'daily' | 'housing' | 'health';
}

interface DecisionOption {
  label: string;
  value: string;
  consequence: string;  // Wat betekent deze keuze?
}

// Voorbeeld vraag
const exampleQuestion: DecisionQuestion = {
  id: 'savings-goal',
  question: 'Waarvoor wil je sparen?',
  helpText: 'Je hebt elke maand €50 over. Dit geld kunnen we opzij zetten.',
  options: [
    { 
      label: 'Vakantie', 
      value: 'vacation',
      consequence: 'Over 12 maanden heb je €600 voor vakantie.'
    },
    { 
      label: 'Buffer voor onverwachte kosten', 
      value: 'emergency',
      consequence: 'Je bouwt een noodfonds op voor als er iets kapot gaat.'
    },
    { 
      label: 'Nieuwe meubels', 
      value: 'furniture',
      consequence: 'Over 6 maanden heb je €300 voor nieuwe meubels.'
    }
  ],
  category: 'financial'
};
```

## Handige Berekeningen

```typescript
// Weekelijks leefgeld uit maandelijks
const weeklyFromMonthly = (monthly: number): number => {
  return Math.floor(monthly / 4.33);
};

// Beschikbaar budget deze maand
const availableBudget = (
  monthlyAllowance: number,
  approvedRequests: number,
  spentSoFar: number
): number => {
  return monthlyAllowance - approvedRequests - spentSoFar;
};

// Dagen tot volgende storting
const daysUntilNextDeposit = (
  lastDeposit: Date,
  frequency: 'weekly' | 'biweekly' | 'monthly'
): number => {
  const intervals = { weekly: 7, biweekly: 14, monthly: 30 };
  const nextDeposit = addDays(lastDeposit, intervals[frequency]);
  return differenceInDays(nextDeposit, new Date());
};

// Kan deze aanvraag worden goedgekeurd?
const canApprove = (
  requestAmount: number,
  availableBudget: number,
  savingsBalance: number,
  isUrgent: boolean
): { canApprove: boolean; source: 'budget' | 'savings' | 'split' | 'none' } => {
  if (requestAmount <= availableBudget) {
    return { canApprove: true, source: 'budget' };
  }
  if (isUrgent && requestAmount <= savingsBalance) {
    return { canApprove: true, source: 'savings' };
  }
  if (availableBudget + savingsBalance >= requestAmount) {
    return { canApprove: true, source: 'split' };
  }
  return { canApprove: false, source: 'none' };
};
```

---

## Referenties

- [Rijksoverheid - Bewind](https://www.rijksoverheid.nl/onderwerpen/curatele-bewind-en-mentorschap/bewind)
- [Rechtspraak.nl - Bewind](https://www.rechtspraak.nl/Onderwerpen/Bewind)
- [BPBI - Branchevereniging](https://www.bpbi.nl)
- [Wettekst BW Titel 19](https://wetten.overheid.nl/BWBR0005537/2024-01-01#Boek1_Titeldeel19)
