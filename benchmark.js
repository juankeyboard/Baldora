const { JSDOM } = require("jsdom");

const dom = new JSDOM(`<!DOCTYPE html>
<html>
<body>
    <canvas id="chart-pie"></canvas>
    <canvas id="chart-bar-tables"></canvas>
    <canvas id="chart-bar-top"></canvas>
    <canvas id="chart-histogram"></canvas>
    <!-- Add some extra elements to simulate a real DOM -->
    ${'<div class="dummy"></div>'.repeat(1000)}
</body>
</html>`);

global.document = dom.window.document;

const chartCanvasIds = ['chart-pie', 'chart-bar-tables', 'chart-bar-top', 'chart-histogram'];

const ITERATIONS = 100000;

console.log(`Running benchmark with ${ITERATIONS} iterations...`);

// Test 1: Query inside loop (current behavior)
const start1 = performance.now();
for (let j = 0; j < ITERATIONS; j++) {
    for (let i = 0; i < 4; i++) {
        const canvas = document.getElementById(chartCanvasIds[i]);
        if (!canvas) throw new Error("Canvas not found");
    }
}
const end1 = performance.now();
const time1 = end1 - start1;
console.log(`Query inside loop: ${time1.toFixed(2)} ms`);

// Test 2: Query outside loop (optimized behavior)
const start2 = performance.now();
for (let j = 0; j < ITERATIONS; j++) {
    const canvases = chartCanvasIds.map(id => document.getElementById(id));
    for (let i = 0; i < 4; i++) {
        const canvas = canvases[i];
        if (!canvas) throw new Error("Canvas not found");
    }
}
const end2 = performance.now();
const time2 = end2 - start2;
console.log(`Query outside loop: ${time2.toFixed(2)} ms`);

// Test 3: Array of canvas elements
const start3 = performance.now();
for (let j = 0; j < ITERATIONS; j++) {
    const canvases = [
        document.getElementById(chartCanvasIds[0]),
        document.getElementById(chartCanvasIds[1]),
        document.getElementById(chartCanvasIds[2]),
        document.getElementById(chartCanvasIds[3])
    ];
    for (let i = 0; i < 4; i++) {
        const canvas = canvases[i];
        if (!canvas) throw new Error("Canvas not found");
    }
}
const end3 = performance.now();
const time3 = end3 - start3;
console.log(`Array inline: ${time3.toFixed(2)} ms`);


const improvement = ((time1 - time3) / time1 * 100).toFixed(2);
console.log(`Improvement: ${improvement}% faster`);
