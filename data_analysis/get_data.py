import requests
from dotenv import load_dotenv
import os
from requests.exceptions import HTTPError

load_dotenv("etc/secrets/.env")
admin_email = os.environ.get("ADMIN_EMAIL")
admin_pwd = os.environ.get("ADMIN_PASSWORD")
# print(str(admin_email),str(admin_pwd))
def get_academic_data():
    # login_url = "https://bitwebapp-24.onrender.com/api/v1/users/login"
    admin_login_url = "https://bitwebapp-24.onrender.com/api/v1/admin/login"
    login_credentials = {
    "username":admin_email,
    "password":admin_pwd
    }

    try:
        response = requests.post(admin_login_url,json=login_credentials)
        response.raise_for_status()
        # print(response.status_code)
        # print(response.json())
    # print(response.json()["data"]["accessToken"])
    except requests.exceptions.HTTPError as e:
        error_status = response.status_code
        print(f"API Error ({error_status}): {e}")

    os.environ["accessToken"] = response.json()["data"]["accessToken"]
    # print(os.environ["accessToken"])

    getRecords_url = "https://bitwebapp-24.onrender.com/api/v1/academics/adminRecords"
    auth_header = {
    "Authorization" : f"Bearer {str(os.environ['accessToken'])}"
    }
    acad_data = requests.get(getRecords_url,headers=auth_header)
    # print(acad_data.json())
    print("data getting successful")

    # df cols = rollno name branch section sem1 ... sem8
    acad_data = acad_data.json()["data"]
    record_dict = {}
    for record in acad_data:
        if record["rollNumber"] not in record_dict:
            record_dict[record["rollNumber"]] = {}
            record_dict[record["rollNumber"]]["name"] = record["fullName"]
            record_dict[record["rollNumber"]]["userId"] = record["userId"]
            record_dict[record["rollNumber"]]["branch"] = record["branch"]
            record_dict[record["rollNumber"]]["section"] = record["section"]
        sem = "sem" + str(record["semester"])
        record_dict[record["rollNumber"]][sem] = record["gpa"]

    # print(record_dict["BTECH/10427/22"])
    return record_dict



