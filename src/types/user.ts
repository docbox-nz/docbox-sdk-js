import { UserId } from './shared';

/**
 * User within the docbox database
 */
export interface User {
  /**
   * ID of the user
   */
  id: UserId;
  /**
   * Name of the user if this is known
   * (Based on the last modification performed)
   */
  name: string | null;
  /**
   * Image ID of the user if this is known
   * (Based on the last modification performed)
   */
  image_id: string | null;
}
