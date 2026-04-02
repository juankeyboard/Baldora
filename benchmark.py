import asyncio
import time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Block external domains to speed up loading
        await page.route("**/*", lambda route: route.continue_() if "localhost" in route.request.url or "127.0.0.1" in route.request.url else route.abort())

        # Load the app
        await page.goto("http://localhost:8000", wait_until="commit")

        # Bypass onboarding
        await page.evaluate("""() => {
            localStorage.setItem('baldora_tour_config_seen', 'true');
            localStorage.setItem('baldora_tour_profile_seen', 'true');
        }""")

        # Inject CSS to disable animations
        await page.add_style_tag(content="""
            .driver-overlay, .driver-popover, .driver-overlay-animated {
                animation: none !important;
                display: none !important;
            }
        """)

        # Fill nickname and submit to enter the app
        await page.locator('#nickname').fill('Tester')
        await page.evaluate("document.getElementById('config-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))")

        # The mode timer input is likely hidden/not interactable in terms of standard click, so we can dispatch events or click its label if necessary
        # Usually checking the radio button directly through JS is faster and less prone to Playwright visibility errors
        await page.evaluate("document.getElementById('mode-timer').checked = true; document.getElementById('mode-timer').dispatchEvent(new Event('change'));")

        # Start the game
        # wait a bit
        await asyncio.sleep(1)
        await page.evaluate("document.querySelector('.btn-start').click()")

        # Wait a bit for the game to start and grid to render once
        await asyncio.sleep(1)

        # Select all rows and cols to maximize render time
        await page.evaluate("""() => {
            GridManager.selectedRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            GridManager.selectedCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        }""")

        # Benchmark GridManager.render()
        num_runs = 50
        execution_times = []

        for _ in range(num_runs):
            # Evaluate the time it takes to run GridManager.render() in the browser context
            time_taken = await page.evaluate("""() => {
                const start = performance.now();
                GridManager.render();
                const end = performance.now();
                return end - start;
            }""")
            execution_times.append(time_taken)

        avg_time = sum(execution_times) / len(execution_times)
        print(f"Average render time over {num_runs} runs: {avg_time:.2f} ms")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
