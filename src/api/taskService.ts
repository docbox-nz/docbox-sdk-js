import { DocboxTask, DocboxTaskStatus, DocumentBoxScope } from '../types';
import { DocboxClient } from './client';
import { sleep } from './utils';

export class TaskService {
  private client: DocboxClient;

  constructor(client: DocboxClient) {
    this.client = client;
  }

  /**
   * Get the current status of a specific task
   *
   * @param scope
   * @param task_id
   * @returns
   */
  async get(
    scope: DocumentBoxScope,
    task_id: string,
    abort?: AbortController
  ): Promise<DocboxTask> {
    return this.client.httpGet(`box/${scope}/task/${task_id}`, {
      signal: abort?.signal,
    });
  }

  /**
   * Polls for the completion of a task
   *
   * @param scope
   * @param task_id
   * @param abort
   * @returns
   */
  async finished<T>(
    scope: DocumentBoxScope,
    task_id: string,
    interval: number = 1000,
    abort?: AbortController
  ) {
    while (abort === undefined ? true : !abort.signal.aborted) {
      const task = await this.get(scope, task_id, abort);

      if (task.status === DocboxTaskStatus.Completed) {
        const response: T = task.output_data;
        return response;
      }

      if (task.status === DocboxTaskStatus.Failed) {
        const error: string = task.output_data?.error ?? 'Unknown Error';
        throw new Error(error);
      }

      await sleep(interval);
    }

    throw new Error('upload tracking aborted');
  }
}
