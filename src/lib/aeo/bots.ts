const AI_BOT_PATTERNS = [
	/gptbot/i,
	/chatgpt-user/i,
	/claudebot/i,
	/claude-web/i,
	/anthropic-ai/i,
	/google-extended/i,
	/perplexitybot/i,
	/ccbot/i,
	/bytespider/i,
	/bingbot/i,
	/facebookbot/i,
	/cohere-ai/i,
	/applebot-extended/i,
	/amazonbot/i,
	/diffbot/i,
	/omgili/i,
	/youbot/i,
	/ai2bot/i,
	/petalbot/i
];

export function isAiBot(userAgent: string): boolean {
	if (!userAgent.trim()) return false;
	return AI_BOT_PATTERNS.some((re) => re.test(userAgent));
}
