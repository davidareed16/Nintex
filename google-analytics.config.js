import { PluginContract } from '@nintex/form-plugin-contract';

export const config: PluginContract = {
  fallbackDisableSubmit: false,
  version: '1.0.0',
  controlName: 'GoogleAnalytics',
  description: 'Google Analytics',
  groupName: 'Lilly Plugins',
  standardProperties: {
    readOnly: true,
    required: true,
    description: false,
  },
  properties: {
    gtmId: {
      type: 'string',
      title: 'GTMID'
    }
  },
};
