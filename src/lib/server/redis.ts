import { env } from '$env/dynamic/private';

/**
 * Cliente minimalista de Upstash Redis que funciona sobre HTTP (Fetch).
 * Diseñado específicamente para entornos serverless (Vercel) sin dependencias adicionales.
 */
class ServerlessRedisClient {
	private url: string;
	private token: string;
	private keyPrefix = 'portfolio:';

	constructor(url: string, token: string) {
		this.url = url.trim().replace(/\/$/, '');
		this.token = token.trim();
	}

	/**
	 * Ejecuta un comando en Redis mediante API REST.
	 */
	async exec<T = any>(command: (string | number)[] | (string | number)[][]): Promise<T> {
		try {
			const response = await fetch(`${this.url}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(command)
			});

			if (!response.ok) {
				const details = await response.text().catch(() => '');
				throw new Error(`Upstash Redis HTTP error ${response.status}: ${details}`);
			}

			const payload = await response.json();

			if (payload.error) {
				throw new Error(`Upstash Redis command error: ${payload.error}`);
			}

			return payload.result as T;
		} catch (error) {
			console.error(`[Redis] Execution error:`, error);
			throw error;
		}
	}

	/**
	 * Incrementa un contador y define su tiempo de expiración (TTL) en segundos.
	 * Se utiliza para la lógica de Rate Limit por IP y presupuestos diarios.
	 */
	async incrWithTtl(keyName: string, ttlSeconds: number): Promise<number> {
		const fullKey = `${this.keyPrefix}${keyName}`;
		// Usamos un pipeline REST en Upstash enviando un array de comandos
		const results = await this.exec<[number, number]>([
			['INCR', fullKey],
			['EXPIRE', fullKey, ttlSeconds, 'NX']
		]);
		return results[0];
	}

	/**
	 * Guarda un valor en caché con un tiempo de vida (TTL) en milisegundos.
	 */
	async setCache(keyName: string, data: any, ttlMs: number): Promise<void> {
		const fullKey = `${this.keyPrefix}cache:${keyName}`;
		const payload = JSON.stringify(data);
		const ttlSeconds = Math.max(1, Math.round(ttlMs / 1000));
		await this.exec(['SET', fullKey, payload, 'EX', ttlSeconds]);
	}

	/**
	 * Recupera un valor de la caché.
	 */
	async getCache<T = any>(keyName: string): Promise<T | null> {
		const fullKey = `${this.keyPrefix}cache:${keyName}`;
		const raw = await this.exec<string | null>(['GET', fullKey]);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}
}

let redisClient: ServerlessRedisClient | null = null;
let isInitialized = false;

/**
 * Obtiene el cliente Redis si las credenciales de Upstash están configuradas en el entorno.
 * Retorna null si no están presentes (activando fallback local).
 */
export function getRedisClient(): ServerlessRedisClient | null {
	if (isInitialized) return redisClient;
	isInitialized = true;

	const url = env.UPSTASH_REDIS_REST_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN;

	if (url && token) {
		redisClient = new ServerlessRedisClient(url, token);
	} else {
		console.warn(
			'[Redis] No credentials found (UPSTASH_REDIS_REST_URL/TOKEN). Falling back to local storage.'
		);
	}

	return redisClient;
}
