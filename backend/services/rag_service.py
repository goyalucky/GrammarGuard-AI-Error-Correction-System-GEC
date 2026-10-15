# backend/services/rag_service.py
import os
import json
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models

class GrammarRAGService:
    def __init__(self):
        self.collection_name = os.getenv("QDRANT_COLLECTION_NAME", "grammar_rules")
        mode = os.getenv("QDRANT_MODE", "memory")
        
        # Initialize Qdrant Client (in-memory or networked)
        if mode == "memory":
            print("[*] Initializing Qdrant in-memory vector store...")
            self.client = QdrantClient(":memory:")
        else:
            host = os.getenv("QDRANT_HOST", "localhost")
            port = int(os.getenv("QDRANT_PORT", 6333))
            print(f"[*] Connecting to Qdrant at {host}:{port}...")
            self.client = QdrantClient(host=host, port=port)
            
        # Load embedding model
        model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        print(f"[*] Loading SentenceTransformer '{model_name}'...")
        self.encoder = SentenceTransformer(model_name)
        self.vector_size = self.encoder.get_sentence_embedding_dimension()
        
        self._setup_collection()
        self._seed_knowledge_base()

    def _setup_collection(self):
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.vector_size,
                    distance=models.Distance.COSINE
                )
            )
            print(f"[+] Qdrant collection '{self.collection_name}' created.")

    def _seed_knowledge_base(self):
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", "grammar_rules.json")
        if not os.path.exists(data_path):
            print(f"[!] Warning: Rule database not found at {data_path}")
            return
            
        with open(data_path, "r", encoding="utf-8") as f:
            rules: List[Dict[str, Any]] = json.load(f)
            
        points = []
        for idx, rule in enumerate(rules):
            # Rich document text representation for vector indexing
            text_to_embed = f"{rule['title']}: {rule['description']} Category: {rule['category']}"
            vector = self.encoder.encode(text_to_embed).tolist()
            
            points.append(
                models.PointStruct(
                    id=idx + 1,
                    vector=vector,
                    payload=rule
                )
            )
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        print(f"[+] Successfully indexed {len(points)} grammar rules into Qdrant.")

    def retrieve_rule(self, query: str, category_filter: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query_vector = self.encoder.encode(query).tolist()
        
        query_filter = None
        if category_filter:
            query_filter = models.Filter(
                must=[
                    models.FieldCondition(
                        key="category",
                        match=models.MatchValue(value=category_filter)
                    )
                ]
            )
            
        search_results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=1
        )
        
        if search_results and search_results[0].score > 0.35:
            return search_results[0].payload
        return None

# Singleton instance
rag_service = GrammarRAGService()