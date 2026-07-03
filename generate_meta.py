import os
import json
import csv
import re
from datetime import datetime

# Configuration
NIFTY_DAILY_CSV = 'index_HOLC_data/NIFTY_2026.csv'
NIFTY_HOLC_CSV = 'index_HOLC_data/NIFTY_HOLC.csv'
OPTION_IMG_DIR = 'option_chart_image'
OUTPUT_FILE = 'calendar_meta.json'

def parse_daily_csv(filepath):
    trading_days = set()
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return trading_days
        
    try:
        with open(filepath, 'r') as f:
            reader = csv.reader(f)
            next(reader) # skip header
            for row in reader:
                if len(row) >= 1:
                    date_str = row[0].strip() # 01-JAN-2026
                    try:
                        dt = datetime.strptime(date_str, "%d-%b-%Y")
                        trading_days.add(dt.strftime("%Y-%m-%d"))
                    except ValueError:
                        pass
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return trading_days

def parse_holc_csv(filepath):
    holc_days = set()
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return holc_days
        
    try:
        with open(filepath, 'r') as f:
            next(f) # skip header
            for line in f:
                parts = line.split(',')
                if len(parts) >= 1:
                    datetime_str = parts[0].strip() # 2026-01-01 09:15:00
                    date_part = datetime_str[:10]
                    if len(date_part) == 10 and date_part.startswith("20"):
                        holc_days.add(date_part)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return holc_days

def parse_option_images(directory):
    img_days = set()
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return img_days
        
    month_map = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
        'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    }
    
    for filename in os.listdir(directory):
        if not filename.endswith('.png'):
            continue
            
        # Format 1: NIFTY 10 FEB 26000 CALL.png
        match1 = re.match(r'NIFTY (\d{1,2}) ([A-Z]{3})', filename)
        if match1:
            day = match1.group(1).zfill(2)
            month = month_map.get(match1.group(2))
            if month:
                img_days.add(f"2026-{month}-{day}")
                continue
                
        # Format 2: NIFTY 50_2026-06-23_12-42-57.png
        match2 = re.match(r'NIFTY 50_(\d{4}-\d{2}-\d{2})', filename)
        if match2:
            img_days.add(match2.group(1))
            continue
            
        # Format 3: NIFTY 50_Mon 25 May '26_01-57-14.png
        match3 = re.match(r"NIFTY 50_[a-zA-Z]{3} (\d{1,2}) ([A-Z]{3}) '26", filename, re.IGNORECASE)
        if match3:
            day = match3.group(1).zfill(2)
            month_str = match3.group(2).upper()
            month = month_map.get(month_str)
            if month:
                img_days.add(f"2026-{month}-{day}")
                continue
                
    return img_days

def main():
    print("Generating Calendar Metadata...")
    trading_days = parse_daily_csv(NIFTY_DAILY_CSV)
    print(f"Found {len(trading_days)} trading days.")
    
    holc_days = parse_holc_csv(NIFTY_HOLC_CSV)
    print(f"Found {len(holc_days)} days with HOLC data.")
    
    img_days = parse_option_images(OPTION_IMG_DIR)
    print(f"Found {len(img_days)} days with Option Images.")
    
    # Compile all unique dates
    all_dates = trading_days.union(holc_days).union(img_days)
    
    meta_data = {}
    for d in all_dates:
        meta_data[d] = {
            "isTradingDay": d in trading_days,
            "hasHOLC": d in holc_days,
            "hasOptionImages": d in img_days
        }
        
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(meta_data, f, indent=4)
        
    print(f"Successfully generated {OUTPUT_FILE} with {len(meta_data)} dates.")

if __name__ == "__main__":
    main()
