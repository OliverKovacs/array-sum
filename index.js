// Oliver Kovacs MIT 2021

const fs = require("fs");
const SIZE = 2;

console.time("Processed files");
const raw = fs.readFileSync("./in", "utf8").split("\n");
const raw_data = raw[1].split(" ").map(x => Number(x));
const data = [];
for (let i = 0; i < raw_data.length; i++) data[i] = +raw_data[i];

const raw_queries = raw.slice(3);
const queries = [];
for (let i = 0; i < raw_queries.length; i++) {
    let query = raw_queries[i].split(" ");
    queries[i] = [ +query[0], +query[1] ];
}
console.timeEnd("Processed files");

const createCache = (cache, size) => {
    const blockSize = 2 ** size;
    const layerCount =
        Math.floor(Math.log(cache[0].length) / Math.log(blockSize));
    for (let i = 0; i < layerCount; i++) {
        cache[i + 1] = [];
        const length = Math.floor(cache[i].length / blockSize);
        for (let j = 0; j < length; j++) {
            cache[i + 1][j] = cache[i][j * blockSize];
            for (let k = 1; k < blockSize; k++) {
                cache[i + 1][j] += cache[i][j * blockSize + k];
            }
        }
    }
};

const processQueries = (out, cache, queries, size) => {
    let blockSize = 2 ** size;
    for (let i = 0; i < queries.length; i++) {
        let begin = queries[i][0];
        let end = queries[i][1] + 1;
        while (begin < end) {
            let span = end - begin;
            let block = 1;
            let next = blockSize;
            let layer = 0;
            while (next <= span && !(begin & (next - 1))) {
                block *= blockSize;
                next *= blockSize;
                layer++;
            }
            out[i] += cache[layer][begin >> (layer * size)];
            begin += block;
        }
    }
};

console.time("Created cache");
const cache = [ data ];
createCache(cache, SIZE);
console.timeEnd("Created cache");

console.time("Processed queries");
const out = [];
for (let i = 0; i < queries.length; i++) out[i] = 0;
processQueries(out, cache, queries, SIZE);
console.timeEnd("Processed queries");

/*
const solution = require("./output.json");
for (let i = 0; i < out.length; i++) {
    if (out[i] !== solution[i]) console.log(`[${i}] ${out[i]} ${solution[i]}`);
}
*/
