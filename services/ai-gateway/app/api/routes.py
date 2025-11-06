from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..core.config import Settings, get_settings
from ..models.chat import ChatRequest


router = APIRouter(prefix="/api/v1", tags=["chat"])


def ensure_authorized(request: Request, settings: Settings) -> None:
    if not settings.gateway_api_key:
        return

    provided = request.headers.get("X-API-Key") or request.headers.get("x-api-key")
    if provided != settings.gateway_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid gateway API key")


@router.post("/chat/completions")
async def create_chat_completion(
    chat_request: ChatRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    ensure_authorized(request, settings)

    # Placeholder implementation. Phase 4 will provide provider-aware routing,
    # key rotation, and streaming responses.
    return {
        "status": "pending",
        "message": "Chat completion pipeline not implemented yet.",
        "provider": chat_request.provider,
    }
