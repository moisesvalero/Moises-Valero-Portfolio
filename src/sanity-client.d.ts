declare module '@sanity/client' {
	export interface SanityClient {
		fetch<T = unknown>(query: string, params?: Record<string, unknown>): Promise<T>;
		create<T = unknown>(document: Record<string, unknown>): Promise<T>;
		createOrReplace<T = unknown>(document: Record<string, unknown>): Promise<T>;
		patch(id: string): {
			set(attributes: Record<string, unknown>): {
				commit<T = unknown>(): Promise<T>;
			};
		};
		delete<T = unknown>(id: string): Promise<T>;
	}

	export function createClient(config: Record<string, unknown>): SanityClient;
}
