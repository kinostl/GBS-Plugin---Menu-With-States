const id = "MENU_DEFINE_STRUCT_ARRAY";
const groups = [""];
const name = id;
const fields = [];

const INDENT_SPACES = 4;
const chunk = (arr, len) => {
    if (!len) {
        return [arr];
    }

    const chunks = [];
    const n = arr.length;
    let i = 0;
    while (i < n) {
        chunks.push(arr.slice(i, (i += len)));
    }

    return chunks;
};

const bankRefExtern = (symbol) => `BANKREF_EXTERN(${symbol})`;
const bankRef = (symbol) => `BANKREF(${symbol})`;

const toStructData = (
    object,
    indent = 0,
    perLine = 16,
) => {
    const keys = Object.keys(object);
    return keys
        .map((key) => {
            if (object[key] === undefined) {
                return "";
            }
            if (key === "__comment") {
                return `${" ".repeat(indent)}// ${object[key]}`;
            }
            if (Array.isArray(object[key])) {
                return `${" ".repeat(indent)}.${String(key)} = {
${chunk(object[key], perLine)
                        .map(
                            (r) =>
                                " ".repeat(indent + INDENT_SPACES) +
                                r
                                    .map((v) => {
                                        if (v instanceof Object) {
                                            return `{\n${toStructData(
                                                v,
                                                indent + 2 * INDENT_SPACES,
                                                perLine,
                                            )}\n${" ".repeat(indent + INDENT_SPACES)}}`;
                                        }
                                        return v;
                                    })
                                    .join(
                                        r[0] && r[0] instanceof Object
                                            ? `,\n${" ".repeat(indent + INDENT_SPACES)}`
                                            : ", ",
                                    ),
                        )
                        .join(",\n")}
${" ".repeat(indent)}}`;
            }
            if (object[key] instanceof Object) {
                return `${" ".repeat(indent)}.${String(key)} = {
${toStructData(
                    object[key],
                    indent + INDENT_SPACES,
                    perLine,
                )}
${" ".repeat(indent)}}`;
            }
            return `${" ".repeat(indent)}.${String(key)} = ${object[key]}`;
        })
        .filter((line) => line.length > 0)
        .join(",\n");
};

const toStructArrayDataFile = (
    type,
    symbol,
    comment,
    array,
    dependencies
) => `#pragma bank 255
${comment ? "\n" + comment : ""}

#include "gbs_types.h"${dependencies
        ? "\n" +
        dependencies
            .map((dependency) => `#include "data/${dependency}.h"`)
            .join("\n")
        : ""
    }

${bankRef(symbol)}

${type} ${symbol}[] = {
${array
        .map(
            (object) => `${" ".repeat(INDENT_SPACES)}{
${toStructData(object, 2 * INDENT_SPACES)}
${" ".repeat(INDENT_SPACES)}}`,
        )
        .join(",\n")}
};
`;

const includeGuard = (key, contents) => `#ifndef ${key}_H
#define ${key}_H

${contents}

#endif
`;

const toArrayDataHeader = (type, symbol, comment) =>
  includeGuard(
    symbol.toUpperCase(),
    `${comment}

#include "gbs_types.h"

${bankRefExtern(symbol)}
extern ${type} ${symbol}[];`,
  );



/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const header = toArrayDataHeader(
        input.type,
        input.symbol,
        input.comment
    )

    const file = toStructArrayDataFile(
        input.type,
        input.symbol,
        input.comment,
        input.array,
        input.dependencies
    )

    helpers.writeAsset(`${input.symbol}.h`, header)
    helpers.writeAsset(`${input.symbol}.c`, file)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    deprecated: true //Don't show up in list
};