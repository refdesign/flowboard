import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { CardData, ColumnId, Priority } from '../types';

interface CardRow {
  id: string;
  title: string;
  assignee: string;
  priority: Priority;
  due_date: string;
  column_id: ColumnId;
}

function fromRow(row: CardRow): CardData {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    priority: row.priority,
    dueDate: row.due_date,
    columnId: row.column_id,
  };
}

export function useBoardState() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setCards((data as CardRow[]).map(fromRow));
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addCard = useCallback(async (card: CardData) => {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        id: card.id,
        title: card.title,
        assignee: card.assignee,
        priority: card.priority,
        due_date: card.dueDate,
        column_id: card.columnId,
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setCards((prev) => [...prev, fromRow(data as CardRow)]);
  }, []);

  const updateCard = useCallback(async (card: CardData) => {
    const { error } = await supabase
      .from('cards')
      .update({
        title: card.title,
        assignee: card.assignee,
        priority: card.priority,
        due_date: card.dueDate,
        column_id: card.columnId,
      })
      .eq('id', card.id);
    if (error) {
      setError(error.message);
      return;
    }
    setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveCard = useCallback(async (id: string, columnId: ColumnId) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, columnId } : c)));
    const { error } = await supabase.from('cards').update({ column_id: columnId }).eq('id', id);
    if (error) {
      setError(error.message);
    }
  }, []);

  return { cards, loading, error, addCard, updateCard, deleteCard, moveCard };
}
