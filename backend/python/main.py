# TEST BACKEND IMPLEMENTATION
from http.client import HTTPException
from tracemalloc import start
from typing import Optional
from vital.client import Vital
from vital.environment import VitalEnvironment
from vital.types.lab_test_collection_method import LabTestCollectionMethod
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse, Response
import io
load_dotenv()

app = FastAPI()
VITAL_API_KEY = os.getenv("VITAL_API_KEY")
VITAL_ENVIRONMENT = os.getenv("VITAL_ENV")

if VITAL_ENVIRONMENT == "sandbox":
    vital_env = VitalEnvironment.SANDBOX
elif VITAL_ENVIRONMENT == "production":
    vital_env = VitalEnvironment.PRODUCTION

client = Vital(api_key=VITAL_API_KEY, environment=vital_env)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://0.0.0.0:3000",
        "http://frontend:3000",  # Docker service name if applicable
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/token/{user_id}")
def get_token(user_id: str):
    return client.link.token(user_id=user_id)


class CreateUserData(BaseModel):
    client_user_id: str


@app.post("/user/")
def create_user(data: CreateUserData):
    return client.user.create(client_user_id=data.client_user_id)


@app.get("/users/")
def get_users():
    return client.user.get_all()


@app.get("/summary/{data_type}/{user_id}")
def get_users(data_type: str, user_id: str, start_date: str, end_date: str):
    func_map = {
        "sleep": client.sleep.get,
        "activity": client.activity.get,
        "body": client.body.get,
        "workouts": client.workouts.get,
    }
    func = func_map.get(data_type)
    if not func:
        raise HTTPException(400, "Failed to find data type")
    data = func(user_id=user_id, start_date=start_date, end_date=end_date)
    return data


@app.get("/summary/{user_id}")
def get_users(user_id: str, start_date: str, end_date: str):
    sleep = client.sleep.get(user_id=user_id, start_date=start_date, end_date=end_date)
    activity = client.activity.get(user_id=user_id, start_date=start_date, end_date=end_date)
    body = client.body.get(user_id=user_id, start_date=start_date, end_date=end_date)
    workouts = client.workouts.get(user_id=user_id, start_date=start_date, end_date=end_date)
    return {"sleep": sleep, "activity": activity, "body": body, "workouts": workouts}


@app.get("/tests/")
def get_tests():
    return client.lab_tests.get()


@app.post("/tests/")
def create_test(data: dict):
    name = data["name"]
    method = data["method"]
    marker_ids = data["marker_ids"]
    method_mapping = {
        "testkit": LabTestCollectionMethod.TESTKIT,
        "walk_in_test": LabTestCollectionMethod.WALK_IN_TEST,
        "at_home_phlebotomy": LabTestCollectionMethod.AT_HOME_PHLEBOTOMY,
    }
    return client.lab_tests.create(name=name, description='', method=method_mapping[method], marker_ids=marker_ids)


@app.get("/markers/")
def get_markers(lab_id: Optional[int] = None):
    if lab_id:
        return client.lab_tests.get_markers(lab_id=lab_id)
    else:
        return client.lab_tests.get_markers()


@app.get("/tests/markers/{lab_test_id}/")
def get_markers_for_lab_test(lab_test_id: str):
    return client.lab_tests.get_markers_for_lab_test(lab_test_id=lab_test_id)


@app.get("/orders/")
def get_orders():
    return client.lab_tests.get_orders()


@app.post("/orders/")
def create_order(data: dict):
    return client.lab_tests.create_order(
        user_id=data["user_id"],
        patient_details=data["patient_details"],
        patient_address=data["patient_address"],
        order_set={"lab_test_ids": [data["lab_test_id"]]},
        collection_method=data["collection_method"]
    )


@app.post("/orders/{order_id}/cancel/")
def cancel_order(order_id: str):
    return client.lab_tests.cancel_order(order_id=order_id)


@app.get("/labs/")
def get_labs():
    return client.lab_tests.get_labs()


@app.get("/orders/{order_id}/results/pdf/")
def get_order_pdf(order_id: str):
    try:
        pdf_chunks = client.lab_tests.get_result_pdf(order_id=order_id)
        pdf_data = b''.join(list(pdf_chunks))
        
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="lab-results-{order_id}.pdf"'
            }
        )
    except Exception as e:
        # Let's also log the actual error to help debug
        print(f"Error fetching PDF: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
