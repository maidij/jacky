from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import *
from app.routers import *

app = FastAPI(title="宠物管理系统 API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(pets_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(transports_router)
app.include_router(fosters_router)
app.include_router(health_router)
app.include_router(community_router)
app.include_router(favorites_router)
app.include_router(appointments_router)
app.include_router(notifications_router)
app.include_router(addresses_router)
app.include_router(payments_router)
app.include_router(stats_router)
app.include_router(users_router)


@app.get("/")
def read_root():
    return {"message": "宠物管理系统 API", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
