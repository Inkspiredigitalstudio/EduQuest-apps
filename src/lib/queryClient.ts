// Simple lightweight Query & State Manager helper
export class MiniQueryClient {
  private cache = new Map<string, any>();
  private listeners = new Map<string, Set<(data: any) => void>>();

  async fetchQuery<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const data = await queryFn();
    this.cache.set(key, data);
    this.notify(key, data);
    return data;
  }

  setQueryData<T>(key: string, data: T): void {
    this.cache.set(key, data);
    this.notify(key, data);
  }

  getQueryData<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  invalidateQueries(key: string): void {
    this.cache.delete(key);
  }

  subscribe(key: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify(key: string, data: any) {
    this.listeners.get(key)?.forEach((fn) => fn(data));
  }
}

export const queryClient = new MiniQueryClient();
