/* eslint-disable */
import { setEndpoint, setFetchGraphQlHeader } from '@dropins/tools/fetch-graphql.js';

/**
 * Initializes Adobe Commerce SaaS GraphQL services.
 */
export function initCommerce() {
  try {
    // Configure the Commerce GraphQL Catalog Service endpoint
    setEndpoint('https://commerce-catalog-service.adobe.io/graphql');

    // Set store view context headers
    setFetchGraphQlHeader('Store', 'default');
    setFetchGraphQlHeader('Content-Type', 'application/json');
  } catch (error) {
    console.warn('[Commerce Initializer] Running in offline or mock mode:', error);
  }
}