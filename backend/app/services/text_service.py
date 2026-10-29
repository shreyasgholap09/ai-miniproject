from typing import Optional
import numpy as np
from app.core.config import settings

class TextEmbeddingService:
    _instance: Optional["TextEmbeddingService"] = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            # Load pretrained MiniLM model
            self._model = SentenceTransformer(settings.AI_TEXT_MODEL)
        return self._model

    def build_text_prompt(
        self, 
        title: str, 
        category: str, 
        color: str, 
        description: str,
        location_name: Optional[str] = None
    ) -> str:
        """Constructs an information-rich string representation for semantic encoding."""
        parts = [
            f"Item: {title}",
            f"Category: {category}",
            f"Color: {color}",
            f"Description: {description}"
        ]
        if location_name:
            parts.append(f"Near: {location_name}")
        return " | ".join(parts)

    def generate_embedding(self, text: str) -> list[float]:
        """Generates a 384-dimensional dense semantic embedding."""
        if not text or not text.strip():
            return [0.0] * 384

        embedding = self.model.encode(text.strip(), normalize_embeddings=True)
        return embedding.tolist()

text_service = TextEmbeddingService()
