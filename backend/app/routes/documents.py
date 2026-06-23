import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Dict, Any, List
from datetime import datetime
from app.auth import get_current_user
from app.db import get_collection
from app.routes.analyzer import extractor
from app.services.document_service import DocumentParser

router = APIRouter(prefix="/api/documents", tags=["Document NER Analyzer"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    # Supported files list
    allowed_extensions = {".pdf", ".docx", ".doc", ".txt", ".csv", ".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Supported extensions are: {', '.join(allowed_extensions)}"
        )

    # Save uploaded file to a temporary location
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"ner_upload_{datetime.utcnow().timestamp()}_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(temp_file_path)
        
        # Extract text
        extracted_text = DocumentParser.parse_file(temp_file_path)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="The document contains no extractable text.")
            
        # Run NER model predictions
        if not extractor.model:
            extractor.load_model()
            
        prediction = extractor.predict(extracted_text)
        
        # Save file metadata
        files_col = get_collection("files")
        file_record = {
            "user_id": current_user["username"],
            "filename": file.filename,
            "size": file_size,
            "content_type": file.content_type or ext.replace(".", ""),
            "status": "processed",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        file_res = await files_col.insert_one(file_record)
        file_id = str(file_res.inserted_id)
        
        # Save analysis history
        history_col = get_collection("history")
        analysis_record = {
            "user_id": current_user["username"],
            "source_type": "document",
            "file_id": file_id,
            "filename": file.filename,
            "text": extracted_text,
            "entities": prediction["entities"],
            "tokens": prediction["tokens"],
            "overall_confidence": prediction["overall_confidence"],
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        await history_col.insert_one(analysis_record)
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": file_size,
            "text": extracted_text,
            "entities": prediction["entities"],
            "tokens": prediction["tokens"],
            "overall_confidence": prediction["overall_confidence"]
        }
        
    except Exception as e:
        print(f"Error handling upload: {e}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/list")
async def list_documents(current_user: Dict[str, Any] = Depends(get_current_user)):
    files_col = get_collection("files")
    cursor = files_col.find({"user_id": current_user["username"]}).sort("created_at", -1)
    items = await cursor.to_list()
    
    for item in items:
        item["id"] = str(item.pop("_id"))
        
    return items

@router.delete("/delete/{file_id}")
async def delete_document(file_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    files_col = get_collection("files")
    history_col = get_collection("history")
    
    # Ensure ownership
    file_record = await files_col.find_one({"_id": file_id, "user_id": current_user["username"]})
    if not file_record:
        raise HTTPException(status_code=404, detail="Document metadata not found")
        
    await files_col.delete_one({"_id": file_id})
    # Clean up associated analysis records in history
    await history_col.delete_one({"file_id": file_id, "user_id": current_user["username"]})
    
    return {"message": "Document and associated entities logs deleted successfully."}
