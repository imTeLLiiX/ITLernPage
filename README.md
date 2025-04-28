# LernPage Fachinformatik

Eine Lernplattform für Fachinformatiker, die Kurse und Lernmaterialien anbietet.

## Features

- Authentifizierung mit Google
- Kursverwaltung für Lehrer
- Kursübersicht und -details
- Responsive Design mit Tailwind CSS

## Technologien

- Next.js 14 mit App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Tailwind CSS

## Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/yourusername/lernpage-fachinformatik.git
   cd lernpage-fachinformatik
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Umgebungsvariablen konfigurieren:
   - `.env.example` zu `.env` kopieren
   - Umgebungsvariablen in `.env` anpassen

4. Datenbank einrichten:
   ```bash
   npx prisma migrate dev
   ```

5. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

## Umgebungsvariablen

Die folgenden Umgebungsvariablen müssen in der `.env`-Datei konfiguriert werden:

- `DATABASE_URL`: PostgreSQL-Verbindungs-URL
- `NEXTAUTH_URL`: URL der Anwendung (z.B. http://localhost:3000)
- `NEXTAUTH_SECRET`: Geheimer Schlüssel für NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

## Google OAuth einrichten

1. Google Cloud Console öffnen
2. Neues Projekt erstellen
3. OAuth 2.0-Client-ID erstellen
4. Autorisierte Umleitungs-URIs hinzufügen:
   - http://localhost:3000/api/auth/callback/google (Entwicklung)
   - https://ihre-domain.de/api/auth/callback/google (Produktion)
5. Client ID und Client Secret in `.env` eintragen

## Entwicklung

- `npm run dev`: Entwicklungsserver starten
- `npm run build`: Produktions-Build erstellen
- `npm run start`: Produktionsserver starten
- `npm run lint`: Code-Qualität prüfen

## Datenbankschema

Das Datenbankschema wird mit Prisma verwaltet. Die wichtigsten Modelle sind:

- `User`: Benutzer (Lehrer/Studenten)
- `Course`: Kurse
- `Account`: OAuth-Konten
- `Session`: Aktive Sitzungen

## Lizenz

MIT 