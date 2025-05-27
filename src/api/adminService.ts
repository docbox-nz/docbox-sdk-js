import { DocboxAdminSearchRequest, DocboxSearchResponseAdmin } from '../types';
import { DocboxClient } from './client';

export class AdminService {
  private client: DocboxClient;

  constructor(client: DocboxClient) {
    this.client = client;
  }

  /**
   * Perform an admin search across multiple document boxes.
   *
   * This function will only work on your server handling authentication
   * you should not allow the frontend to access these endpoints
   *
   * @param data Search request data
   * @returns The search results
   */
  async search(data: DocboxAdminSearchRequest): Promise<DocboxSearchResponseAdmin> {
    return await this.client.httpPost(`admin/search`, data);
  }
}
