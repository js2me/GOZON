import type { ProfileDC } from '../../shared/api/api';

export interface SsrApi {
  getProfile(): Promise<ProfileDC>;
}
