#!/usr/bin/env python3
"""
Portfolio Data Updater
Fetches portfolio data from Google Sheets and updates portfolio_data.json
"""

import json
import os
import sys
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Configuration
SHEET_ID = os.environ.get('GOOGLE_SHEET_ID', '1_wQ-7iWOjEQkoxG9aseTJG_sU-bk6Q_-I-Pt2fUaRQw')
SERVICE_ACCOUNT_JSON_STR = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')

def get_service_account_info():
    """Parse Service Account JSON from environment."""
    if not SERVICE_ACCOUNT_JSON_STR:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set")
    
    try:
        return json.loads(SERVICE_ACCOUNT_JSON_STR)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {e}")

def authenticate():
    """Authenticate using Service Account credentials."""
    service_account_info = get_service_account_info()
    credentials = Credentials.from_service_account_info(
        service_account_info,
        scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
    )
    return credentials

def get_cell_value(service, sheet_id, cell_reference):
    """Get a single cell value from the spreadsheet."""
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range=cell_reference
        ).execute()
        
        values = result.get('values', [])
        if values and values[0]:
            return values[0][0]
        return None
    except Exception as e:
        print(f"Error getting cell {cell_reference}: {e}")
        return None

def parse_currency(value):
    """Parse currency values to float."""
    if not value or not isinstance(value, str):
        return 0.0
    
    value = value.strip()
    
    # Handle EUR values
    if '€' in value:
        value = value.replace('€', '').replace('\xa0', '').strip()
        try:
            return float(value.replace(',', '.'))
        except:
            return 0.0
    
    # Handle HUF values
    if 'Ft' in value:
        value = value.replace('Ft', '').replace('\xa0', '').strip()
        try:
            return float(value.replace(',', '.'))
        except:
            return 0.0
    
    try:
        return float(value.replace(',', '.').replace('\xa0', ''))
    except:
        return 0.0

def update_portfolio_data():
    """Fetch data from Google Sheets and update portfolio_data.json."""
    try:
        print("Authenticating with Google Sheets API...")
        credentials = authenticate()
        service = build('sheets', 'v4', credentials=credentials)
        
        print("Fetching portfolio data from Google Sheets...")
        
        # Fetch the specific cell values
        etf_value = parse_currency(get_cell_value(service, SHEET_ID, "'ETF'!B13") or "0")
        bonds_value = parse_currency(get_cell_value(service, SHEET_ID, "'KT'!A2") or "0")
        fundamenta_value = parse_currency(get_cell_value(service, SHEET_ID, "'Fula'!A2") or "0")
        total_value = parse_currency(get_cell_value(service, SHEET_ID, "'M'!AF33") or "0")
        
        print(f"ETF: €{etf_value:,.2f}")
        print(f"Bonds: €{bonds_value:,.2f}")
        print(f"Fundamenta: €{fundamenta_value:,.2f}")
        print(f"Total: €{total_value:,.2f}")
        
        # Calculate percentages
        if total_value > 0:
            etf_pct = (etf_value / total_value) * 100
            bonds_pct = (bonds_value / total_value) * 100
            fundamenta_pct = (fundamenta_value / total_value) * 100
        else:
            etf_pct = bonds_pct = fundamenta_pct = 0
        
        # Create portfolio data structure
        portfolio_data = {
            "portfolio": {
                "etf": {"total_eur": round(etf_value, 2), "percentage": round(etf_pct, 2)},
                "bonds": {"total_eur": round(bonds_value, 2), "percentage": round(bonds_pct, 2)},
                "fundamenta": {"total_eur": round(fundamenta_value, 2), "percentage": round(fundamenta_pct, 2)},
                "total_eur": round(total_value, 2),
            },
            "goals": {
                "primary": {"target_eur": 1000000, "year": 2040, "description": "DREAM"},
                "milestones": [
                    {"target_eur": 50000, "year": 2026, "description": "STAIR STEP"},
                    {"target_eur": 70000, "year": 2027, "description": "STAIR STEP"},
                    {"target_eur": 85000, "year": 2028, "description": "LIL' GOAL"},
                    {"target_eur": 100000, "year": 2029, "description": "LIL' GOAL"},
                    {"target_eur": 250000, "year": 2032, "description": "BIG GOAL"},
                    {"target_eur": 500000, "year": 2036, "description": "BIG GOAL"},
                    {"target_eur": 800000, "year": 2038, "description": "BIG GOAL"},
                    {"target_eur": 1000000, "year": 2040, "description": "DREAM"},
                ]
            },
            "summary": {
                "current_total": round(total_value, 2),
                "primary_goal": 1000000,
                "progress_percent": round((total_value / 1000000) * 100, 2),
                "next_milestone": {
                    "target": 50000,
                    "year": 2026,
                    "progress_percent": round((total_value / 50000) * 100, 2) if total_value > 0 else 0,
                }
            },
            "last_updated": __import__('datetime').datetime.utcnow().isoformat() + 'Z'
        }
        
        # Save to file
        output_file = 'public/portfolio_data.json'
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(portfolio_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Portfolio data updated successfully!")
        print(f"  Saved to: {output_file}")
        print(f"  Last updated: {portfolio_data['last_updated']}")
        
        return True
    
    except Exception as e:
        print(f"✗ Error updating portfolio data: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    update_portfolio_data()
