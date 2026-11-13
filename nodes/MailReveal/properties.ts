import type { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				value: 'createDraft',
				name: 'Create Gmail Draft',
				action: 'Create a gmail draft',
				description: 'Save a prepared message as a Gmail draft',
			},
			{
				value: 'connectionStatus',
				name: 'Get Connection Status',
				action: 'Get provider connection status',
				description: 'Read Gmail and SMTP capabilities',
			},
			{
				value: 'getDeliveries',
				name: 'Get Deliveries',
				action: 'Get webhook delivery outcomes',
				description: 'Read recent webhook delivery outcomes',
			},
			{
				value: 'getEvents',
				name: 'Get Events',
				action: 'Get email activity signals',
				description: 'Read image-load signals; loads do not prove reading',
			},
			{
				value: 'listMessages',
				name: 'Get Many Messages',
				action: 'Get many tracked messages',
				description: 'Search and paginate tracked messages',
			},
			{
				value: 'getMessage',
				name: 'Get Message',
				action: 'Get a tracked message',
				description: 'Read message history and tracking artifacts',
			},
			{
				value: 'getWebhooks',
				name: 'Get Webhooks',
				action: 'Get webhook endpoints',
				description: 'Read webhook endpoints without signing secrets',
			},
			{
				value: 'prepareMessage',
				name: 'Prepare Message',
				action: 'Prepare a tracked message',
				description: 'Create tracking HTML without sending an email',
			},
			{
				value: 'sendMessage',
				name: 'Send Message',
				action: 'Send a prepared message',
				description: 'Submit an existing prepared message once',
			},
			{
				value: 'syncGmail',
				name: 'Sync Gmail',
				action: 'Sync sent gmail messages',
				description: 'Run bounded Sent-mail reconciliation',
			},
		],
		default: 'listMessages',
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Optional recipient or subject search',
		displayOptions: {
			show: {
				operation: ['listMessages'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				operation: ['listMessages'],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		description: 'Number of results to skip',
		displayOptions: {
			show: {
				operation: ['listMessages'],
			},
		},
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
		description: 'Existing prepared or tracked message UUID',
		displayOptions: {
			show: {
				operation: ['getMessage', 'sendMessage', 'createDraft'],
			},
		},
		required: true,
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
		description: 'Optional message UUID; omit for the latest 100 signals',
		displayOptions: {
			show: {
				operation: ['getEvents'],
			},
		},
	},
	{
		displayName: 'Recipient',
		name: 'recipient',
		type: 'string',
		default: '',
		description: 'Recipient email address',
		displayOptions: {
			show: {
				operation: ['prepareMessage'],
			},
		},
		required: true,
		placeholder: 'recipient@example.com',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		description: 'Email subject',
		displayOptions: {
			show: {
				operation: ['prepareMessage'],
			},
		},
		required: true,
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		default: '',
		description: 'Email body',
		displayOptions: {
			show: {
				operation: ['prepareMessage'],
			},
		},
		required: true,
		typeOptions: {
			rows: 5,
		},
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		default: '',
		description: 'Stable unique key for this message; reuse when retrying the same content',
		displayOptions: {
			show: {
				operation: ['prepareMessage'],
			},
		},
		required: true,
	},
	{
		displayName: 'Provider',
		name: 'provider',
		type: 'options',
		default: 'auto',
		options: [
			{
				name: 'Auto',
				value: 'auto',
			},
			{
				name: 'Gmail',
				value: 'gmail',
			},
			{
				name: 'SMTP',
				value: 'smtp',
			},
		],
		displayOptions: {
			show: {
				operation: ['sendMessage'],
			},
		},
	},
	{
		displayName: 'Confirm Sending',
		name: 'confirmed',
		type: 'boolean',
		default: false,
		description: 'Whether the workflow operator has authorized sending this exact prepared message',
		displayOptions: {
			show: {
				operation: ['sendMessage'],
			},
		},
	},
];
