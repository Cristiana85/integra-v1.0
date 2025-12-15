import { Injectable, computed, signal } from '@angular/core';

/* =========================
   MODELS (temporanei)
   ========================= */

type ChatId = string;

interface ChatItem {
  id: ChatId;
  title: string;
  lastPreview: string;
  lastDate: string;
  initials: string;
}

interface Message {
  id: string;
  chatId: ChatId;
  kind: 'incoming' | 'outgoing';
  text?: string;
  imageUrl?: string;
}

/* =========================
   WORKSPACE STATE (LOCAL)
   ========================= */

@Injectable({ providedIn: 'root' })
export class WorkspaceState {
  private chatsSig = signal<ChatItem[]>([
    {
      id: 'c1',
      title: 'Massimo Del Prete',
      lastPreview: 'Tu: https://www.amazon.it/…',
      lastDate: '01/09',
      initials: 'MP',
    },
    {
      id: 'c2',
      title: 'Brunella Serani',
      lastPreview: 'Ok!',
      lastDate: '05/04',
      initials: 'BS',
    },
  ]);

  private messagesSig = signal<Message[]>([
    { id: 'm1', chatId: 'c1', kind: 'incoming', text: 'Mi mandi il link?' },
    {
      id: 'm2',
      chatId: 'c1',
      kind: 'outgoing',
      text: 'https://www.amazon.it/dp/…',
    },
    {
      id: 'm3',
      chatId: 'c1',
      kind: 'incoming',
      imageUrl: 'assets/mock/passport.jpg',
    },
  ]);

  selectedChatId = signal<ChatId>('c1');

  /* =========================
     DERIVED STATE
     ========================= */

  chats = computed(() => this.chatsSig());

  selectedChat = computed(
    () => this.chatsSig().find((c) => c.id === this.selectedChatId()) ?? null
  );

  selectedMessages = computed(() =>
    this.messagesSig().filter((m) => m.chatId === this.selectedChatId())
  );

  /* =========================
     ACTIONS
     ========================= */

  selectChat(id: string) {
    console.log('selectChat ->', id);
    this.selectedChatId.set(id);
  }

  send(text: string) {
    const t = text.trim();
    if (!t) return;

    this.messagesSig.update((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        chatId: this.selectedChatId(),
        kind: 'outgoing',
        text: t,
      },
    ]);

    this.chatsSig.update((list) =>
      list.map((c) =>
        c.id === this.selectedChatId()
          ? { ...c, lastPreview: `Tu: ${t}`, lastDate: this.today() }
          : c
      )
    );
  }

  private today() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}`;
  }
}
