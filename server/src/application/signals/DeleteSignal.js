// Створено на 4 лабі
export async function DeleteSignal(repo, { id }) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('invalid id');
  }
  return await repo.delete(numericId);
}
