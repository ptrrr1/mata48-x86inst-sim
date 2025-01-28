export class HexOperations {
    /**
     * @param {number} val 
     * @returns {string} "1" | "0"
     */
    static is_zero(val) {
        return val == 0 || val == 4294967296 ? "1" : "0"
    }

    /**
     * @param {number} val 
     * @returns {string} "1" | "0"
     */
    static is_neg(val) {
        return val < 0 ? "1" : "0"
    }

    static is_overflow(val) {
        return val > 0xFFFFFFFF ? "1" : "0"
    }

    /**
     * @param {string} a 
     * @param {number} b 
     * @param {number} radix 
     * @returns 
     */
    static add(a, b, radix) {
        const val = parseInt(a, radix);
        return val + b
    }

    /**
     * @param {string} a 
     * @param {number} b 
     * @param {number} radix 
     * @returns 
     */
    static sub(a, b, radix) {
        const val = parseInt(a, radix);
        return val - b
    }
}