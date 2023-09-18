"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BitField {
    constructor(bits = 0n) {
        this.bitfield = 0n;
        this.bitfield = this.constructor.resolve(bits);
    }
    get defaultBit() {
        return 0n;
    }
    any(bit) {
        return (this.bitfield & this.constructor.resolve(bit)) !== this.defaultBit;
    }
    equals(bit) {
        return this.bitfield === this.constructor.resolve(bit);
    }
    has(bit) {
        if (Array.isArray(bit))
            return bit.every((p) => this.has(p));
        bit = this.constructor.resolve(bit);
        return (this.bitfield & bit) === bit;
    }
    missing(bits) {
        const bitsArray = new this.constructor(bits).toArray();
        return bitsArray.filter((p) => !this.has(p));
    }
    serialize() {
        const serialized = {};
        for (const [flag, bit] of Object.entries(this.constructor.FLAGS))
            serialized[flag] = this.has(bit);
        return serialized;
    }
    toArray() {
        return Object.keys(this.constructor.FLAGS).filter((bit) => this.has(bit));
    }
    toString() {
        return `[${this.constructor.name} ${this.bitfield}]`;
    }
    toJSON() {
        return this.bitfield.toString();
    }
    valueOf() {
        return this.bitfield;
    }
    *[Symbol.iterator]() {
        yield* this.toArray();
    }
    static resolve(bit) {
        if (typeof bit === 'undefined')
            return 0n;
        if (typeof bit === 'bigint' && bit >= 0n)
            return bit;
        if (bit instanceof BitField)
            return bit.bitfield;
        if (Array.isArray(bit))
            return bit.map((p) => this.resolve(p)).reduce((prev, p) => prev | p, 0n);
        if (typeof bit === 'string' && typeof this.FLAGS[bit] !== 'undefined')
            return this.FLAGS[bit];
        throw new RangeError('BITFIELD_INVALID');
    }
}
BitField.FLAGS = {};
exports.default = BitField;
//# sourceMappingURL=bitfield.js.map