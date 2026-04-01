from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Inject script to bypass onboarding overlay
        page.add_init_script("""
            localStorage.setItem('baldora_has_seen_tour', 'true');
            // Hide driver.js completely
            const style = document.createElement('style');
            style.innerHTML = '.driver-overlay, .driver-popover, .driver-overlay-animated { display: none !important; opacity: 0 !important; pointer-events: none !important; } * { animation: none !important; transition: none !important; }';
            document.head.appendChild(style);
        """)

        page.goto('http://localhost:8000', wait_until='networkidle')

        # Force remove any driver overlays if they exist, and remove driver-active from body
        page.evaluate("""() => {
            document.body.classList.remove('driver-active', 'driver-fade');
            document.querySelectorAll('.driver-overlay, .driver-popover').forEach(el => el.remove());
        }""")

        # Start game by entering nickname and submitting form
        page.locator('#nickname').fill('TestUser')

        # Use evaluate to dispatch click events to bypass playwright pointer interception issues
        page.evaluate('() => document.getElementById("btn-select-all-rows").click()')
        page.evaluate('() => document.getElementById("btn-select-all-cols").click()')

        # Submit form via JS to avoid overlay issues
        page.evaluate('() => document.getElementById("config-form").dispatchEvent(new Event("submit"))')

        # Wait for grid to be visible
        grid = page.locator('#matrix-grid')
        grid.wait_for(state="visible")

        # Count elements
        cells = page.locator('.matrix-cell')
        count = cells.count()
        print(f"Total .matrix-cell elements found: {count}")

        if count == 256:
            print("Test passed: 256 cells found.")
        else:
            print(f"Test failed: expected 256, got {count}.")
            exit(1)

        browser.close()

if __name__ == '__main__':
    test()
