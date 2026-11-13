import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';

export interface RequestPlan {
	options: IHttpRequestOptions;
	rpc: boolean;
	binaryProperty?: string;
}

function required(p: IDataObject, key: string): string {
	const value = String(p[key] ?? '').trim();
	if (!value) throw new Error(`${key} is required`);
	return value;
}

function bounded(p: IDataObject, key: string, fallback: number, min: number, max: number): number {
	const value = Number(p[key] ?? fallback);
	if (!Number.isInteger(value) || value < min || value > max)
		throw new Error(`${key} must be an integer between ${min} and ${max}`);
	return value;
}

function pick(p: IDataObject, keys: string[]): IDataObject {
	return Object.fromEntries(
		keys
			.filter((key) => p[key] !== '' && p[key] !== undefined && p[key] !== null)
			.map((key) => [key, p[key]]),
	);
}

function enumValue(p: IDataObject, key: string, allowed: string[], fallback: string): string {
	const value = String(p[key] ?? fallback);
	if (!allowed.includes(value)) throw new Error(`Invalid ${key}`);
	return value;
}

export function buildRequest(
	base: string,
	operation: string,
	p: IDataObject,
	credentials: IDataObject = {},
): RequestPlan {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: base,
		json: true,
		timeout: 120000,
		disableFollowRedirect: true,
		headers: { Accept: 'application/json' },
	};
	const plan: RequestPlan = { options, rpc: false };
	let body: IDataObject = {};
	{
		const configured = String(credentials.baseUrl ?? base).replace(/\/+$/, '');
		const parsed = new URL(configured);
		if (
			parsed.username ||
			parsed.password ||
			parsed.search ||
			parsed.hash ||
			(parsed.protocol !== 'https:' &&
				!(
					parsed.protocol === 'http:' &&
					['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
				))
		)
			throw new Error(
				'MailReveal URL must use HTTPS or HTTP on loopback, without credentials or a query',
			);
		options.url = configured + '/api/v1';
		if (operation === 'listMessages') {
			options.method = 'GET';
			options.url += '/messages';
			options.qs = {
				...pick(p, ['search']),
				limit: bounded(p, 'limit', 100, 1, 500),
				offset: bounded(p, 'offset', 0, 0, 1000000),
			};
			return plan;
		}
		if (['getMessage', 'sendMessage', 'createDraft'].includes(operation)) {
			const id = required(p, 'messageId');
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
				throw new Error('Message ID must be a UUID');
			options.url += '/messages/' + encodeURIComponent(id);
			if (operation === 'getMessage') {
				options.method = 'GET';
				return plan;
			}
			if (operation === 'createDraft') options.url += '/draft';
			if (operation === 'sendMessage') {
				if (p.confirmed !== true)
					throw new Error(
						'Confirm Sending must be enabled after authorizing this exact prepared message',
					);
				options.url += '/send';
				body.provider = enumValue(p, 'provider', ['auto', 'gmail', 'smtp'], 'auto');
			}
		} else if (operation === 'prepareMessage') {
			options.url += '/messages';
			body = {
				recipient: required(p, 'recipient'),
				subject: required(p, 'subject'),
				body: required(p, 'body'),
			};
			const key = required(p, 'idempotencyKey');
			if (key.length > 128 || /[\r\n]/.test(key))
				throw new Error('Idempotency key must have at most 128 characters and no line breaks');
			options.headers = { ...options.headers, 'Idempotency-Key': key };
		} else {
			const routes: Record<string, string> = {
				getEvents: '/events',
				connectionStatus: '/connection-status',
				syncGmail: '/gmail/sync',
				getWebhooks: '/webhooks',
				getDeliveries: '/deliveries',
			};
			if (!routes[operation]) throw new Error('Unknown MailReveal operation');
			options.url += routes[operation];
			if (operation !== 'syncGmail') {
				options.method = 'GET';
				if (operation === 'getEvents' && p.messageId) options.qs = { message_id: p.messageId };
				return plan;
			}
		}
	}
	options.body = body;
	return plan;
}

export function unwrapResponse(response: unknown, rpc: boolean): IDataObject {
	if (!rpc)
		return Array.isArray(response)
			? { results: response }
			: response && typeof response === 'object'
				? (response as IDataObject)
				: { data: response as string };
	const envelope = response as {
		error?: { message?: string };
		result?: {
			isError?: boolean;
			structuredContent?: IDataObject;
			content?: Array<{ type: string; text?: string }>;
		};
	};
	if (envelope.error) throw new Error(envelope.error.message || 'Remote procedure call failed');
	if (!envelope.result) throw new Error('The API returned an invalid MCP response');
	const result = envelope.result;
	const text = (result.content ?? [])
		.filter((c) => c.type === 'text')
		.map((c) => c.text ?? '')
		.join('\n');
	if (result.isError) throw new Error(text || 'The API tool failed');
	if (result.structuredContent) return result.structuredContent;
	try {
		const parsed: unknown = JSON.parse(text);
		return Array.isArray(parsed)
			? { results: parsed }
			: parsed && typeof parsed === 'object'
				? (parsed as IDataObject)
				: { data: parsed as string };
	} catch {
		return { text };
	}
}
