import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from app.config import settings
from app.db import db_instance
from app.routes.analyzer import extractor
from app.model.train import train_model
from app.routes import auth, analyzer, documents, dashboard, monitoring, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("Initializing Financial News Entity Extraction System...")
    
    # 1. Connect to Database (MongoDB with JSON fallback)
    await db_instance.connect()
    
    # 2. Check and boot-strap Model
    model_dir = "app/model_data"
    weights_path = os.path.join(model_dir, "ner_weights.pth")
    vocab_path = os.path.join(model_dir, "vocab.json")
    
    if not os.path.exists(weights_path) or not os.path.exists(vocab_path):
        print("Transformer weights or vocabulary not found. Training model from scratch...")
        try:
            train_model(model_dir=model_dir, num_epochs=12, batch_size=32)
        except Exception as e:
            print(f"ERROR: Model training failed on startup: {e}")
    else:
        print("Transformer model weights and vocabulary found.")
        
    # 3. Load model parameters into EntityExtractor
    success = extractor.load_model()
    if success:
        print("Transformer NER model successfully loaded and active.")
    else:
        print("WARNING: Transformer NER model failed to load. Predict calls will return empty results.")
        
    yield
    # Shutdown actions
    print("Shutting down Financial News Entity Extraction System...")

app = FastAPI(
    title="Financial News Entity Extraction API",
    description="Enterprise-grade Named Entity Recognition platform for unstructured financial intelligence.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(analyzer.router)
app.include_router(documents.router)
app.include_router(dashboard.router)
app.include_router(monitoring.router)
app.include_router(admin.router)

# Chatbot Request Schema
class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Financial News Entity Extraction Engine",
        "model": "Scratch-Trained Transformer Encoder (NER)",
        "framework": "FastAPI + PyTorch"
    }

@app.post("/api/chatbot")
async def chat_assistant(chat_in: ChatMessage):
    msg = chat_in.message.strip().lower()
    if not msg:
        raise HTTPException(status_code=400, detail="Empty chat message")
        
    # Generate intelligent conversational replies from our financial assistant
    response = ""
    
    if "help" in msg or "what can you do" in msg:
        response = (
            "I am the FinNews AI Assistant. I can help you analyze financial news, headlines, and documents. "
            "Here is what I can do:\n"
            "1. **Extract Entities**: Paste a sentence, and I will highlight Companies (ORG), Tickers (TICKER), Money Values (MONEY), Events (EVENT), and Dates (DATE).\n"
            "2. **Parse Documents**: Go to the 'Document Analyzer' and drag in PDF, DOCX, TXT, or CSV reports.\n"
            "3. **Query Definitions**: Ask me things like 'What is ORG?' or 'Explain the Transformer architecture'."
        )
    elif "org" in msg or "company" in msg:
        response = (
            "**ORG** stands for Organization/Company. In financial analysis, extracting ORG names (like *Tesla*, *Apple*, or *JPMorgan*) "
            "helps link news events to specific corporate portfolios."
        )
    elif "ticker" in msg or "stock" in msg:
        response = (
            "**TICKER** refers to the unique stock exchange symbol assigned to a public company (like *TSLA* for Tesla, *AAPL* for Apple). "
            "Locating tickers connects unstructured text datasets with live market data systems."
        )
    elif "money" in msg or "value" in msg or "price" in msg:
        response = (
            "**MONEY** extracts cash terms, transaction sizes, or stock price values (such as *$5 billion*, *£80M*, or *€150 per share*). "
            "This lets analysts extract Deal valuations and revenue reports instantly."
        )
    elif "event" in msg or "acquisition" in msg or "merger" in msg:
        response = (
            "**EVENT** identifies core corporate milestones (like *merger*, *acquisition*, *earnings report*, *stock split*, or *share buyback*). "
            "These represent significant signals that drive stock price volatility."
        )
    elif "transformer" in msg or "architecture" in msg or "model" in msg:
        response = (
            "This platform runs a **Transformer-based Encoder model** built entirely from scratch in PyTorch. "
            "It tokenizes input text, applies multi-head self-attention to calculate contextual relevance between words, "
            "and runs token classification via a linear feedforward head to output BIO tags."
        )
    elif "analyze" in msg:
        # Check if they pasted text after analyze
        text_to_analyze = chat_in.message.replace("analyze", "").strip()
        if text_to_analyze:
            if not extractor.model:
                extractor.load_model()
            prediction = extractor.predict(text_to_analyze)
            ents = prediction["entities"]
            if ents:
                ent_list = "\n".join([f"- **{e['text']}** → `{e['type']}` (Confidence: {e['confidence']:.2%})" for e in ents])
                response = f"I analyzed that text! Here are the entities extracted:\n{ent_list}"
            else:
                response = "I analyzed that text, but I did not find any financial entities. Try typing something with companies, tickers, dates, or dollar amounts!"
        else:
            response = "Sure, type 'analyze <your financial statement>' and I will parse it for you!"
    else:
        response = (
            "I received your inquiry. I am optimized for financial intelligence! You can ask me to "
            "explain the financial labels (ORG, TICKER, EVENT, DATE, MONEY), describe the custom Transformer NER architecture, "
            "or type 'analyze [headline]' to execute the model."
        )
        
    return {"reply": response}
