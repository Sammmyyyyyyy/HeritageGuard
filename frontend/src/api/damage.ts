import { analyzeDamage as analyzeDamageSite } from './sites';

export async function analyzeDamage(
  siteId: string,
  image: File
) {
  return analyzeDamageSite(siteId, image);
}