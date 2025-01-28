import { Utils } from "./utils.js";
import { HexOperations } from "./hexUtils.js";

const dst = document.getElementById("dst");
const src = document.getElementById("src");

const select = document.getElementById("inst");
select.addEventListener("change", (e) => {
    const registerValues = Utils.get_register_values(document);

    switch (registerValues.inst) {
        case "push":
            dst.disabled = true;
            src.disabled = false;
            break;
        case "pop":
            dst.disabled = true;
            src.disabled = false;
            break;
        case "mul":
            dst.disabled = true;
            src.disabled = false;
            break;
        case "inc":
            dst.disabled = false;
            src.disabled = true;
            break;
        case "dec":
            dst.disabled = false;
            src.disabled = true;
            break;
        case "neg":
            dst.disabled = false;
            src.disabled = true;
            break;
        case "not":
            dst.disabled = false;
            src.disabled = true;
            break;
        case "jmp":
            dst.disabled = false;
            src.disabled = true;
            break;
        case "call":
            dst.disabled = false;
            src.disabled = true;
            break;
        default:
            src.disabled = false;
            dst.disabled = false;
            break;
    }
})

const button = document.getElementById("exec");
button.addEventListener("click", (e) => {
    const registerValues = Utils.get_register_values(document);
    const reg = registerValues.dst;

    switch (registerValues.inst) {
        case "move":

            break;
        case "push":

            break;
        case "pop":

            break;
        case "xchg":

            break;
        case "add":

            break;
        case "sub":

            break;
        case "mul":

            break;
        case "inc":
            if (reg.length == 3) {
                const newVal = HexOperations.add(registerValues.geral[reg], 1, 16);
                // new Flag
                let newFlag = registerValues.flag;
                newFlag = Utils.set_flag_bit(newFlag, "OF", HexOperations.is_overflow(newVal));
                newFlag = Utils.set_flag_bit(newFlag, "ZF", HexOperations.is_neg(newVal));
                newFlag = Utils.set_flag_bit(newFlag, "SF", HexOperations.is_zero(newVal));
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [reg]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "dec":
            if (reg.length == 3) {
                const newVal = HexOperations.sub(registerValues.geral[reg], 1, 16);
                // new Flag
                let newFlag = registerValues.flag;
                newFlag = Utils.set_flag_bit(newFlag, "ZF", HexOperations.is_neg(newVal));
                newFlag = Utils.set_flag_bit(newFlag, "SF", HexOperations.is_zero(newVal));
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [reg]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "neg":

            break;
        case "and":

            break;
        case "or":

            break;
        case "xor":

            break;
        case "not":

            break;
        case "cmp":

            break;
        case "jmp":

            break;
        case "jxx":

            break;
        case "call":

            break;
        case "ret":

            break;
        case "iret":

            break;
        case "loopxx":

            break;
    }
})