import { DocboxAdminSearchRequest, DocboxSearchResponseAdmin } from '../types';
import { AdminDocumentBoxesRequest, AdminDocumentBoxesResponse } from '../types/admin';
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
  search(data: DocboxAdminSearchRequest): Promise<DocboxSearchResponseAdmin> {
    return this.client.httpPost(`admin/search`, data);
  }

  /**
   * Query document boxes within the tenant
   *
   * @param data Query data
   * @returns The boxes results
   */
  documentBoxes(data: AdminDocumentBoxesRequest): Promise<AdminDocumentBoxesResponse> {
    return this.client.httpPost('admin/boxes', data);
  }

  /**
   * Flush the database cache
   */
  flushDatabasePoolCache() {
    return this.client.httpPost('admin/flush-db-cache');
  }

  /**
   * Flush the tenant cache
   */
  flushTenantCache() {
    return this.client.httpPost('admin/flush-tenant-cache');
  }
}
