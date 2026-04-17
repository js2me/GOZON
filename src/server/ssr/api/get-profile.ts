import { getProfileFromDb } from '../../data/profile';

export function createGetProfile(sessionId: string) {
  return function getProfile() {
    return getProfileFromDb(sessionId);
  };
}
