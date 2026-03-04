const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Evaluate the benchmark script directly
    await page.goto('about:blank');
    await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Benchmark</title>
        </head>
        <body>
            <div id="rows-grid">
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
            </div>
            <div id="cols-grid">
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
                <button class="table-btn"></button>
            </div>
        </body>
        </html>
    `);

    const result = await page.evaluate(() => {
        const iterations = 100000;

        let unoptimizedRowsStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const allSelected = i % 2 === 0;
            if (allSelected) {
                document.querySelectorAll('#rows-grid .table-btn').forEach(btn => btn.classList.remove('active'));
            } else {
                document.querySelectorAll('#rows-grid .table-btn').forEach(btn => btn.classList.add('active'));
            }
        }
        let unoptimizedRowsEnd = performance.now();
        let unoptimizedRowsTime = unoptimizedRowsEnd - unoptimizedRowsStart;

        let optimizedRowsStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            const allSelected = i % 2 === 0;
            const rowsBtns = document.querySelectorAll('#rows-grid .table-btn');
            if (allSelected) {
                for (let j = 0; j < rowsBtns.length; j++) {
                    rowsBtns[j].classList.remove('active');
                }
            } else {
                for (let j = 0; j < rowsBtns.length; j++) {
                    rowsBtns[j].classList.add('active');
                }
            }
        }
        let optimizedRowsEnd = performance.now();
        let optimizedRowsTime = optimizedRowsEnd - optimizedRowsStart;

        return {
            unoptimized: unoptimizedRowsTime,
            optimized: optimizedRowsTime,
            improvement: ((unoptimizedRowsTime - optimizedRowsTime) / unoptimizedRowsTime * 100).toFixed(2)
        };
    });

    console.log("Unoptimized:", result.unoptimized, "ms");
    console.log("Optimized:", result.optimized, "ms");
    console.log("Improvement:", result.improvement + "%");

    await browser.close();
}

run();
