import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

interface AwarenessState {
  user: {
    id: string;
    name: string;
    color: string;
  };
  cursor: { x: number; y: number } | null;
}

export class CollaborationManager {
  private doc: Y.Doc;
  private wsProvider: WebsocketProvider;
  private persistence: IndexeddbPersistence;
  private text: Y.Text;
  private awareness: WebsocketProvider['awareness'];

  constructor(roomId: string) {
    this.doc = new Y.Doc();
    this.text = this.doc.getText('content');

    // WebSocket-Verbindung für Echtzeit-Updates
    this.wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234',
      roomId,
      this.doc
    );

    // Lokale Persistenz
    this.persistence = new IndexeddbPersistence(roomId, this.doc);

    // Awareness für Benutzerpräsenz
    this.awareness = this.wsProvider.awareness;
  }

  // Text-Editor-Bindungen
  bindTextEditor(element: HTMLElement) {
    const ytext = this.text;
    interface YTextBinding {
      new(element: HTMLElement, ytext: Y.Text): {
        destroy: () => void;
        update: () => void;
      };
    }
    const binding = new ((window as unknown as { YTextBinding: YTextBinding }).YTextBinding)(element, ytext);
    return binding;
  }

  // Benutzerpräsenz aktualisieren
  updatePresence(user: { id: string; name: string; color: string }) {
    this.awareness.setLocalState({
      user,
      cursor: null,
    });
  }

  // Cursor-Position aktualisieren
  updateCursor(position: { x: number; y: number }) {
    const state = this.awareness.getLocalState() as AwarenessState;
    this.awareness.setLocalState({
      ...state,
      cursor: position,
    });
  }

  // Änderungen abonnieren
  onUpdate(callback: (update: Uint8Array) => void) {
    this.doc.on('update', callback);
  }

  // Benutzerpräsenz abonnieren
  onPresenceChange(callback: (changes: Map<number, AwarenessState>) => void) {
    this.awareness.on('change', callback);
  }

  // Verbindung trennen
  disconnect() {
    this.wsProvider.destroy();
    this.persistence.destroy();
  }
}

// Singleton-Instanz für die gesamte Anwendung
let collaborationManager: CollaborationManager | null = null;

export function getCollaborationManager(roomId: string): CollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new CollaborationManager(roomId);
  }
  return collaborationManager;
} 