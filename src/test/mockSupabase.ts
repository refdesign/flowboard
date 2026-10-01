import { vi } from 'vitest';

export interface QueryResult<T = unknown> {
  data: T;
  error: { message: string } | null;
}

/**
 * Mimics the subset of the supabase-js query builder FlowBoard actually uses:
 * chainable .select/.order/.eq/.insert/.update/.delete, a terminal .single(),
 * and direct awaitability (the real client resolves when you `await` it,
 * without needing to call .single() first).
 */
export function createQueryBuilder<T>(result: QueryResult<T>) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (
      onFulfilled?: ((value: QueryResult<T>) => unknown) | null,
      onRejected?: ((reason: unknown) => unknown) | null
    ) => Promise.resolve(result).then(onFulfilled ?? undefined, onRejected ?? undefined),
  };
  return builder;
}
