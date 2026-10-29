import os
import uuid
from pathlib import Path
from typing import Protocol
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from app.core.config import settings

class StorageService(Protocol):
    async def save_image(self, file: UploadFile) -> str:
        ...
    def delete_image(self, file_url: str) -> bool:
        ...

class LocalStorageService:
    def __init__(self, upload_dir: Path = settings.UPLOAD_PATH):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_image(self, file: UploadFile) -> str:
        # Validate MIME type
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )

        # Read content and validate file size
        contents = await file.read()
        max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE_MB}MB"
            )

        # Generate unique sanitized filename
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        destination_path = self.upload_dir / unique_filename

        # Write and optimize image using Pillow
        try:
            import io
            image = Image.open(io.BytesIO(contents))
            # Convert RGBA/P to RGB if saving as JPEG
            if image.mode in ("RGBA", "P") and ext in [".jpg", ".jpeg"]:
                image = image.convert("RGB")
            
            # Resize if dimensions exceed 1280px (preserves aspect ratio)
            image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
            image.save(destination_path, quality=85, optimize=True)
        except Exception as e:
            # Fallback to direct write if Pillow parse fails
            with open(destination_path, "wb") as f:
                f.write(contents)

        return f"/uploads/{unique_filename}"

    def delete_image(self, file_url: str) -> bool:
        try:
            filename = os.path.basename(file_url)
            file_path = self.upload_dir / filename
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False

# Global instance
storage_service = LocalStorageService()
