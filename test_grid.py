from playwright.sync_api import sync_playwright

def test_grid():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Route external requests to avoid timeouts (Google Fonts, Firebase, Driver JS overlay)
        page.route("**/*", lambda route: route.continue_() if not any(
            x in route.request.url for x in ["fonts.googleapis.com", "gstatic.com", "firebase"]
        ) else route.abort())

        # Load the app
        page.goto("http://localhost:8000")

        # Bypass the Onboarding tour
        page.evaluate("localStorage.setItem('baldora_tour_config_seen', 'true')")
        page.evaluate("localStorage.setItem('baldora_tour_profile_seen', 'true')")

        # Inject CSS to hide animations and driver elements
        page.add_style_tag(content="""
            * { animation: none !important; transition: none !important; }
            .driver-overlay, .driver-popover, .driver-overlay-animated { display: none !important; }
        """)

        # Start a session
        # Use simple default settings (Timer mode, since free mode launches LineMode instead of standard Grid matrix)
        # Timer mode renders standard grid.
        page.evaluate("document.getElementById('mode-timer').click()")
        page.fill("#nickname", "TestPlayer")
        page.evaluate("document.getElementById('config-form').dispatchEvent(new Event('submit'))")

        # Wait for the grid to render. Wait until a specific inner cell containing "x" is visible.
        page.wait_for_selector(".matrix-cell")
        page.wait_for_selector("#matrix-grid .matrix-cell:text-matches('1×1')")

        # Take a screenshot to confirm it works
        page.screenshot(path="grid_verification.png", full_page=True)

        print("Test passed: Grid rendered successfully. Check grid_verification.png")
        browser.close()

if __name__ == "__main__":
    test_grid()