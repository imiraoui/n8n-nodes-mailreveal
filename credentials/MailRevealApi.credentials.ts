import type {
	IAuthenticateGeneric,
	ICredentialType,
	Icon,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class MailRevealApi implements ICredentialType {
	name = 'mailRevealApi';
	displayName = 'MailReveal API';
	icon: Icon = { light: 'file:mailreveal.svg', dark: 'file:mailreveal.dark.svg' };
	documentationUrl = 'https://mailreveal.com/api/openapi.json';
	properties: INodeProperties[] = [
		{
			displayName: 'Instance URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mailreveal.com',
			description: 'Hosted HTTPS URL or HTTP loopback URL without /api/v1',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			description: 'API key issued by MailReveal',
			typeOptions: {
				password: true,
			},
			required: true,
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: { Authorization: '={{$credentials.apiKey ? "Bearer " + $credentials.apiKey : ""}}' },
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL:
				"={{$credentials.baseUrl.endsWith('/') ? $credentials.baseUrl.slice(0, -1) + '/api/v1/capabilities' : $credentials.baseUrl + '/api/v1/capabilities'}}",
			url: '',
			method: 'GET',
		},
	};
}
