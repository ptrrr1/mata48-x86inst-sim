import { Utils, HexOperations, CanvasUtils } from "./utils.js";

const objs = {
    squares: [
        { w: 75, h: 50, text: "CPU" },
        { w: 75, h: 50, text: "MEM" },
    ],
    arrows: []
}

// Starting canvas
let canvas = new CanvasUtils(document);

// destiny and source segments
const dst = document.getElementById("dst");
const src = document.getElementById("src");

// Updating pointers based on limit of stack segment
const basess = document.getElementById("base-ss");
const limss = document.getElementById("limit-ss");

basess.addEventListener("change", updatePointer);
limss.addEventListener("change", updatePointer);

// Update ui for instruction
const select = document.getElementById("inst");
select.addEventListener("change", (e) => {
    const registerValues = Utils.get_register_values(document);

    switch (registerValues.inst) {
        case "push":
            dst.disabled = true;
            src.disabled = false;
            break;
        case "pop":
            dst.disabled = false;
            src.disabled = true;
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

// execute instruction
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
            } else if (regdst.length != 3 && regsrc.length == 3) {
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    memdst: registerValues.geral[regsrc]
                });
            } else if (regdst.length == 3 && regsrc.length != 3) {
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: registerValues.memsrc
                    },
                });
            }
            break;
        case "push":
            const src = registerValues.geral[regsrc] !== undefined ? registerValues.geral[regsrc] : registerValues.memsrc;
            const esp = HexOperations.sub(registerValues.offset.esp, 4, 16);
            const besp = HexOperations.add(registerValues.sdt.base_ss, esp, 16);

            if (besp < parseInt(registerValues.sdt.base_ss, 16)) {
                console.error("GPF");
            } else {
                Utils.set_register_values(document, {
                    ...registerValues,
                    offset: {
                        ...registerValues.offset,
                        esp: Utils.num_to_radix(esp, 16)
                    },
                    stacktop: src
                })
            }
            break;
        case "pop":
            const dst = registerValues.geral[regdst] !== undefined ? registerValues.geral[regdst] : registerValues.memdst;  
            const top = registerValues.stacktop;

            const esp1 = HexOperations.add(registerValues.offset.esp, 4, 16);
            const besp1 = HexOperations.add(registerValues.sdt.base_ss, esp1, 16);

            if (besp1 > parseInt(registerValues.sdt.limit_ss, 16)) {
                console.error("GPF");
            } else {
                if (registerValues.geral[regdst] !== undefined) {
                    Utils.set_register_values(document, {
                        ...registerValues,
                        geral: {
                            ...registerValues.geral,
                            [dst]: top
                        },
                        offset: {
                            ...registerValues.offset,
                            esp: Utils.num_to_radix(esp1, 16)
                        },
                    });
                } else {
                    Utils.set_register_values(document, {
                        ...registerValues,
                        offset: {
                            ...registerValues.offset,
                            esp: Utils.num_to_radix(esp1, 16)
                        },
                        memdst: top
                    });
                }
            }
            break;
        case "xchg":
            if (regdst.length == 3 && regsrc.length == 3) {
                // Set new values
                const v = registerValues.geral[regsrc]
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regsrc]: registerValues.geral[regdst],
                        [regdst]: v
                    },
                });
            } else if (regdst.length != 3 && regsrc.length == 3) {
                // Set new values
                const v = registerValues.geral[regsrc]
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regsrc]: registerValues.memdst,
                    },
                    memdst: v
                });
            } else if (regdst.length == 3 && regsrc.length != 3) {
                // Set new values
                const v = registerValues.geral[regdst]
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: registerValues.memsrc,
                    },
                    memsrc: v
                });
            }
            break;
        case "add":
            operationsAbstraction(regsrc, regdst, registerValues, HexOperations.add);
            break;
        case "sub":
            operationsAbstraction(regsrc, regdst, registerValues, HexOperations.sub);
            break;
        case "mul":
            operationsAbstraction(regsrc, "eax", registerValues, HexOperations.mul);
            break;
        case "inc":
            operationsAbstraction(1, regdst, registerValues, HexOperations.add);
            break;
        case "dec":
            operationsAbstraction(1, regdst, registerValues, HexOperations.sub);
            break;
        case "neg":
            operationsAbstraction(undefined, regdst, registerValues, HexOperations.neg);
            break;
        case "and":
            operationsAbstraction(regsrc, regdst, registerValues, HexOperations.and);
            break;
        case "or":
            operationsAbstraction(regsrc, regdst, registerValues, HexOperations.or);
            break;
        case "xor":
            operationsAbstraction(regsrc, regdst, registerValues, HexOperations.xor);
            break;
        case "not":
            operationsAbstraction(undefined, regdst, registerValues, HexOperations.not);
            break;
        case "cmp":
            const d = registerValues.geral[regdst] !== undefined ? registerValues.geral[regdst] : registerValues.memdst;
            const s = registerValues.geral[regsrc] !== undefined ? registerValues.geral[regsrc] : registerValues.memsrc;

            const v = parseInt(s, 16);
            const newVal = HexOperations.sub(d, v, 16);
            console.log(newVal)
            // new Flag
            let newFlag = Utils.eval_flag(newVal);
            // Set new values
            Utils.set_register_values(document, {
                ...registerValues,
                flag: newFlag
            });
            break;
        case "jmp":
            if (regdst.length == 3) {
                const v = parseInt(registerValues.geral[regdst], 16);
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
            } else {
                const limit = parseInt(registerValues.sdt.limit_cs, 16);
                const limitds = parseInt(registerValues.sdt.limit_ds, 16);
                // Step 1
                const starteip = registerValues.offset.eip;
                objs.arrows.push({text: `Checar se ${registerValues.sdt.base_cs} + ${starteip.toUpperCase()} <= ${registerValues.sdt.limit_cs}`, draw: false, color: "#ff0000"});
                const seipcs = HexOperations.add(registerValues.sdt.base_cs, parseInt(starteip, 16), 16);
                let isgpf1 = false;
                if (seipcs >= limit) {
                    objs.arrows.push({text: "GPF Neste caso, Excede Código", draw: false, color: "#ff0000"});
                    console.error("GPF");
                    isgpf1 = true; 
                } else {
                    objs.arrows.push({text: `${Utils.num_to_radix(seipcs, 16).toUpperCase()} < ${registerValues.sdt.limit_cs}`, draw: false, color: "#005500"});
                    objs.arrows.push({text: "Buscar Instrução pelo Endereço Calculado", draw: true});
                    objs.arrows.push({text: `Retorna JMP & INC EIP ${starteip.toUpperCase()} -> ${Utils.num_to_radix(HexOperations.add(starteip, 4, 16), 16).toUpperCase()}`, draw: true});
                }
                // Step 2
                const nexteip = HexOperations.add(starteip, 4, 16);
                objs.arrows.push({text: `Checar se ${registerValues.sdt.base_cs} + ${Utils.num_to_radix(nexteip, 16).toUpperCase()} <= ${registerValues.sdt.limit_cs}`, draw: false, color: "#ff0000"});
                const neipcs = HexOperations.add(registerValues.sdt.base_cs, nexteip, 16);
                let isgpf2 = false;
                if (neipcs >= limit & !isgpf1) {
                    objs.arrows.push({text: "GPF Neste caso, Excede Código", draw: false, color: "#ff0000"});
                    console.error("GPF");
                    isgpf1 = true;
                } else if (!isgpf1) {
                    objs.arrows.push({text: `${Utils.num_to_radix(neipcs, 16).toUpperCase()} < ${registerValues.sdt.limit_cs}`, draw: false, color: "#005500"});
                    objs.arrows.push({text: "Buscar Endereço Calculado", draw: true});
                    objs.arrows.push({text: `Retorna ${registerValues.memdst.toUpperCase()} & INC EIP ${Utils.num_to_radix(nexteip, 16).toUpperCase()} -> ${Utils.num_to_radix(HexOperations.add(Utils.num_to_radix(nexteip, 16), 4, 16), 16).toUpperCase()}`, draw: true});
                }

                // Step 3
                objs.arrows.push({text: `Checar se ${registerValues.sdt.base_ds} + ${registerValues.memdst.toUpperCase()} <= ${registerValues.sdt.limit_ds}`, draw: false, color: "#ff0000"});
                const dataaddr = HexOperations.add(registerValues.sdt.base_ds, parseInt(registerValues.memdst, 16), 16);
                let isgpf3 = false;
                if (dataaddr >= limitds & !isgpf1 & !isgpf2) {
                    objs.arrows.push({text: "GPF Neste caso, Excede Dados", draw: false, color: "#ff0000"});
                    console.error("GPF");
                    isgpf1 = true;
                } else if (!isgpf1 & !isgpf2) {
                    objs.arrows.push({text: `${Utils.num_to_radix(dataaddr, 16).toUpperCase()} < ${registerValues.sdt.limit_ds}`, draw: false, color: "#005500"});
                    objs.arrows.push({text: "Buscar Endereço Calculado", draw: true});
                    objs.arrows.push({text: `Retorna ${registerValues.memdst}`, draw: true});
                }

                // Step 4
                const v = parseInt(registerValues.memdst, 16);
                const newVal = HexOperations.add(registerValues.sdt.base_cs, v, 16);
                let isgpf4 = false;
                if (newVal >= limit & !isgpf1 & !isgpf2 & !isgpf3) {
                    objs.arrows.push({text: "GPF Neste caso, Excede Código", draw: false, color: "#ff0000"});
                    console.error("GPF");
                    isgpf4 = true;
                } else if (!isgpf1 & !isgpf2 & !isgpf3) {
                    objs.arrows.push({text: `Atualiza EIP para ${registerValues.memdst}`, draw: false});
                }

                if (!(isgpf1 || isgpf2 || isgpf3 || isgpf4)) {
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
    };

    canvas.drawDiagram(objs);
    objs.arrows = [];
})

/**
 * Abstraction of instructions to avoid repeating
 * @param {PropertyKey} src 
 * @param {PropertyKey} dst 
 * @param {import("./utils.js").RegistersState} r - RegisterValues 
 * @param {CallableFunction} func 
 */
function operationsAbstraction(src, dst, r, func) {
    const d = r.geral[dst] !== undefined ? r.geral[dst] : r.memdst;
    const s = r.geral[src] !== undefined ? r.geral[src] : r.memsrc;

    const v = parseInt(s, 16);
    let n;
    if (src === undefined) {
        n = func(d, 16);
    } else {
        n = func(d, Number.isInteger(src) ? src : v, 16);
    }
    // new Flag
    let nF = Utils.eval_flag(n);
    // Set new values
    if (r.geral[dst] !== undefined) {
        Utils.set_register_values(document, {
            ...r,
            geral: {
                ...r.geral,
                [dst]: Utils.num_to_radix(n, 16)
            },
            flag: nF
        });
    } else {
        Utils.set_register_values(document, {
            ...r,
            flag: nF,
            memdst: Utils.num_to_radix(n, 16)
        });
    }
}

/**
 * ESP and EBP updater
 */
function updatePointer() {
    const r = Utils.get_register_values(document);
    const b = parseInt(basess.value, 16);
    const l = parseInt(limss.value, 16);
    const v = Utils.num_to_radix(l - b, 16);
    Utils.set_register_values(document, {
        ...r,
        offset: {
            ...r.offset,
            esp: v,
            ebp: v
        }
    })
}