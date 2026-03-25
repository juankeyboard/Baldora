import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Block external domains to prevent timeouts
        await page.route("**/*", lambda route: route.abort() if any(domain in route.request.url for domain in ["fonts.googleapis.com", "gstatic.com"]) else route.continue_())

        await page.goto("http://localhost:8000")

        # Bypass onboarding and animations as per memory
        await page.evaluate("""() => {
            localStorage.setItem('baldora_tour_config_seen', 'true');
            localStorage.setItem('baldora_tour_profile_seen', 'true');
            const style = document.createElement('style');
            style.innerHTML = `
                * { animation: none !important; transition: none !important; }
                .driver-overlay, .driver-popover, .driver-overlay-animated { display: none !important; }
            `;
            document.head.appendChild(style);
        }""")

        # Fill nickname
        await page.fill('#nickname', 'TestUser')

        # Click start button
        await page.click('.btn-start')

        # Wait for grid cells
        await page.wait_for_selector('#matrix-grid .matrix-cell', state='visible', timeout=10000)

        cells_count = await page.locator('#matrix-grid .matrix-cell').count()
        print(f"Success: Found {cells_count} matrix cells rendered.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
