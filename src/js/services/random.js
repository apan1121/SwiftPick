// Crypto-secure random helpers

export const getRandomInt = (max) => {
    // return integer in [0, max)
    if (!Number.isFinite(max) || max <= 0) return 0;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return Math.floor((array[0] / (0xffffffff + 1)) * max);
};

export const pickRandomDistinct = (arr, k = 1, exclude = new Set()) => {
    const pool = arr.filter((x) => !exclude.has(x));
    const n = Math.min(k, pool.length);
    const chosen = [];
    const used = new Set();
    for (let i = 0; i < n; i++) {
        let idx = getRandomInt(pool.length);
        while (used.has(idx)) idx = getRandomInt(pool.length);
        used.add(idx);
        chosen.push(pool[idx]);
    }
    return chosen;
};

export const pickOne = (arr, exclude = new Set()) => {
    const pool = arr.filter((x) => !exclude.has(x));
    if (!pool.length) return null;
    return pool[getRandomInt(pool.length)];
};

export default {
    getRandomInt,
    pickRandomDistinct,
    pickOne,
};

