import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Navigate to the frontend server URL
            await page.goto("http://localhost:5173/")

            # Wait for the login form to be visible by checking for the button
            await expect(page.get_by_role("button", name="Se connecter")).to_be_visible(timeout=10000)

            # Take a screenshot of the login page
            await page.screenshot(path="jules-scratch/verification/login-page.png")

            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
