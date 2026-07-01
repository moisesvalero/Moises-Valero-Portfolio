import { isIP } from 'node:net';

/**
 * Retorna true si la dirección IP es privada, de loopback, reservada o local.
 * Cubre IPv4, IPv6 y rangos de red en la nube como CGNAT (100.64.0.0/10).
 */
export function isPrivateIp(ip: string): boolean {
	if (!ip) return false;
	const cleanIp = ip.trim().toLowerCase();

	if (cleanIp === '::' || cleanIp === '::1' || cleanIp === '0:0:0:0:0:0:0:1') return true;
	if (
		cleanIp.startsWith('fc') ||
		cleanIp.startsWith('fd') ||
		cleanIp.startsWith('fe80:') ||
		cleanIp.startsWith('2001:db8:')
	) {
		return true;
	}
	if (cleanIp.startsWith('::ffff:')) {
		return isPrivateIp(cleanIp.slice(7));
	}

	const parts = cleanIp.split('.').map((part) => Number(part));
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	) {
		return false;
	}
	const [a, b] = parts;

	// CGNAT 100.64.0.0/10
	if (a === 100 && b >= 64 && b <= 127) return true;
	// Benchmarking 198.18.0.0/15
	if (a === 198 && b >= 18 && b <= 19) return true;
	// Reservadas IANA y locales IPv4
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		a >= 224
	);
}

/**
 * Intenta decodificar hosts en formato decimal u octal/hexadecimal para evitar bypasses de IP.
 */
function parseIpAddress(host: string): string | null {
	const cleanHost = host
		.replace(/^\[|\]$/g, '')
		.trim()
		.toLowerCase();

	if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
		return cleanHost;
	}

	if (/^(0x[0-9a-f]+|\d+)$/i.test(cleanHost)) {
		try {
			const val = cleanHost.startsWith('0x')
				? parseInt(cleanHost, 16)
				: parseInt(cleanHost, cleanHost.startsWith('0') && cleanHost.length > 1 ? 8 : 10);
			if (Number.isFinite(val) && val >= 0 && val <= 0xffffffff) {
				const a = (val >>> 24) & 0xff;
				const b = (val >>> 16) & 0xff;
				const c = (val >>> 8) & 0xff;
				const d = val & 0xff;
				return `${a}.${b}.${c}.${d}`;
			}
		} catch {
			// ignore
		}
	}

	const parts = cleanHost.split('.');
	if (parts.length === 4) {
		try {
			const decoded = parts.map((part) => {
				if (part.startsWith('0x') || part.startsWith('0X')) {
					return parseInt(part, 16);
				}
				if (part.startsWith('0') && part.length > 1) {
					return parseInt(part, 8);
				}
				return parseInt(part, 10);
			});
			if (decoded.every((val) => Number.isFinite(val) && val >= 0 && val <= 255)) {
				return decoded.join('.');
			}
		} catch {
			// ignore
		}
	}

	return null;
}

/**
 * Valida si la URL apunta a un host privado, local o reservado.
 */
export function isPrivateOrLocalResource(rawUrl: string): boolean {
	try {
		const parsed = new URL(rawUrl);
		if (!['http:', 'https:'].includes(parsed.protocol)) return true;
		const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
		if (
			hostname === 'localhost' ||
			hostname.endsWith('.localhost') ||
			hostname.endsWith('.local') ||
			hostname.endsWith('.internal') ||
			hostname.endsWith('.lan')
		) {
			return true;
		}

		const normalizedIp = parseIpAddress(hostname);
		const ipToCheck = normalizedIp || hostname;

		if (isIP(ipToCheck)) {
			return isPrivateIp(ipToCheck);
		}
		return false;
	} catch {
		return true;
	}
}

/**
 * Comprueba si la URL está permitida para auditoría pública.
 */
export function isAllowedPublicAuditUrl(input: string): boolean {
	try {
		const parsed = new URL(input);
		if (!['http:', 'https:'].includes(parsed.protocol)) return false;
		if (parsed.username || parsed.password) return false;

		const blockedPorts = new Set([
			'20',
			'21',
			'22',
			'23',
			'25',
			'53',
			'110',
			'143',
			'3306',
			'5432',
			'6379',
			'8000',
			'8080',
			'9200',
			'27017'
		]);
		if (parsed.port && blockedPorts.has(parsed.port)) return false;

		const hostname = parsed.hostname.replace(/^\[|\]$/g, '');

		// Comprobación de host local
		if (
			hostname === 'localhost' ||
			hostname.endsWith('.localhost') ||
			hostname.endsWith('.local') ||
			hostname.endsWith('.internal') ||
			hostname.endsWith('.lan')
		) {
			return false;
		}

		const normalizedIp = parseIpAddress(hostname);
		const ipToCheck = normalizedIp || hostname;

		if (isIP(ipToCheck) && isPrivateIp(ipToCheck)) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}
