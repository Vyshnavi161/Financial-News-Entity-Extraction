from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.auth import get_current_user
from app.routes.analyzer import extractor
from app.services.news_service import NewsStreamService

router = APIRouter(prefix="/api/monitoring", tags=["Real-time Monitoring"])

@router.get("/news")
async def get_monitoring_feed(current_user: Dict[str, Any] = Depends(get_current_user)):
    # Retrieve simulated news list
    news_items = NewsStreamService.get_latest_news()
    
    # Process entities dynamically for each item to show true AI monitoring
    processed_feed = []
    
    if not extractor.model:
        extractor.load_model()
        
    for item in news_items:
        prediction = extractor.predict(item["content"])
        item_copy = dict(item)
        item_copy["entities"] = prediction["entities"]
        item_copy["overall_confidence"] = prediction["overall_confidence"]
        processed_feed.append(item_copy)
        
    return processed_feed

@router.get("/pulse")
async def get_pulse_event(current_user: Dict[str, Any] = Depends(get_current_user)):
    # Generate a single fresh news event
    news_item = NewsStreamService.generate_random_news()
    
    if not extractor.model:
        extractor.load_model()
        
    prediction = extractor.predict(news_item["content"])
    news_item["entities"] = prediction["entities"]
    news_item["overall_confidence"] = prediction["overall_confidence"]
    
    return news_item
