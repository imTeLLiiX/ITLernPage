# LernPage Fachinformatik

Eine moderne Lernplattform für angehende Fachinformatiker.

## Features

- Kursverwaltung
- Benutzerauthentifizierung
- Fortschrittsverfolgung
- Quiz und Lektionen
- Achievements und XP-System

## Technologie-Stack

- Next.js 14
- TypeScript
- Prisma ORM
- MongoDB
- NextAuth.js
- TailwindCSS

## Installation

1. Repository klonen:
```bash
git clone https://github.com/IhrUsername/LernPage-Fachinformatik.git
cd LernPage-Fachinformatik
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen einrichten:
Kopieren Sie `.env.example` zu `.env` und füllen Sie die erforderlichen Werte aus:
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
NEXTAUTH_SECRET="ihr-geheimer-schlüssel"
NEXTAUTH_URL="http://localhost:3000"
```

4. Datenbank initialisieren:
```bash
npx prisma generate
npx prisma db push
```

5. Entwicklungsserver starten:
```bash
npm run dev
```

## Deployment

Die Anwendung ist optimiert für das Deployment auf Vercel:

1. Erstellen Sie ein Konto auf [Vercel](https://vercel.com)
2. Verbinden Sie Ihr GitHub-Repository
3. Konfigurieren Sie die Umgebungsvariablen in den Projekteinstellungen
4. Deployen Sie die Anwendung

## Lizenz

MIT 