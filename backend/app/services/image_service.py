import os
from pathlib import Path
from typing import Optional
from PIL import Image
from app.core.config import settings

class ImageEmbeddingService:
    _instance: Optional["ImageEmbeddingService"] = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            # Load pretrained CLIP visual encoder
            self._model = SentenceTransformer(settings.AI_IMAGE_MODEL)
        return self._model

    def generate_embedding_from_file(self, relative_image_url: Optional[str]) -> Optional[list[float]]:
        """
        Loads the image from local storage and encodes it into a 512-dimensional CLIP embedding.
        Returns None if image does not exist or fails to open.
        """
        if not relative_image_url:
            return None

        # Resolve to physical path
        filename = os.path.basename(relative_image_url)
        physical_path = settings.UPLOAD_PATH / filename

        if not physical_path.exists():
            return None

        try:
            image = Image.open(physical_path).convert("RGB")
            embedding = self.model.encode(image, normalize_embeddings=True)
            return embedding.tolist()
        except Exception as e:
            print(f"[ImageService] Warning: Failed to extract visual embedding for {physical_path}: {e}")
            return None

image_service = ImageEmbeddingService()
