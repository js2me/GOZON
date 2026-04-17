import type { ProfileDC } from '../../shared/api/api';
import { app } from '../app';

const profileBySessionId = new Map<string, ProfileDC>();

export async function getProfileFromDb(sessionId: string): Promise<ProfileDC> {
  const cachedProfile = profileBySessionId.get(sessionId);
  if (cachedProfile) {
    return cachedProfile;
  }

  const sex = app.faker.person.sexType();
  const dateBirth = app.faker.date.birthdate({
    min: 18,
    max: 65,
    mode: 'age',
  });

  const profile: ProfileDC = {
    firstName: app.faker.person.firstName(sex),
    lastName: app.faker.person.lastName(sex),
    dateBirth: dateBirth.toISOString().slice(0, 10),
    male: sex === 'male',
  };

  profileBySessionId.set(sessionId, profile);
  return profile;
}
