import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  // Hilfestellung bei Code-Problemen
  async getCodeHelp(code: string, error: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein erfahrener Programmierer und hilfst bei Code-Problemen. Erkläre die Lösung klar und verständlich.',
          },
          {
            role: 'user',
            content: `Ich habe ein Problem mit folgendem Code:\n\n${code}\n\nFehlermeldung: ${error}\n\nKannst du mir helfen?`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || 'Keine Antwort erhalten';
    } catch (error) {
      console.error('Fehler bei der KI-Anfrage:', error);
      throw new Error('Fehler bei der KI-Anfrage');
    }
  }

  // Lernempfehlungen basierend auf dem Fortschritt
  async getLearningRecommendations(progress: Array<{ completed: boolean; score: number | null }>): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein erfahrener Lernexperte und gibst personalisierte Lernempfehlungen.',
          },
          {
            role: 'user',
            content: `Basierend auf diesem Lernfortschritt:\n\n${JSON.stringify(progress)}\n\nWas würdest du als nächstes empfehlen?`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content || 'Keine Empfehlungen erhalten';
    } catch (error) {
      console.error('Fehler bei der KI-Anfrage:', error);
      throw new Error('Fehler bei der KI-Anfrage');
    }
  }

  // Quizfragen generieren
  async generateQuizQuestions(topic: string, difficulty: string): Promise<Array<{
    question: string;
    answers: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du erstellst Quizfragen im JSON-Format mit Fragen, Antworten und Erklärungen.',
          },
          {
            role: 'user',
            content: `Erstelle 5 Quizfragen zum Thema "${topic}" mit Schwierigkeitsgrad "${difficulty}". Formatiere die Antwort als JSON-Array mit Objekten, die folgende Struktur haben: { question: string, answers: string[], correctAnswer: number, explanation: string }`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Keine Antwort erhalten');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Fehler bei der KI-Anfrage:', error);
      throw new Error('Fehler bei der KI-Anfrage');
    }
  }

  // Code-Übungen generieren
  async generateCodeExercise(topic: string, difficulty: string): Promise<{
    description: string;
    tests: string[];
    solution: string;
    hints: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du erstellst Programmierübungen mit Aufgabenstellung, Tests und Lösung.',
          },
          {
            role: 'user',
            content: `Erstelle eine Programmierübung zum Thema "${topic}" mit Schwierigkeitsgrad "${difficulty}". Formatiere die Antwort als JSON-Objekt mit: { description: string, tests: string[], solution: string, hints: string[] }`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Keine Antwort erhalten');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Fehler bei der KI-Anfrage:', error);
      throw new Error('Fehler bei der KI-Anfrage');
    }
  }
}

// Singleton-Instanz
const aiService = new AIService();
export default aiService; 