function mergeJsonArray(data) {
    if(data.length < 2) {
        return data[0];
    }

    const temp = {};
    data.forEach(obj => {
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();

            // Directly set key if it's same across all objects (e.g. "BTP-IS")
            if (!temp[key]) temp[key] = new Set();
            temp[key].add(JSON.stringify(value));
        }
    });

    const result = {};
    for (const key in temp) {
        const values = Array.from(temp[key]).map(v => JSON.parse(v));

        // Handle special cases for NAME -> NAMES, address -> addresss
        if (values.length === 1) {
            result[key] = values[0];
        } else {
            result[key] = values.map(val => ({ [key]: val }));
        }
    }

    return result;
}

module.exports = mergeJsonArray;