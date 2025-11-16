
// Доменна сутність + проста валідація
export class Signal {
  constructor({ id=null, az, el, strength, hitPercent, payload, createdAt=new Date().toISOString() }) {
    if (!Number.isInteger(az) || az < 0 || az > 359) throw new Error('az out of range');
    if (!Number.isInteger(el) || el < 0 || el > 90)    throw new Error('el out of range');
    this.id = id;
    this.az = az;
    this.el = el;
    this.strength = strength;
    this.hit_percent = hitPercent;
    this.payload = payload;
    this.created_at = createdAt;
  }
}
