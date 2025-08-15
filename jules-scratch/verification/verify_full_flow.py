import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # Step 1: Navigate to the login page
            await page.goto("http://localhost:5173/")

            # Wait for the login form to be visible
            await expect(page.get_by_role("button", name="Se connecter")).to_be_visible(timeout=15000)
            print("Login page loaded.")

            # Step 2: Fill in the name and role
            # The role 'chef' is selected by default in the mock, but we select it just in case
            await page.get_by_label("Nom").fill("chef")

            print("Filled in login details.")

            # Step 3: Click the login button
            await page.get_by_role("button", name="Se connecter").click()
            print("Clicked login button.")

            # Step 4: Wait for the dashboard to load by checking for the welcome message
            welcome_message = page.get_by_role("heading", name="Bonjour, chef")
            await expect(welcome_message).to_be_visible(timeout=10000)
            print("Dashboard loaded successfully.")

            # Step 5: Take a screenshot of the dashboard
            screenshot_path = "jules-scratch/verification/dashboard-screenshot.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot on error to help debug
            await page.screenshot(path="jules-scratch/verification/error-screenshot.png")
            print("Error screenshot taken.")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
