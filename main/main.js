import { Utils, HexOperations, CanvasUtils } from "./utils.js";

const objs = {
    squares: [
        { w: 75, h: 50, text: "CPU" },
        { w: 75, h: 50, text: "MEM" },
    ],
    arrows: []
}

// Starting canvas
let canvas = new CanvasUtils(document, objs);

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
    // I/O
    const regdst = registerValues.dst;
    const regsrc = registerValues.src;
    // base
    const basecs = parseInt(registerValues.sdt.base_cs, 16);
    const baseds = parseInt(registerValues.sdt.base_ds, 16);
    const basess = parseInt(registerValues.sdt.base_ss, 16);
    // Limits
    const limitcs = parseInt(registerValues.sdt.limit_cs, 16);
    const limitds = parseInt(registerValues.sdt.limit_ds, 16);
    const limitss = parseInt(registerValues.sdt.limit_ss, 16);

    switch (registerValues.inst) {
        case "move":
            if (regdst.length == 3 && regsrc.length == 3) {
                const [_, neip, nedi, nesi] = steps4_2(registerValues, false, false);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: registerValues.geral[regsrc]
                    },
                    offset: {
                        ...registerValues.offset,
                        eip: neip,
                        edi: nedi,
                        esi: nesi
                    }
                });
            } else if (regdst.length != 3 && regsrc.length == 3) {
                const [_, neip, nedi, nesi] = steps4_2(registerValues, false, true);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    memdst: registerValues.geral[regsrc],
                    offset: {
                        ...registerValues.offset,
                        eip: neip,
                        edi: nedi,
                        esi: nesi
                    }
                });
            } else if (regdst.length == 3 && regsrc.length != 3) {
                const [_, neip, nedi, nesi] = steps4_2(registerValues, true, false);
                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    geral: {
                        ...registerValues.geral,
                        [regdst]: registerValues.memsrc
                    },
                    offset: {
                        ...registerValues.offset,
                        eip: neip,
                        edi: nedi,
                        esi: nesi   
                    }
                });
            } else {
                const [_, neip, nedi, nesi] = steps4_2(registerValues, true, true);

                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    offset: {
                        ...registerValues.offset,
                        eip: neip,
                        edi: nedi,
                        esi: nesi
                    },
                    memdst: registerValues.memsrc
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
                        esp: Utils.num_to_radix(esp, 16),
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
                            esp: Utils.num_to_radix(esp1, 16),
                            eip: Utils.num_to_radix(HexOperations.add(registerValues.offset.eip, 4, 16), 16)
                        },
                    });
                } else {
                    Utils.set_register_values(document, {
                        ...registerValues,
                        offset: {
                            ...registerValues.offset,
                            esp: Utils.num_to_radix(esp1, 16),
                            eip: Utils.num_to_radix(HexOperations.add(registerValues.offset.eip, 4, 16), 16)
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
                    offset: {
                        ...registerValues.offset,
                        eip: Utils.num_to_radix(HexOperations.add(registerValues.offset.eip, 4, 16), 16)
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
                    offset: {
                        ...registerValues.offset,
                        eip: Utils.num_to_radix(HexOperations.add(registerValues.offset.eip, 4, 16), 16)
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
                const [isgpf, uptodatep] = basicSteps4reg(registerValues, "JMP", regdst);

                const v = parseInt(registerValues.geral[regdst], 16);
                const newVal = HexOperations.add(registerValues.sdt.base_cs, v, 16);
                let isgpf2 = false

                if (newVal >= limitcs & !isgpf) {
                    canvas.addArrow("GPF Neste caso, Excede Limite", false, "#ff0000");
                    console.error("GPF");
                    isgpf2 = true;
                } else if (!isgpf) {
                    canvas.addArrow(`Atualiza EIP para ${Utils.num_to_radix(v, 16)}`, false);
                }

                Utils.set_register_values(document, {
                    ...registerValues,
                    offset: {
                        ...registerValues.offset,
                        eip: (isgpf2) ? uptodatep : Utils.num_to_radix(v, 16)
                    },
                });

            } else {
                const [gpf, uptodateip, uptodatedp] = basicSteps4Mem(registerValues, "JMP");
                // Step 4 - Update according to instruction
                const v = parseInt(registerValues.memdst, 16);
                const newVal = HexOperations.add(registerValues.sdt.base_cs, v, 16);
                let isgpf4 = false;
                if (newVal >= limitcs & !gpf) {
                    canvas.addArrow("GPF Neste caso, Excede Código", false, "#ff0000");
                    console.error("GPF");
                    isgpf4 = true;
                } else if (!gpf) {
                    canvas.addArrow(`Atualiza EIP para ${registerValues.memdst}`, false);
                }

                const recentval = (isgpf4) ? uptodateip : Utils.num_to_radix(v, 16);

                // Set new values
                Utils.set_register_values(document, {
                    ...registerValues,
                    offset: {
                        ...registerValues.offset,
                        eip: recentval,
                        esi: uptodatedp,
                    },
                });

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
    let gpf, ip, edi, esi;

    const d = r.geral[dst] !== undefined ? r.geral[dst] : r.memdst;
    const s = r.geral[src] !== undefined ? r.geral[src] : r.memsrc;

    const v = parseInt(s, 16);
    let n;
    if (src === undefined) {
        n = func(d, 16);
        if (d === r.memdst) { [gpf, ip, edi] = steps4mem1(r); }
        else { [gpf, ip] = steps4reg1(r); }
    } else {
        n = func(d, Number.isInteger(src) ? src : v, 16);
        if (r.geral[src] === undefined && r.geral[dst] !== undefined) { [gpf, ip, edi, esi] = steps4_2(r, false, true); }
        else if (r.geral[src] !== undefined && r.geral[dst] === undefined) { [gpf, ip, edi, esi] = steps4_2(r, true, false); }
        else if (r.geral[src] !== undefined && r.geral[dst] !== undefined) { [gpf, ip, edi, esi] = steps4_2(r, false, false); }
        else if (r.geral[src] === undefined && r.geral[dst] === undefined) { [gpf, ip, edi, esi] = steps4_2(r, true, true); }
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
            offset: {
                ...r.offset,
                eip: ip,
                esi: (esi) ? esi : r.offset.esi
            },
            flag: nF
        });
    } else {
        Utils.set_register_values(document, {
            ...r,
            offset: {
                ...r.offset,
                eip: ip,
                edi: (edi) ? edi : r.offset.edi,
                esi: (esi) ? esi : r.offset.edi
            },
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

/**
 * @param {import("./utils.js").RegistersState} r
 * @param {string} inst
 * @param {boolean} ismem
 * @returns
 */
function basicSteps(r, inst, ismem, omit_second = false) {
    let uptodatep = r.offset.eip;
    let [isgpf1, isgpf2] = [false, false, false];
    let [nexteip, nexteip2] = ["", ""];
    // Step 1 - Get instruction
    [isgpf1, nexteip] = canvas.checkIfGpf(
                                    r.offset.eip,
                                    r.sdt.base_cs,
                                    r.sdt.limit_cs,
                                    inst
                                );
    if (!isgpf1) uptodatep = nexteip;
    // Step 2 - Get Mem
    if (omit_second) {
        if (!isgpf1) {
            [isgpf2, nexteip2] = canvas.checkIfGpf(
                                        nexteip,
                                        r.sdt.base_cs,
                                        r.sdt.limit_cs,
                                        (ismem) ? "Endereço" : "Registrador"
                                    );
        }
        if (!isgpf2) uptodatep = nexteip2;
    }

    return [(isgpf1 || isgpf2), uptodatep]
}

/**
 * @param {import("./utils.js").RegistersState} r
 * @param {string} inst
 */
function basicSteps4Mem(r, inst) {
    const [isgpf12, uptodatep] = basicSteps(r, inst, true);
    let uptodatedp = r.offset.edp;
    let isgpf3 = false;
    let nextedp3 = "";
    // Step 3 - Get Value in mem
    if (!isgpf12) {
        [isgpf3, nextedp3] = canvas.checkIfGpf(
                                    r.dst,
                                    r.sdt.base_ds,
                                    r.sdt.limit_ds,
                                    "",
                                    `Retorna ${r.memdst} & Atualiza ESI`
                                );
    }
    if (!isgpf3) uptodatedp = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);

    return [(isgpf12 || isgpf3), uptodatep, uptodatedp]
}

/**
 * @param {import("./utils.js").RegistersState} r
 * @param {string} inst
 * @param {PropertyKey} regkey
 */
function basicSteps4reg(r, inst, regkey) {
    const [isgpf12, uptodatep] = basicSteps(r, inst, false);
    let _;
    let isgpf3 = false;
    // Step 3 - Get Value in reg
    if (!isgpf12) {
        [isgpf3, _] = canvas.checkIfGpf(
                                    r.geral[regkey],
                                    r.sdt.base_cs,
                                    r.sdt.limit_cs,
                                    "",
                                    "",
                                    true
                                );
    }

    return [(isgpf12 || isgpf3), uptodatep]
}

function steps4mem1(r) {
    const [isgpf12, uptodatep] = basicSteps(r, r.inst.toUpperCase(), true);
    let uptodatedp = r.offset.edi;
    let isgpf3 = false;
    let nextedp3 = "";
    // Step 3 - Get Value in mem
    if (!isgpf12) {
        [isgpf3, nextedp3] = canvas.checkIfGpf(
                                    r.dst,
                                    r.sdt.base_ds,
                                    r.sdt.limit_ds,
                                    "",
                                    `Retorna ${r.memdst} & Atualiza EDI & ESI`
                                );
    }

    if (!(isgpf12 || isgpf3)) {
        uptodatedp = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);
        canvas.objs.arrows.push({text: "Executa instrução", draw: false     });
        canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
        canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
    }

    return [(isgpf12 || isgpf3), uptodatep, uptodatedp]
}

function steps4reg1(r) {
    const [isgpf12, uptodatep] = basicSteps(r, r.inst.toUpperCase(), false);
    let isgpf3 = false;

    if (!isgpf12) {
        canvas.objs.arrows.push({text: "Executa instrução", draw: false});
        canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
        canvas.objs.arrows.push({text: "Atualiza valor no Registrador", draw: false});
    }

    return [(isgpf12 || isgpf3), uptodatep]
}

function steps4_2(r, dstismem, srcismem) {
    let isgpf2, nexteip2, isgpf4, nextedp4;
    let [isgpf12, uptodatep] = basicSteps(r, r.inst.toUpperCase(), dstismem, true);
    if (r.inst === "inc" || r.inst === "dec") {
        if (dstismem) {
            let uptodatedp = r.offset.edi;
            let isgpf3 = false;
            let nextedp3 = "";
            // Step 3 - Get Value in mem
            if (!isgpf12) {
                [isgpf3, nextedp3] = canvas.checkIfGpf(
                                            r.dst,
                                            r.sdt.base_ds,
                                            r.sdt.limit_ds,
                                            "",
                                            `Retorna ${r.memdst} & Atualiza EDI & ESI`
                                        );
            }

            if (!(isgpf12 || isgpf3)) {
                uptodatedp = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);
                canvas.objs.arrows.push({text: "Executa instrução", draw: false     });
                canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
                canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
            }

            return [(isgpf12 || isgpf3), uptodatep, uptodatedp]
        } else {
            if (!(isgpf12)) {
                canvas.objs.arrows.push({text: "Executa instrução", draw: false});
                canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
                canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
            }

            return [isgpf12, uptodatep, undefined]
        }
    } else if (r.inst === "mul") {
        if (srcismem) {
            let uptodatedp = r.offset.edi;
            let isgpf3 = false;
            let nextedp3 = "";
            // Step 3 - Get Value in mem
            if (!isgpf12) {
                [isgpf3, nextedp3] = canvas.checkIfGpf(
                                            r.src,
                                            r.sdt.base_ds,
                                            r.sdt.limit_ds,
                                            "",
                                            `Retorna ${r.memsrc} & Atualiza EDI & ESI`
                                        );
            }

            if (!(isgpf12 || isgpf3)) {
                uptodatedp = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);
                canvas.objs.arrows.push({text: "Executa instrução", draw: false});
                canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
                canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
            }

            return [(isgpf12 || isgpf3), uptodatep, uptodatedp]
        } else {
            if (!(isgpf12)) {
                canvas.objs.arrows.push({text: "Executa instrução", draw: false});
                canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
                canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
            }

            return [isgpf12, uptodatep, undefined]
        }
    } else {
        if (dstismem) {
            let uptodatedi = r.offset.edi;
            let uptodatesi = r.offset.esi;
            let isgpf3 = false;
            let nextedp3 = ""; 
            // Step 3 - Get Value in mem
            if (!isgpf12) {
                [isgpf3, nextedp3] = canvas.checkIfGpf(
                                            r.dst,
                                            r.sdt.base_ds,
                                            r.sdt.limit_ds,
                                            "",
                                            `Retorna ${r.memdst.toUpperCase()} & Atualiza EDI & ESI`
                                        );
            }
            if (!isgpf3) uptodatedi = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);

            if (!(isgpf12 || isgpf3)) {
                [isgpf2, nexteip2] = canvas.checkIfGpf(
                                            uptodatep,
                                            r.sdt.base_cs,
                                            r.sdt.limit_cs,
                                            (srcismem) ? "Endereço" : "Registrador"
                                        );
            }
            if (!isgpf2) uptodatep = nexteip2;

            if (srcismem) {
                if (!(isgpf12 || isgpf3)) {
                    [isgpf4, nextedp4] = canvas.checkIfGpf(
                                                r.src,
                                                r.sdt.base_ds,
                                                r.sdt.limit_ds,
                                                "",
                                                `Retorna ${r.memsrc.toUpperCase()} & Atualiza ESI`
                                            );
                }
                if (!isgpf4) uptodatesi = Utils.num_to_radix(HexOperations.sub(nextedp4, 4, 16), 16);
            } else {
                if (!(isgpf12 || isgpf3 || isgpf3)) canvas.objs.arrows.push({text: "Lê valor no registrador SRC", draw: false});
            }

            if (!(isgpf12 || isgpf3)) {
                uptodatedi = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);
                if (srcismem) {
                    canvas.objs.arrows.push({text: "Executa instrução", draw: false});
                    canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
                } else {
                    canvas.objs.arrows.push({text: "Executa instrução & Verifica as Flags", draw: false});
                }
                canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
            }

            return [(isgpf12 || isgpf3), uptodatep, uptodatedi, uptodatesi]
        } else {
            let uptodatedi = r.offset.edi;
            let uptodatesi = r.offset.esi;
            let isgpf3 = false;
            let nextedp3 = ""; 

            if (!(isgpf12 || isgpf3)) {
                [isgpf2, nexteip2] = canvas.checkIfGpf(
                                            uptodatep,
                                            r.sdt.base_cs,
                                            r.sdt.limit_cs,
                                            (srcismem) ? "Endereço" : "Registrador"
                                        );
            }
            if (!isgpf2) uptodatep = nexteip2;

            if (srcismem) {
                if (!(isgpf12 || isgpf3 || isgpf3)) {
                    [isgpf4, nextedp4] = canvas.checkIfGpf(
                                                r.src,
                                                r.sdt.base_ds,
                                                r.sdt.limit_ds,
                                                "",
                                                `Retorna ${r.memsrc.toUpperCase()} & Atualiza ESI`
                                            );
                }
                if (!isgpf4) uptodatesi = Utils.num_to_radix(HexOperations.sub(nextedp4, 4, 16), 16);
            } else {
                if (!(isgpf12 || isgpf3 || isgpf3)) canvas.objs.arrows.push({text: "Lê valor no registrador SRC", draw: false});
            }

            if (!(isgpf12 || isgpf3)) {
                uptodatedi = Utils.num_to_radix(HexOperations.sub(nextedp3, 4, 16), 16);
                if (srcismem) {
                    canvas.objs.arrows.push({text: "Executa instrução", draw: false});
                    canvas.objs.arrows.push({text: "Verifica as Flags", draw: false});
                } else {
                    canvas.objs.arrows.push({text: "Executa instrução & Verifica as Flags", draw: false});
                }
                canvas.objs.arrows.push({text: "Atualiza valor no End", draw: true});
            }

            return [(isgpf12 || isgpf3), uptodatep, uptodatedi, uptodatesi]
        }
    }
}