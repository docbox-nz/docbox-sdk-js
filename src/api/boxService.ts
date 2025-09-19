import { isAxiosError } from 'axios';
import {
  DocboxSearchRequest,
  DocboxSearchResponse,
  DocumentBoxResponse,
  DocumentBoxScope,
  DocumentBoxStats,
} from '../types';
import { DocboxClient } from './client';
import { DocumentBoxNotFoundError } from './error';

export class BoxService {
  private client: DocboxClient;

  constructor(client: DocboxClient) {
    this.client = client;
  }

  /**
   * Get a document box for a scope
   *
   * @param scope Scope of the document box to get
   * @param createIfMissing Whether to create the document box if it doesn't exist
   */
  async get(
    scope: DocumentBoxScope,
    createIfMissing: boolean = false
  ): Promise<DocumentBoxResponse> {
    try {
      return await this.client.httpGet(`box/${scope}`);
    } catch (err) {
      // Handle a document box not being created yet
      if (isAxiosError(err) && err.response?.status === 404) {
        if (createIfMissing) {
          // Attempt to create the document box
          return this.create(scope, false);
        }

        throw new DocumentBoxNotFoundError();
      }

      throw err;
    }
  }
  /**
   * Get a document box for a scope, return null if one was not found
   *
   * @param scope Scope of the document box to get
   */
  async getOrNull(scope: DocumentBoxScope): Promise<DocumentBoxResponse | null> {
    try {
      return await this.get(scope);
    } catch (err) {
      if (err instanceof DocumentBoxNotFoundError) {
        return null;
      }

      throw err;
    }
  }

  /**
   * Creates a new document box optional returning an existing one if there is one available
   *
   * @param scope Scope for the document box to create
   * @param allowExisting Whether to allow returning an existing document box (If one is present)
   * @returns The created document box
   */
  async create(
    scope: DocumentBoxScope,
    allowExisting: boolean = true
  ): Promise<DocumentBoxResponse> {
    try {
      return await this.client.httpPost('box', { scope });
    } catch (err) {
      // Handle document box already exists response
      if (allowExisting && isAxiosError(err) && err.response?.status === 409) {
        return this.get(scope);
      }

      throw err;
    }
  }

  /**
   * Delete a specific document box
   *
   * If the document box did not exist this is silently handled as
   * a success case
   *
   * @param scope Scope of the document box to delete
   * @param allowMissing Quietly ignore the document box not existing
   * @returns
   */
  async delete(scope: DocumentBoxScope, allowMissing: boolean = true): Promise<any> {
    try {
      return this.client.httpDelete(`box/${scope}`);
    } catch (err) {
      // Handle document box never existed
      if (isAxiosError(err) && err.response?.status === 404) {
        if (allowMissing) {
          return {};
        }

        throw new DocumentBoxNotFoundError();
      }

      throw err;
    }
  }

  /**
   * Search within the provided document box
   *
   * @param scope The scope of the document box to search
   * @param data Search request data
   * @returns The search results
   */
  async search(scope: DocumentBoxScope, data: DocboxSearchRequest): Promise<DocboxSearchResponse> {
    return await this.client.httpPost(`box/${scope}/search`, data);
  }

  /**
   * Get statistics for the provided document box
   *
   * @param scope The scope of the document box
   * @returns The box stats
   */
  async stats(scope: DocumentBoxScope): Promise<DocumentBoxStats> {
    return await this.client.httpGet(`box/${scope}/stats`);
  }
}
