import { isAxiosError } from 'axios';
import {
  CreateLink,
  DocumentBoxScope,
  DocLinkEditHistory,
  LinkId,
  LinkMetadata,
  UpdateLink,
  DocLink,
} from '../types';
import { DocboxClient } from './client';
import { LinkNotFoundError } from './error';

export class LinkService {
  private client: DocboxClient;

  constructor(client: DocboxClient) {
    this.client = client;
  }

  /**
   * Get a link to the favicon image for the provided link
   *
   * @param scope Scope the link resides within
   * @param id ID of the link to request
   * @returns The favicon image URL
   */
  faviconURL(scope: string, id: string) {
    return `box/${scope}/link/${id}/favicon`;
  }

  /**
   * Get a link to the OGP image for the provided link
   *
   * @param scope Scope the link resides within
   * @param id ID of the link to request
   * @returns The OGP image URL
   */
  imageURL(scope: string, id: string) {
    return `box/${scope}/link/${id}/image`;
  }

  /**
   * Creates a new link within the provided document box
   *
   * @param scope Scope to create the link within
   * @param data Link creation data
   * @returns The created link
   */
  create(scope: DocumentBoxScope, data: CreateLink): Promise<DocLink> {
    return this.client.httpPost(`box/${scope}/link`, data);
  }

  /**
   * Request a specific link by ID
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns The requested link
   */
  async get(scope: DocumentBoxScope, link_id: LinkId): Promise<DocLink> {
    try {
      return await this.client.httpGet(`box/${scope}/link/${link_id}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        throw new LinkNotFoundError();
      }

      throw err;
    }
  }

  /**
   * Request a specific link by ID returning null if not found
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns The requested link
   */
  async getOrNull(scope: DocumentBoxScope, link_id: LinkId): Promise<DocLink | null> {
    try {
      return await this.get(scope, link_id);
    } catch (err) {
      if (err instanceof LinkNotFoundError) {
        return null;
      }

      throw err;
    }
  }

  /**
   * Requests metadata for the link. This will make a request to the site at
   * the link value to extract metadata from the website itself such as title,
   * and OGP metadata
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns The link website metadata
   */
  metadata(scope: DocumentBoxScope, link_id: LinkId): Promise<LinkMetadata> {
    return this.client.httpGet(`box/${scope}/link/${link_id}/metadata`);
  }

  /**
   * Get the raw favicon content for a link
   *
   * On node this returns an {@link ArrayBuffer} not a blob
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns The link raw favicon
   */
  favicon(scope: DocumentBoxScope, link_id: LinkId): Promise<Blob> {
    return this.client.httpGet(this.faviconURL(scope, link_id), {
      responseType: typeof window === 'undefined' ? 'arraybuffer' : 'blob',
    });
  }

  /**
   * Get the raw favicon content for a link
   *
   * This function is the same as {@link LinkService.favicon} just
   * it has the correct return type for Node and will only return an
   * ArrayBuffer
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns The link raw favicon
   */
  faviconNode(scope: DocumentBoxScope, link_id: LinkId): Promise<ArrayBuffer> {
    return this.client.httpGet(this.faviconURL(scope, link_id), {
      responseType: 'arraybuffer',
    });
  }

  /**
   * Get the raw social image for a link
   *
   * On node this returns an {@link ArrayBuffer} not a blob
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns The link raw social image
   */
  image(scope: DocumentBoxScope, link_id: LinkId): Promise<Blob> {
    return this.client.httpGet(this.imageURL(scope, link_id), {
      responseType: typeof window === 'undefined' ? 'arraybuffer' : 'blob',
    });
  }

  /**
   * Get the raw social image for a link
   *
   * This function is the same as {@link LinkService.image} just
   * it has the correct return type for Node and will only return an
   * ArrayBuffer
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns
   */
  imageNode(scope: DocumentBoxScope, link_id: LinkId): Promise<ArrayBuffer> {
    return this.client.httpGet(this.imageURL(scope, link_id), {
      responseType: 'arraybuffer',
    });
  }

  /**
   * Get the edit history for a link
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @returns Edit history for the link
   */
  editHistory(scope: DocumentBoxScope, link_id: LinkId): Promise<DocLinkEditHistory[]> {
    return this.client.httpGet(`box/${scope}/link/${link_id}/edit-history`);
  }

  /**
   * Updates a link
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   * @param data The update request
   */
  update(scope: DocumentBoxScope, link_id: LinkId, data: UpdateLink): Promise<void> {
    return this.client.httpPut(`box/${scope}/link/${link_id}`, data);
  }

  /**
   * Deletes the provided link
   *
   * @param scope Scope the link resides within
   * @param link_id ID of the link to request
   */
  delete(scope: DocumentBoxScope, link_id: LinkId): Promise<void> {
    return this.client.httpDelete(`box/${scope}/link/${link_id}`);
  }
}
