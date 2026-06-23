from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.auth import get_current_user
from app.db import get_collection
from app.model.ner_model import EntityExtractor

router = APIRouter(prefix="/api/analyzer", tags=["NER News Analyzer"])

# Single global instance of extractor loaded on router load
extractor = EntityExtractor("app/model_data")
extractor.load_model()

class TextAnalysisRequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze_text(req: TextAnalysisRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    # If model is not loaded (first launch training is pending), attempt loading again
    if not extractor.model:
        extractor.load_model()

    prediction = extractor.predict(req.text)
    
    # Save to user history
    history_col = get_collection("history")
    analysis_record = {
        "user_id": current_user["username"],
        "source_type": "news",
        "text": req.text,
        "entities": prediction["entities"],
        "tokens": prediction["tokens"],
        "overall_confidence": prediction["overall_confidence"],
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    result = await history_col.insert_one(analysis_record)
    analysis_record["_id"] = result.inserted_id
    
    return {
        "id": str(result.inserted_id),
        "entities": prediction["entities"],
        "tokens": prediction["tokens"],
        "overall_confidence": prediction["overall_confidence"]
    }

@router.get("/history")
async def get_history(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    history_col = get_collection("history")
    
    # Filtering query
    query = {"user_id": current_user["username"]}
    if search:
        query["text"] = {"$regex": search, "$options": "i"}
        
    total_records = await history_col.count_documents(query)
    
    skip = (page - 1) * limit
    cursor = history_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list()
    
    # Clean item dicts for JSON serialization
    for item in items:
        item["id"] = str(item.pop("_id"))
        
    return {
        "total": total_records,
        "page": page,
        "limit": limit,
        "items": items
    }

@router.delete("/history/{record_id}")
async def delete_history_item(record_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    history_col = get_collection("history")
    
    # Ensure ownership before deleting
    record = await history_col.find_one({"_id": record_id, "user_id": current_user["username"]})
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")
        
    await history_col.delete_one({"_id": record_id})
    return {"message": "Analysis history item deleted successfully."}
