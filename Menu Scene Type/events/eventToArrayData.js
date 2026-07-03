const id = "MENU_DEFINE_ARRAY_DATA";
const groups = [""];
const name = "Make Array Data Files";

const fields = [{
    label: "At the moment, this is meant to be used by other plugins, but theoretically it can be updated to take some number of things and turn them into a c&h file for engine purposes."
}]

const toArrayDataFile = (
  type,
  symbol,
  comment,
  array,
  perLine,
  dependencies,
) => {
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

    const bankRef = (symbol) => `BANKREF(${symbol})`;

    return `#pragma bank 255
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
${chunk(array, perLine)
            .map((r) => " ".repeat(INDENT_SPACES) + r.join(", "))
            .join(",\n")}
};
`;
}

const toArrayDataHeader = (type, symbol, comment) => {
    const bankRefExtern = (symbol) => `BANKREF_EXTERN(${symbol})`;
    const includeGuard = (key, contents) => `#ifndef ${key}_H
#define ${key}_H

${contents}

#endif
`;

    return includeGuard(
        symbol.toUpperCase(),
        `${comment}

#include "gbs_types.h"

${bankRefExtern(symbol)}
extern ${type} ${symbol}[];`,
    );
}

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const {
        type,
        symbol,
        comment,
        array,
        perLine,
        dependencies,
    } = input

    helpers.writeAsset(`${symbol}.c`, toArrayDataFile(
        type,
        symbol,
        comment,
        array,
        perLine,
        dependencies,
    ))

    helpers.writeAsset(`${symbol}.h`, toArrayDataHeader(
        type,
        symbol,
        comment,
    ))
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    deprecated: true
};