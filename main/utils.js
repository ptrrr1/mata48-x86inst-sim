/**
 * Represents the state of CPU registers and flags.
 * @typedef {Object} RegistersState
 * @property {string} inst - The value of the selected instruction.
 * @property {string} dst - The DST address 
 * @property {string} src - The SRC address
 * @property {Object} geral - General-purpose registers.
 * @property {string} geral.eax - The value of the EAX register.
 * @property {string} geral.ebx - The value of the EBX register.
 * @property {string} geral.ecx - The value of the ECX register.
 * @property {string} geral.edx - The value of the EDX register.
 * @property {Object} offset - Offset registers.
 * @property {string} offset.eip - The value of the EIP register.
 * @property {string} offset.esp - The value of the ESP register.
 * @property {string} offset.edp - The value of the EDP register.
 * @property {string} offset.edi - The value of the EDI register.
 * @property {string} offset.esi - The value of the ESI register.
 * @property {string} flag - The value of the FLAG register.
 * @property {object} sdt - Descriptor table
 * @property {string} sdt.base_cs
 * @property {string} sdt.limit_cs
 * @property {string} sdt.base_ss
 * @property {string} sdt.limit_ss
 * @property {string} sdt.base_ds
 * @property {string} sdt.limit_ds
 * @property {string} memdst
 * @property {string} memsrc
 */

export class Utils {
    /**
     * Converte o valor para a base desejada
     * @param {string | number} num 
     * @param {number} radix 
     * @param {number} size 
     * @returns {string}    
     */
    static num_to_radix(num, radix, size = 8) {
        const newVal =  (parseInt(num) >>> 0)
                            .toString(radix)
                            .padStart(size, "0")
        if (newVal.length == 8) { return newVal }
        else { return newVal.slice(newVal.length - 8, newVal.length) }
    }

    /**
     * Muda o respectivo bit flag para o desejado de acordo com o código
     * @param {string} flag 
     * @param {string} code 
     * @param {string} bitstate 
     * @returns {string}
     */
    static set_flag_bit(flag, code, bitstate) {
        let idx = -1;
        switch (code) {
            case "CF": // CARRY
                if (bitstate == "1") console.log("CF");
                idx = flag.length - 1;
                break;
            case "PF": // PARITY The number of 1s in the least significant byte of the result is even.
                if (bitstate == "1") console.log("PF");
                idx = flag.length - 1 - 2;
                break
            case "ZF": // ZERO The result of an operation is zero
                if (bitstate == "1") console.log("ZF");
                idx = flag.length - 1 - 6;
                break
            case "SF": // SIGN The result is negative
                if (bitstate == "1") console.log("SF");
                idx = flag.length - 1 - 7;
                break
            case "OF": // OVERFLOW Indicates whether an arithmetic operation results in a signed overflow
                if (bitstate == "1") console.log("OF");
                idx = flag.length - 1 - 11;
                break
            default:
                break;
        }

        return flag.substring(0, idx) + bitstate + flag.substring(idx + bitstate.length)
    }

    /**
     * 
     * @param {number} val 
     * @returns {string}
     */
    static eval_flag(val) {
        let newFlag = "00000000000000000011000000000010";
        newFlag = Utils.set_flag_bit(newFlag, "OF", HexOperations.is_overflow(val));
        newFlag = Utils.set_flag_bit(newFlag, "SF", HexOperations.is_neg(val));
        newFlag = Utils.set_flag_bit(newFlag, "ZF", HexOperations.is_zero(val));
        newFlag = Utils.set_flag_bit(newFlag, "PF", HexOperations.parity_check(val));
        return newFlag;
    }

    /**
     * retorna um objeto com os valores de cada registrador
     * @param {Document} document 
     * @returns {RegistersState}
     */
    static get_register_values(document) {
        const inst = document.getElementById("inst");

        return {
            inst: inst.options[inst.selectedIndex].value,
            dst: document.getElementById("dst").value,
            src: document.getElementById("src").value,
            geral: {
                eax: document.getElementById("eax").value,
                ebx: document.getElementById("ebx").value,
                ecx: document.getElementById("ecx").value,
                edx: document.getElementById("edx").value,
            },
            offset: {
                eip: document.getElementById("eip").value,
                esp: document.getElementById("esp").value,
                edp: document.getElementById("edp").value,
                edi: document.getElementById("edi").value,
                esi: document.getElementById("esi").value,
            },
            flag: document.getElementById("rflag").innerText,
            sdt: {
                base_cs: document.getElementById("base-cs").value,
                limit_cs: document.getElementById("limit-cs").value,
                base_ss: document.getElementById("base-ss").value,
                limit_ss: document.getElementById("limit-ss").value,
                base_ds: document.getElementById("base-ds").value,
                limit_ds: document.getElementById("limit-ds").value,
            },
            memdst: document.getElementById("memdst").value,
            memsrc: document.getElementById("memsrc").value
        }
    }

    /**
     * Atualiza o estado de todos os registradores
     * @param {Document} document 
     * @param {RegistersState} registers_state 
     */
    static set_register_values(document, registers_state) {
        document.getElementById("eax").value = registers_state.geral.eax;
        document.getElementById("ebx").value = registers_state.geral.ebx;
        document.getElementById("ecx").value = registers_state.geral.ecx;
        document.getElementById("edx").value = registers_state.geral.edx;
        document.getElementById("eip").value = registers_state.offset.eip;
        document.getElementById("esp").value = registers_state.offset.esp;
        document.getElementById("edp").value = registers_state.offset.edp;
        document.getElementById("edi").value = registers_state.offset.edi;
        document.getElementById("esi").value = registers_state.offset.esi;
        document.getElementById("rflag").innerText = registers_state.flag;
        document.getElementById("memdst").value = registers_state.memdst;
        document.getElementById("memsrc").value = registers_state.memsrc;
    }
}

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

    /**
     * @param {number} val 
     * @returns {string} "1" | "0"
     */
    static is_overflow(val) {
        return val > 0xFFFFFFFF ? "1" : "0"
    }

    /**
     * @param {number} val 
     * @returns {string} "1" | "0"
     */
    static parity_check(val) {
        let s = 0;
        while (val > 0) {
            val &= val - 1;
            s++;
        }

        return s % 2 == 0 ? "1" : "0"
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

    /**
     * @param {string} a 
     * @param {number} b 
     * @param {number} radix 
     * @returns 
     */
    static mul(a, b, radix) {
        const val = parseInt(a, radix);
        return val * b
    }

    /**
     * @param {string} a 
     * @param {number} radix 
     * @returns 
     */
    static neg(a, radix) {
        const val = parseInt(a, radix);
        return 0 - val;
    }

    /**
     * @param {string} a 
     * @param {number} b 
     * @param {number} radix 
     * @returns 
     */
    static and(a, b, radix) {
        const val = parseInt(a, radix);
        return val & b;
    }

    /**
     * @param {string} a 
     * @param {number} b 
     * @param {number} radix 
     * @returns 
     */
    static or(a, b, radix) {
        const val = parseInt(a, radix);
        return val | b;
    }

    /**
     * @param {string} a 
     * @param {number} radix 
     * @returns 
     */
    static not(a, radix) {
        const val = parseInt(a, radix);
        return ~val;
    }

    /**
     * @param {string} a 
     * @param {number} b 
     * @param {number} radix 
     * @returns 
     */
    static xor(a, b, radix) {
        const val = parseInt(a, radix);
        return val ^ b;
    }
}