from app.routers.auth import router as auth_router
from app.routers.pets import router as pets_router
from app.routers.cart import router as cart_router
from app.routers.orders import router as orders_router
from app.routers.reviews import router as reviews_router
from app.routers.transports import router as transports_router
from app.routers.fosters import router as fosters_router
from app.routers.health import router as health_router
from app.routers.community import router as community_router
from app.routers.favorites import router as favorites_router
from app.routers.appointments import router as appointments_router
from app.routers.notifications import router as notifications_router
from app.routers.addresses import router as addresses_router
from app.routers.payments import router as payments_router
from app.routers.stats import router as stats_router
from app.routers.users import router as users_router

__all__ = [
    "auth_router",
    "pets_router",
    "cart_router",
    "orders_router",
    "reviews_router",
    "transports_router",
    "fosters_router",
    "health_router",
    "community_router",
    "favorites_router",
    "appointments_router",
    "notifications_router",
    "addresses_router",
    "payments_router",
    "stats_router",
    "users_router",
]
