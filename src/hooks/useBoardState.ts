import { useCallback, useEffect, useState } from 'react';
import type { CardData, ColumnId } from '../types';

const STORAGE_KEY = 'flowboard:cards';

function loadCards(): CardData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useBoardState() {
  const [cards, setCards] = useState<CardData[]>(() => loadCards());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const addCard = useCallback((card: CardData) => {
    setCards((prev) => [...prev, card]);
  }, []);

  const updateCard = useCallback((card: CardData) => {
    setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveCard = useCallback((id: string, columnId: ColumnId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, columnId } : c))
    );
  }, []);

  return { cards, addCard, updateCard, deleteCard, moveCard };
}
