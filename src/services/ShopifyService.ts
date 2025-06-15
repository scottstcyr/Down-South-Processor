import { ShopifyGraphQLResponse, ShopifyTenderTransaction } from '../types/ShopifyTypes';
import { withRetry, shopifyRetryOptions } from '../utils/retry';
import { log } from '../utils/logger';

export interface ShopifyConfig {
  domain: string;
  accessToken: string;
  apiVersion: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class ShopifyService {
  private config: ShopifyConfig;
  private graphqlUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.graphqlUrl = `https://${config.domain}/admin/api/${config.apiVersion}/graphql.json`;
  }

  static fromEnvironment(): ShopifyService {
    const domain = process.env.SHOPIFY_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2025-01';

    if (!domain || !accessToken) {
      throw new Error('Missing required Shopify environment variables: SHOPIFY_DOMAIN, SHOPIFY_ACCESS_TOKEN');
    }

    return new ShopifyService({
      domain,
      accessToken,
      apiVersion
    });
  }
}
