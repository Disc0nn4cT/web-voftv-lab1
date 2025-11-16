export async function GetSignals(repo, { limit = 50 } = {}) {
  return await repo.findRecent(limit);
}
