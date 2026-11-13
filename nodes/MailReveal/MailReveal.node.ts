import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { properties } from './properties';
import { buildRequest, unwrapResponse } from './request';

export class MailReveal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MailReveal',
		name: 'mailReveal',
		icon: { light: 'file:mailreveal.svg', dark: 'file:mailreveal.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Prepare tracked emails, create Gmail drafts, and read email activity signals',
		defaults: { name: 'MailReveal' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mailRevealApi', required: true }],
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const output: INodeExecutionData[] = [];
		const credentials: IDataObject = await this.getCredentials('mailRevealApi');
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const params: IDataObject = {};
				for (const property of properties) {
					const operations = property.displayOptions?.show?.operation;
					if (property.name !== 'operation' && (!operations || operations.includes(operation)))
						params[property.name] = this.getNodeParameter(
							property.name,
							itemIndex,
							property.default,
						) as IDataObject[string];
				}
				const plan = buildRequest('https://mailreveal.com/api/v1', operation, params, credentials);
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'mailRevealApi',
					plan.options,
				);
				output.push({ json: unwrapResponse(response, plan.rpc), pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail())
					output.push({ json: { error: error.message }, pairedItem: { item: itemIndex } });
				else throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}
		return [output];
	}
}
