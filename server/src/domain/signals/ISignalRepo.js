// Інтерфейс репозиторію (документаційний у JS)
// було оновлено на лабі 4
export class ISignalRepo {
  async create(signal)           { throw new Error('not implemented'); }
  async findRecent(limit = 50)   { throw new Error('not implemented'); }
  async findById(id)             { throw new Error('not implemented'); }
  async update(id, patch)        { throw new Error('not implemented'); }
  async delete(id)               { throw new Error('not implemented'); }
}