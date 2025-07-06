import type { AxiosRequestConfig, AxiosInstance } from 'axios';

import { FileService } from './fileService';
import { BoxService as DocumentBoxService } from './boxService';
import { LinkService } from './linkService';
import { FolderService } from './folderService';
import { TaskService } from './taskService';
import { AdminService } from './adminService';

export class DocboxClient {
  client: AxiosInstance;

  /**
   * Document box related operations
   */
  documentBox: DocumentBoxService;

  /**
   * Task related operations
   */
  task: TaskService;

  /**
   * File related operations
   */
  file: FileService;

  /**
   * Link related operations
   */
  link: LinkService;

  /**
   * Folder related operations
   */
  folder: FolderService;

  /**
   * Admin related operations
   */
  admin: AdminService;

  /**
   * Creates a new docbox
   *
   * @param client
   */
  constructor(client: AxiosInstance) {
    this.client = client;

    this.documentBox = new DocumentBoxService(this);
    this.task = new TaskService(this);
    this.file = new FileService(this);
    this.link = new LinkService(this);
    this.folder = new FolderService(this);
    this.admin = new AdminService(this);
  }

  async httpGet<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>) {
    const { data } = await this.client.get<T>(url, config);
    return data;
  }

  async httpPost<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    const { data: responseData } = await this.client.post<T>(url, data, config);
    return responseData;
  }

  async httpPut<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    const { data: responseData } = await this.client.put<T>(url, data, config);
    return responseData;
  }

  async httpPatch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    const { data: responseData } = await this.client.patch<T>(url, data, config);
    return responseData;
  }

  async httpDelete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>) {
    const { data: responseData } = await this.client.delete<T>(url, config);
    return responseData;
  }

  toJSON() {
    return { url: this.client.getUri() };
  }
}
