/** Estimación tokens ≈ caracteres / 4 (convención AEO v1.0). */
export function estimateMarkdownTokens(body: string): number {
	return Math.max(1, Math.ceil(body.length / 4));
}
