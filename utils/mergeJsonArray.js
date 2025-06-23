function mergeJsonArray(iflowJson) {
    const temp = {};
    let count = 0;
    iflowJson.forEach(obj => {
        for (const [key, value] of Object.entries(obj)) {
            // Directly set key if it's same across all objects (e.g. "BTP-IS")
            if (!temp[key]) temp[key] = new Set();
            temp[key].add(JSON.stringify(value));
        }
    });

    const result = {};
    for (const key in temp) {
        const values = Array.from(temp[key]).map(v => JSON.parse(v));

        // Handle special cases for NAME -> NAMES, address -> addresss
        if (values.length != 1) {
            count++;
        }
        result[key] = values.map(val => ({ [key]: val }));
    }
    result.COUNT = count;
    return result;
}

module.exports = mergeJsonArray;