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
 * @property {string} offset.ebp - The value of the ESP register.
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
 * @property {string} stacktop
 */

/**
 * @typedef {Object} Diagram
 * @property {Array<Square>} squares
 * @property {Array<Arrow>} arrows
 */

/**
 * @typedef {Object} Square
 * @property {number} w -- width
 * @property {number} h -- height
 * @property {string} text
 */

/**
 * @typedef {Object} Arrow
 * @property {string} text
 * @property {boolean} draw
 * @property {string | undefined} color
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
                ebp: document.getElementById("ebp").value,
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
            memsrc: document.getElementById("memsrc").value,
            stacktop: document.getElementById("top").value
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
        document.getElementById("ebp").value = registers_state.offset.ebp;
        document.getElementById("edp").value = registers_state.offset.edp;
        document.getElementById("edi").value = registers_state.offset.edi;
        document.getElementById("esi").value = registers_state.offset.esi;
        document.getElementById("rflag").innerText = registers_state.flag;
        document.getElementById("memdst").value = registers_state.memdst;
        document.getElementById("memsrc").value = registers_state.memsrc;
        document.getElementById("top").value = registers_state.stacktop;
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

export class CanvasUtils {
    static CENTER_W;
    static CENTER_H;
    static RIGHT;
    static BOTTOM;

    /**
     * 
     * @param {Document} document 
     */
    constructor(document) {
        const steps = document.getElementById("steps");
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = steps.clientWidth;
        this.canvas.height = steps.clientHeight;
        this.w = steps.clientWidth;
        this.h = steps.clientHeight;
        this.CENTER_W = this.w / 2;
        this.CENTER_H = this.h / 2;
        this.RIGHT = this.w;
        this.BOTTOM = this.h;
    }

    drawSquare(x, y, w, h, color = "#000000", from_center = true) {
        this.ctx.fillStyle = color;
        if (from_center) {
            this.ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        } else {
            this.ctx.strokeRect(x, y, w, h);
        }
    }

    drawSquareTxt(x, y, w, h, text, color = "#000000", from_center = true) {
        this.drawSquare(x, y, w, h, color, from_center);

         // Draw the text
        this.ctx.fillStyle = color;
        this.ctx.font = "20px Arial"; // Customize font size and family
        this.ctx.textAlign = "center"; // Center text horizontally
        this.ctx.textBaseline = "middle"; // Center text vertically

        // Calculate text position
        const textX = from_center ? x : x + w / 2;
        const textY = from_center ? y : y + h / 2;

        this.ctx.fillText(text, textX, textY);
    }

    drawLine(x1, y1, x2, y2, color = "#000000", lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }

    drawArrow(x1, y1, x2, y2, color = "#000000", lineWidth = 1, arrowSize = 10) {
        // Draw the line
        this.drawLine(x1, y1, x2, y2, color, lineWidth);
      
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1);
      
        // Draw the arrowhead
        this.ctx.save(); // Save the current context state
        this.ctx.translate(x2, y2); // Move to the end of the line
        this.ctx.rotate(angle); // Rotate to the angle of the line
        this.ctx.fillStyle = color;
      
        // Draw the arrowhead as a triangle
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-arrowSize, arrowSize / 2);
        this.ctx.lineTo(-arrowSize, -arrowSize / 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore(); // Restore the context state
    }

    drawArrowTxt(x1, y1, x2, y2, text, color = "#000000", lineWidth = 1, arrowSize = 10, textOffset = 15) {
        this.drawArrow(x1, y1, x2, y2, color, lineWidth, arrowSize);

        // Draw the text above the arrow
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = "16px Arial"; // Customize font size and family
        this.ctx.textAlign = "center"; // Center text horizontally
        this.ctx.textBaseline = "middle"; // Center text vertically

        // Calculate text position (above the midpoint of the arrow)
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        this.ctx.translate(midX, midY);
        if (x2 > x1) this.ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
        else this.ctx.rotate(Math.atan2(y2 - y1, x1 - x2));

        this.ctx.fillText(text, 0, -textOffset);

        // Restore the context to its original state
        this.ctx.restore();
    }

    drawText(x1, y1, x2, y2, text, color = "#000000", textOffset = 0) {
        // Draw the text above the arrow
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = "16px Arial"; // Customize font size and family
        this.ctx.textAlign = "center"; // Center text horizontally
        this.ctx.textBaseline = "middle"; // Center text vertically

        // Calculate text position (above the midpoint of the arrow)
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        this.ctx.translate(midX, midY);
        if (x2 > x1) this.ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
        else this.ctx.rotate(Math.atan2(y2 - y1, x1 - x2));

        this.ctx.fillText(text, 0, -textOffset);

        // Restore the context to its original state
        this.ctx.restore();
    }
    
    /**
     * @param {Diagram} objs 
     * @param {number} padding
     */
    drawDiagram(objs, padding = 10) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clearing
        this.drawDiagramSquares(objs.squares, padding);
        this.drawDiagramArrows(objs.arrows, objs.squares, padding);
    }

    /**
     * @param {Array<Square>} sq
     * @param {number} padding
     */
    drawDiagramSquares(sq, padding) {
        for (let i = 0; i < sq.length; i++) {
            /* const factor = (i % 2 == 0) ? -1 : 1; */
            const x = padding + i * this.CENTER_H; /* this.CENTER_H + factor * this.CENTER_H / 2; */
            const midx = x + sq[i].w / 2;
            const y1 = padding;
            const y2 = this.BOTTOM - sq[i].h - padding;
            this.drawSquareTxt(
                x, 
                y1, 
                sq[i].w, 
                sq[i].h, 
                sq[i].text,
                "#000",
                false
            ) // TOP
            this.drawSquareTxt(
                x, 
                y2, 
                sq[i].w, 
                sq[i].h,
                sq[i].text,
                "#000",
                false
            ) // BOTTOM
            this.drawLine(midx, y1 + sq[i].h, midx, y2)
        }
    }

    /**
     * @param {Array<Arrow>} ar
     * @param {Array<Square>} sq
     * @param {number} padding 
     */
    drawDiagramArrows(ar, sq, padding) {
        const leftx = padding + sq[0].w / 2; /* this.CENTER_H - this.CENTER_H / 2 + sq[0].w / 2; */
        const rightx = padding + sq[1].w / 2 + this.CENTER_H; /* this.CENTER_H + this.CENTER_H / 2 + sq[1].w / 2; */
        const starty = 3 * padding + sq[0].h;
        const endy = this.BOTTOM - padding - sq[0].h
        const len = (endy - starty) / ar.length;
        for (let i = 0; i < ar.length; i++) {
            const y = starty + len * i;
            if (ar[i].draw) {
                if (i % 2 == 0) {
                    this.drawArrowTxt(leftx, y, rightx, y, ar[i].text);
                } else {
                    this.drawArrowTxt(rightx, y, leftx, y, ar[i].text);
                }
            } else {
                this.drawText(leftx, y, rightx, y, ar[i].text, ar[i].color ? ar[i].color : "#000")
            }
        }
    }
}