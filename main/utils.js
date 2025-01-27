/**
 * Represents the state of CPU registers and flags.
 * @typedef {Object} RegistersState
 * @property {string} addr - The address to be passed to EIP
 * @property {string} inst - The value of the selected instruction.
 * @property {string} dst - The DST address 
 * @property {string} src - The SRC address
 * @property {Object} geral - General-purpose registers.
 * @property {string} geral.eax - The value of the EAX register.
 * @property {string} geral.ebx - The value of the EBX register.
 * @property {string} geral.ecx - The value of the ECX register.
 * @property {string} geral.edx - The value of the EDX register.
 * @property {Object} segmentos - Segment registers.
 * @property {string} segmentos.cs - The value of the CS register.
 * @property {string} segmentos.ss - The value of the SS register.
 * @property {string} segmentos.ds - The value of the DS register.
 * @property {string} segmentos.es - The value of the ES register.
 * @property {string} segmentos.fs - The value of the FS register.
 * @property {string} segmentos.gs - The value of the GS register.
 * @property {Object} offset - Offset registers.
 * @property {string} offset.eip - The value of the EIP register.
 * @property {string} offset.esp - The value of the ESP register.
 * @property {string} offset.edp - The value of the EDP register.
 * @property {string} offset.edi - The value of the EDI register.
 * @property {string} offset.esi - The value of the ESI register.
 * @property {string} flag - The value of the FLAG register.
 */

export class Utils {
    /**
     * Converte o valor para a base desejada
     * @param {string | number} num 
     * @param {number} radix 
     * @returns {string}
     */
    static str_to_radix(num, radix) { return (parseInt(num) >>> 0).toString(radix).padStart(radix == 2 ? 32 : 8, "0") }

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
                idx = flag.length - 1;
                break;
            case "PF": // PARITY The number of 1s in the least significant byte of the result is even.
                idx = flag.length - 1 - 2;
                break
            case "AF": // AUXILIARY CARRY Used for binary-coded decimal (BCD) arithmetic
                idx = flag.length - 1 - 4;
                break
            case "ZF": // ZERO The result of an operation is zero
                idx = flag.length - 1 - 6;
                break
            case "SF": // SIGN The result is negative
                idx = flag.length - 1 - 7;
                break
            case "OF": // OVERFLOW Indicates whether an arithmetic operation results in a signed overflow
                idx = flag.length - 1 - 11;
                break
            case "IOPL": // IO PRIVILEGE LEVEL Determines the privilege level of the current process
                idx = flag.length - 1 - 13; // 12 & 13
                break
            default:
                break;
        }

        return flag.substring(0, idx) + bitstate + flag.substring(idx + bitstate.length)
    }

    /**
     * retorna um objeto com os valores de cada registrador
     * @param {Document} document 
     * @returns {RegistersState}
     */
    static get_register_values(document) {
        const inst = document.getElementById("inst");

        return {
            addr: document.getElementById("addr").value,
            inst: inst.options[inst.selectedIndex].value,
            dst: document.getElementById("dst").value,
            src: document.getElementById("src").value,
            geral: {
                eax: document.getElementById("eax").value,
                ebx: document.getElementById("ebx").value,
                ecx: document.getElementById("ecx").value,
                edx: document.getElementById("edx").value,
            },
            segmentos: {
                cs: document.getElementById("cs").value,
                ss: document.getElementById("ss").value,
                ds: document.getElementById("ds").value,
                es: document.getElementById("es").value,
                fs: document.getElementById("fs").value,
                gs: document.getElementById("gs").value,
            },
            offset: {
                eip: document.getElementById("eip").value,
                esp: document.getElementById("esp").value,
                edp: document.getElementById("edp").value,
                edi: document.getElementById("edi").value,
                esi: document.getElementById("esi").value,
            },
            flag: document.getElementById("rflag").innerText,
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
        document.getElementById("cs").value = registers_state.segmentos.cs;
        document.getElementById("ss").value = registers_state.segmentos.ss;
        document.getElementById("ds").value = registers_state.segmentos.ds;
        document.getElementById("es").value = registers_state.segmentos.es;
        document.getElementById("fs").value = registers_state.segmentos.fs;
        document.getElementById("gs").value = registers_state.segmentos.gs;
        document.getElementById("eip").value = registers_state.offset.eip;
        document.getElementById("esp").value = registers_state.offset.esp;
        document.getElementById("edp").value = registers_state.offset.edp;
        document.getElementById("edi").value = registers_state.offset.edi;
        document.getElementById("esi").value = registers_state.offset.esi;
        document.getElementById("rflag").innerText = registers_state.flag;
    }
}