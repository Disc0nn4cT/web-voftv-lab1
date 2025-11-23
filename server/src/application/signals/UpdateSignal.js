// Створено на 4 лабі
export async function UpdateSignal(repo, { id, strength, hitPercent, payload }) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('invalid id');
  }

  const patch = {};

  if (strength !== undefined) {
    const n = Number(strength);
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      throw new Error('invalid strength');
    }
    patch.strength = n;
  }

  if (hitPercent !== undefined) {
    const n = Number(hitPercent);
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      throw new Error('invalid hitPercent');
    }
    patch.hit_percent = n;
  }

  if (payload !== undefined) {
    patch.payload = String(payload);
  }

  if (Object.keys(patch).length === 0) {
    throw new Error('no fields to update');
  }

  return await repo.update(numericId, patch);
}
