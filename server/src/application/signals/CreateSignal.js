import { Signal } from '../../domain/signals/Signal.js';

// легка бізнес-логіка генерації сили сигналу
function randomStrength(az, _el) {
  const bias = 100 - Math.abs(180 - az) / 2;        // трохи сильніше біля 180°
  const base = Math.floor(Math.random() * 40) + 30; // 30..69
  return Math.max(0, Math.min(100, Math.floor((base + bias) / 2)));
}

export async function CreateSignal(repo, { az, el }) {
  const strength = randomStrength(az, el);
  const hitPercent = strength; // поки що == strength
  const payload = `SIG-${az}-${el}-${strength}`;
  const sig = new Signal({ az, el, strength, hitPercent, payload });
  return await repo.create(sig);
}
