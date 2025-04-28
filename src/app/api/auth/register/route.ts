import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

// Benutzerdefinierter Role-Typ
type Role = 'USER' | 'ADMIN' | 'TEACHER'

// Benutzer-Schnittstelle
interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

// Temporäre Benutzerliste (später durch Datenbank ersetzen)
const users: User[] = []

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validierung
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Überprüfen, ob die E-Mail bereits existiert
    if (users.some(user => user.email === email)) {
      return NextResponse.json(
        { message: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 400 }
      )
    }

    // Passwort hashen
    const hashedPassword = await hash(password, 12)

    // Neuen Benutzer erstellen
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      password: hashedPassword,
      role: 'USER'
    }

    // Benutzer zur Liste hinzufügen
    users.push(newUser)

    return NextResponse.json(
      { message: 'Registrierung erfolgreich' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registrierungsfehler:', error)
    return NextResponse.json(
      { message: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
} 