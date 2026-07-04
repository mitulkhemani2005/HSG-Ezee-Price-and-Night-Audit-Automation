import os
import sys
import json
import re
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

load_dotenv(override=True)

EZEEUSER = os.getenv("EZEEUSER")
PASSWORD = os.getenv("PASSWORD")
PROPCODE = os.getenv("PROPCODE")

def get_element_val(page, sel, is_input=True):
    try:
        try:
            page.wait_for_selector(sel, timeout=10000)
        except Exception:
            pass
            
        el = page.locator(sel)
        if is_input:
            val = el.input_value()
        else:
            val = el.inner_text() or el.text_content()
        
        if val and val.strip():
            cleaned = re.sub(r"[^\d.]", "", val.strip())
            return int(float(cleaned))
        return None
    except Exception as ex:
        return None

def main():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_default_timeout(100000)
            
            page.goto("https://live.ipms247.com/login/")
            page.fill("#username", EZEEUSER)
            page.fill("#password", PASSWORD)
            page.fill("#hotelcode", PROPCODE)
            page.wait_for_selector("button#login")
            page.get_by_role("button", name="SIGN IN").click()
            page.wait_for_url("**/unity/**")
            page.goto("https://live.ipms247.com/unity/ratewizard/ratesinventory")
            
            page.wait_for_selector("#input-2-1-2")
            page.wait_for_timeout(1000)
            
            price_a = get_element_val(page, "#input-2-1-2", is_input=True)
            price_b = get_element_val(page, "#input-2-7-2", is_input=True)
            price_c = get_element_val(page, "#input-2-3-2", is_input=True)
            price_d = get_element_val(page, "#input-2-5-2", is_input=True)
            
            rem_a = get_element_val(page, "#cell-2-0-3", is_input=False)
            rem_b = get_element_val(page, "#cell-2-6-3", is_input=False)
            rem_c = get_element_val(page, "#cell-2-2-3", is_input=False)
            rem_d = get_element_val(page, "#cell-2-4-3", is_input=False)
            
            # Extract date headers
            js_dates = """
            () => {
                const headers = [];
                const divs = document.querySelectorAll('div');
                divs.forEach((d) => {
                    if (d.children.length === 3) {
                        const c0 = d.children[0].innerText.trim();
                        const c1 = d.children[1].innerText.trim();
                        const c2 = d.children[2].innerText.trim();
                        
                        const isDay = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/i.test(c0);
                        const isDate = /^\\d{1,2}$/.test(c1);
                        const isMonth = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(c2);
                        
                        if (isDay && isDate && isMonth) {
                            headers.push(`${c0} ${c1} ${c2}`);
                        }
                    }
                });
                return headers;
            }
            """
            headers = page.evaluate(js_dates)
            price_date = headers[2] if len(headers) > 2 else "Unknown"
            remaining_date = headers[3] if len(headers) > 3 else "Unknown"

            browser.close()
            
            result = {
                "prices": {
                    "A": price_a,
                    "B": price_b,
                    "C": price_c,
                    "D": price_d
                },
                "remaining": {
                    "A": rem_a,
                    "B": rem_b,
                    "C": rem_c,
                    "D": rem_d
                },
                "price_date": price_date,
                "remaining_date": remaining_date
            }
            print(json.dumps(result))
            sys.exit(0)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
