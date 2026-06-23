import os
import json
import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from app.config import settings

class MockCollection:
    def __init__(self, db_file: str, collection_name: str):
        self.db_file = db_file
        self.collection_name = collection_name
        self._lock = asyncio.Lock()

    def _read_data(self) -> Dict[str, Any]:
        if not os.path.exists(self.db_file):
            return {}
        try:
            with open(self.db_file, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_data(self, data: Dict[str, Any]):
        with open(self.db_file, "w") as f:
            json.dump(data, f, indent=2, default=str)

    async def insert_one(self, document: Dict[str, Any]):
        async with self._lock:
            data = self._read_data()
            if self.collection_name not in data:
                data[self.collection_name] = []
            
            doc_copy = dict(document)
            if "_id" not in doc_copy:
                doc_copy["_id"] = str(uuid.uuid4())
            
            data[self.collection_name].append(doc_copy)
            self._write_data(data)
            
            class InsertResult:
                def __init__(self, inserted_id):
                    self.inserted_id = inserted_id
            return InsertResult(doc_copy["_id"])

    async def find_one(self, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            data = self._read_data()
            items = data.get(self.collection_name, [])
            for item in items:
                match = True
                for k, v in filter.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    return dict(item)
            return None

    class AsyncCursor:
        def __init__(self, items: List[Dict[str, Any]]):
            self.items = items
            self._idx = 0

        def skip(self, n: int):
            self.items = self.items[n:]
            return self

        def limit(self, n: int):
            self.items = self.items[:n]
            return self

        def sort(self, key: str, direction: int = -1):
            reverse = direction == -1
            self.items = sorted(
                self.items, 
                key=lambda x: x.get(key, "") if x.get(key) is not None else "",
                reverse=reverse
            )
            return self

        async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
            if length is not None:
                return self.items[:length]
            return self.items

        def __aiter__(self):
            return self

        async def __anext__(self):
            if self._idx >= len(self.items):
                raise StopAsyncIteration
            item = self.items[self._idx]
            self._idx += 1
            return item

    def find(self, filter: Dict[str, Any] = None) -> AsyncCursor:
        data = self._read_data()
        items = data.get(self.collection_name, [])
        if not filter:
            return self.AsyncCursor([dict(i) for i in items])
        
        filtered = []
        for item in items:
            match = True
            for k, v in filter.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                filtered.append(dict(item))
        return self.AsyncCursor(filtered)

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        async with self._lock:
            data = self._read_data()
            items = data.get(self.collection_name, [])
            found = False
            
            set_fields = update.get("$set", {})
            
            for idx, item in enumerate(items):
                match = True
                for k, v in filter.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    found = True
                    for sk, sv in set_fields.items():
                        items[idx][sk] = sv
                    break
            
            if not found and upsert:
                new_doc = dict(filter)
                for sk, sv in set_fields.items():
                    new_doc[sk] = sv
                if "_id" not in new_doc:
                    new_doc["_id"] = str(uuid.uuid4())
                items.append(new_doc)
                
            data[self.collection_name] = items
            self._write_data(data)
            
            class UpdateResult:
                def __init__(self, matched_count, modified_count):
                    self.matched_count = 1 if found else 0
                    self.modified_count = 1 if found else 0
            return UpdateResult(1 if found else 0, 1 if found else 0)

    async def delete_one(self, filter: Dict[str, Any]):
        async with self._lock:
            data = self._read_data()
            items = data.get(self.collection_name, [])
            new_items = []
            deleted = False
            for item in items:
                match = True
                for k, v in filter.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match and not deleted:
                    deleted = True
                    continue
                new_items.append(item)
            data[self.collection_name] = new_items
            self._write_data(data)
            
            class DeleteResult:
                def __init__(self, deleted_count):
                    self.deleted_count = 1 if deleted else 0
            return DeleteResult(1 if deleted else 0)

    async def count_documents(self, filter: Dict[str, Any]) -> int:
        cursor = self.find(filter)
        return len(cursor.items)

class MockDBClient:
    def __init__(self, db_file: str = "local_db.json"):
        self.db_file = db_file
        
    def __getitem__(self, collection_name: str) -> MockCollection:
        return MockCollection(self.db_file, collection_name)

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_fallback = False

    async def connect(self):
        if not settings.MONGODB_URL:
            self._setup_fallback("No MongoDB URL specified.")
            return
        
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Ping database to verify connection
            await self.client.admin.command('ping')
            self.db = self.client.get_default_database()
            if self.db is None:
                self.db = self.client["financial_news_ner"]
            self.is_fallback = False
            print("Successfully connected to MongoDB.")
        except (ConnectionFailure, Exception) as e:
            self._setup_fallback(f"MongoDB connection failed: {str(e)}")

    def _setup_fallback(self, reason: str):
        print(f"WARNING: {reason} Falling back to local JSON database.")
        self.client = MockDBClient()
        self.db = self.client
        self.is_fallback = True

db_instance = Database()

def get_collection(name: str):
    return db_instance.db[name]
