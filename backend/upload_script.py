import requests
import os

BASE_URL = 'http://127.0.0.1:8000/api'
USERNAME = 'analyst'
PASSWORD = 'password123'

def main():
    print("Logging in...")
    login_url = f"{BASE_URL}/auth/token/"
    res = requests.post(login_url, json={"username": USERNAME, "password": PASSWORD})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    
    token = res.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}
    
    workspace = r"c:\Users\nihar\OneDrive\Desktop\breathe-esg-assignment"
    
    # 1. SAP Upload
    sap_file = os.path.join(workspace, "sap_test_upload.csv")
    if os.path.exists(sap_file):
        print("Uploading SAP data...")
        with open(sap_file, "rb") as f:
            r = requests.post(f"{BASE_URL}/upload/sap/", files={"file": f}, headers=headers)
            print(f"SAP status: {r.status_code}, response: {r.json()}")
            
    # 2. Utility Upload
    utility_file = os.path.join(workspace, "utility_test_upload.csv")
    if os.path.exists(utility_file):
        print("Uploading Utility data...")
        with open(utility_file, "rb") as f:
            r = requests.post(f"{BASE_URL}/upload/utility/", files={"file": f}, headers=headers)
            print(f"Utility status: {r.status_code}, response: {r.json()}")
            
    # 3. Travel Upload
    travel_file = os.path.join(workspace, "travel_test_upload.json")
    if os.path.exists(travel_file):
        print("Uploading Travel data...")
        with open(travel_file, "rb") as f:
            r = requests.post(f"{BASE_URL}/upload/travel/", files={"file": f}, headers=headers)
            print(f"Travel status: {r.status_code}, response: {r.json()}")

if __name__ == "__main__":
    main()
