from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
import pandas as pd
import time
from datetime import datetime

# Constants
CHROME_DRIVER_PATH = 'chromedriver-mac-x64/chromedriver'  # Adjust the path as needed
URL = "https://fmec.famiport.com.tw/FP_Entrance/QueryShop"
SAMPLE_LIMIT = 5  # Limit the number of samples if needed
WAIT_TIME = 10  # WebDriver wait time in seconds
DELAY_BETWEEN_SELECTIONS = 1  # Delay between dropdown selections
DELAY_AFTER_SEARCH = 5  # Delay after clicking the search button

# Initialize the WebDriver
def init_driver():
    service = Service(CHROME_DRIVER_PATH)
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(service=service, options=options)
    return driver

# Save data to a CSV file
def save_to_csv(data, filename):
    df = pd.DataFrame(data)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    output_file = f"{filename}_{timestamp}.csv"
    df.to_csv(output_file, index=False, encoding="utf-8")
    print(f"Data saved to {output_file}")

# Extract data from the results container
def extract_store_data(result_container, scrape_time):
    try:
        return {
            "城市": result_container.find_element(By.ID, "CITY").text,
            "區域": result_container.find_element(By.ID, "DISTRICT").text,
            "街道": result_container.find_element(By.ID, "STREET").text,
            "店名": result_container.find_element(By.ID, "NAME").text,
            "店號": result_container.find_element(By.ID, "PKEYNEW").text,
            "服務代號": result_container.find_element(By.ID, "SERID").text,
            "地址": result_container.find_element(By.ID, "ADDR").text,
            "電話": result_container.find_element(By.ID, "TEL").text,
            "Timestamp": scrape_time
        }
    except Exception as e:
        print("Error extracting store data:", e)
        return None

# Main scraping logic
def scrape_stores(driver):
    all_data = []
    sample_count = 0
    try:
        driver.get(URL)
        wait = WebDriverWait(driver, WAIT_TIME)

        # Switch to iframe
        iframe = wait.until(EC.presence_of_element_located((By.TAG_NAME, "iframe")))
        driver.switch_to.frame(iframe)

        # Iterate through dropdowns
        city_dropdown = Select(wait.until(EC.presence_of_element_located((By.ID, "city"))))
        for city_option in city_dropdown.options[1:]:
            city_dropdown.select_by_visible_text(city_option.text)
            print(f"Selected city: {city_option.text}")
            time.sleep(DELAY_BETWEEN_SELECTIONS)

            district_dropdown = Select(wait.until(EC.presence_of_element_located((By.NAME, "district"))))
            for district_option in district_dropdown.options[1:]:
                district_dropdown.select_by_visible_text(district_option.text)
                print(f"Selected district: {district_option.text}")
                time.sleep(DELAY_BETWEEN_SELECTIONS)

                road_dropdown = Select(wait.until(EC.presence_of_element_located((By.NAME, "street"))))
                for road_option in road_dropdown.options[1:]:
                    road_dropdown.select_by_visible_text(road_option.text)
                    print(f"Selected road: {road_option.text}")
                    time.sleep(DELAY_BETWEEN_SELECTIONS)

                    store_dropdown = Select(wait.until(EC.presence_of_element_located((By.NAME, "store"))))
                    for store_option in store_dropdown.options[1:]:
                        store_dropdown.select_by_visible_text(store_option.text)
                        print(f"Selected store: {store_option.text}")

                        # Record the scrape time
                        scrape_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                        # Click the search button
                        search_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@onclick='Search_Button()']")))
                        search_button.click()
                        time.sleep(DELAY_AFTER_SEARCH)

                        # Extract data
                        result_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "list-table.single-list")))
                        store_data = extract_store_data(result_container, scrape_time)

                        if store_data:
                            all_data.append(store_data)
                            sample_count += 1
                            print(f"Scraped store {sample_count}: {store_data['店名']}")

                            # Stop if sample limit is reached
                            if sample_count >= SAMPLE_LIMIT:
                                raise StopIteration
    except StopIteration:
        print(f"Sample limit of {SAMPLE_LIMIT} reached. Stopping.")
    except Exception as e:
        print("An error occurred during scraping:", e)
    finally:
        return all_data

# Main function
def main():
    driver = init_driver()
    try:
        scraped_data = scrape_stores(driver)
        save_to_csv(scraped_data, "store_data")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
