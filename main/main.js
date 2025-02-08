import { Utils, HexOperations } from "./utils.js";

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
    const regdst = registerValues.dst;
    const regsrc = registerValues.src;

    switch (registerValues.inst) {
        case "move":
            if (regdst.length == 3 && regsrc.length == 3) {
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: registerValues.geral[regsrc]
                    },
                });
            }
            break;
        case "push":

            break;
        case "pop":

            break;
        case "xchg":

            break;
        case "add":
            if (regdst.length == 3 && regsrc.length == 3) {
                const v = parseInt(registerValues.geral[regsrc], 16);
                const newVal = HexOperations.add(registerValues.geral[regdst], v, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "sub":
            if (regdst.length == 3 && regsrc.length == 3) {
                const v = parseInt(registerValues.geral[regsrc], 16);
                const newVal = HexOperations.sub(registerValues.geral[regdst], v, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "mul":
            if (regsrc.length == 3) {
                const v = parseInt(registerValues.geral.eax, 16);
                const newVal = HexOperations.mul(registerValues.geral[regsrc], v, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        eax: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "inc":
            if (regdst.length == 3) {
                const newVal = HexOperations.add(registerValues.geral[regdst], 1, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "dec":
            if (regdst.length == 3) {
                const newVal = HexOperations.sub(registerValues.geral[regdst], 1, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "neg":
            if (regdst.length == 3) {
                const newVal = HexOperations.neg(registerValues.geral[regdst], 16);
                console.log(newVal)
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "and":
            if (regdst.length == 3 && regsrc.length == 3) {
                const v = parseInt(registerValues.geral[regsrc], 16);
                const newVal = HexOperations.and(registerValues.geral[regdst], v, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "or":
            if (regdst.length == 3 && regsrc.length == 3) {
                const v = parseInt(registerValues.geral[regsrc], 16);
                const newVal = HexOperations.or(registerValues.geral[regdst], v, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "xor":
            if (regdst.length == 3 && regsrc.length == 3) {
                const v = parseInt(registerValues.geral[regsrc], 16);
                const newVal = HexOperations.xor(registerValues.geral[regdst], v, 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "not":
            if (regdst.length == 3) {
                const newVal = HexOperations.not(registerValues.geral[regdst], 16);
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: Utils.num_to_radix(newVal, 16)
                    },
                    flag: newFlag
                });
            }
            break;
        case "cmp":
            if (regdst.length == 3 && regsrc.length == 3) {
                const v = parseInt(registerValues.geral[regsrc], 16);
                const newVal = HexOperations.sub(registerValues.geral[regdst], v, 16);
                console.log(newVal < 0)
                // new Flag
                let newFlag = Utils.eval_flag(newVal);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    flag: newFlag
                });
            }
            break;
        case "jmp":
            if (regdst.length == 3) {

            } else {
                const v = parseInt(regdst, 16);
                const newVal = HexOperations.add(registerValues.sdt.base_cs, v, 16);
                const limit = parseInt(registerValues.sdt.limit_cs, 16);
                if (newVal > limit) {
                    console.error("GPF");
                } else {
                    // Set new values
                    Utils.set_register_values(document, {
                        ...registerValues,
                        offset: {
                            ...registerValues.offset,
                            eip: Utils.num_to_radix(v, 16)
                        },
                    });
                }
            }
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