import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import os
import json
from typing import List, Dict, Any, Tuple
from app.model.tokenizer import FinanceTokenizer

# Define the label mappings
LABEL_MAP = {
    "O": 0,
    "B-ORG": 1,
    "I-ORG": 2,
    "B-TICKER": 3,
    "I-TICKER": 4,
    "B-MONEY": 5,
    "I-MONEY": 6,
    "B-EVENT": 7,
    "I-EVENT": 8,
    "B-DATE": 9,
    "I-DATE": 10
}
REV_LABEL_MAP = {v: k for k, v in LABEL_MAP.items()}

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        self.num_heads = num_heads
        self.d_model = d_model
        assert d_model % num_heads == 0
        self.depth = d_model // num_heads

        self.wq = nn.Linear(d_model, d_model)
        self.wk = nn.Linear(d_model, d_model)
        self.wv = nn.Linear(d_model, d_model)

        self.dense = nn.Linear(d_model, d_model)

    def split_heads(self, x: torch.Tensor, batch_size: int) -> torch.Tensor:
        # x shape: (batch_size, seq_len, d_model)
        x = x.view(batch_size, -1, self.num_heads, self.depth)
        # return shape: (batch_size, num_heads, seq_len, depth)
        return x.transpose(1, 2)

    def forward(self, q: torch.Tensor, k: torch.Tensor, v: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        batch_size = q.size(0)

        q = self.split_heads(self.wq(q), batch_size)
        k = self.split_heads(self.wk(k), batch_size)
        v = self.split_heads(self.wv(v), batch_size)

        # Scale dot-product attention
        matmul_qk = torch.matmul(q, k.transpose(-1, -2))
        dk = k.size(-1)
        scaled_attention_logits = matmul_qk / math.sqrt(dk)

        if mask is not None:
            # Mask should be shape compatible with (batch_size, num_heads, seq_len, seq_len)
            scaled_attention_logits += (mask * -1e9)

        attention_weights = F.softmax(scaled_attention_logits, dim=-1)
        output = torch.matmul(attention_weights, v)

        # Transpose back and concatenate
        output = output.transpose(1, 2).contiguous()
        concat_attention = output.view(batch_size, -1, self.d_model)

        return self.dense(concat_attention)

class TransformerBlock(nn.Module):
    def __init__(self, d_model: int, num_heads: int, d_ff: int, rate: float = 0.1):
        super().__init__()
        self.mha = MultiHeadAttention(d_model, num_heads)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model)
        )
        self.layernorm1 = nn.LayerNorm(d_model, eps=1e-6)
        self.layernorm2 = nn.LayerNorm(d_model, eps=1e-6)
        self.dropout1 = nn.Dropout(rate)
        self.dropout2 = nn.Dropout(rate)

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        attn_output = self.mha(x, x, x, mask)
        attn_output = self.dropout1(attn_output)
        out1 = self.layernorm1(x + attn_output)

        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output)
        out2 = self.layernorm2(out1 + ffn_output)
        return out2

class TransformerNERModel(nn.Module):
    def __init__(self, vocab_size: int, num_classes: int, d_model: int = 128, 
                 num_heads: int = 4, d_ff: int = 256, num_layers: int = 2, max_len: int = 128):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, d_model)
        
        # Learnable Positional Embeddings
        self.pos_emb = nn.Embedding(max_len, d_model)
        
        self.layers = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff) for _ in range(num_layers)
        ])
        
        self.fc = nn.Linear(d_model, num_classes)
        self.max_len = max_len

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        seq_len = x.size(1)
        positions = torch.arange(0, seq_len, device=x.device).unsqueeze(0)
        
        out = self.token_emb(x) + self.pos_emb(positions)
        
        for layer in self.layers:
            out = layer(out, mask)
            
        logits = self.fc(out)
        return logits

class EntityExtractor:
    def __init__(self, model_dir: str):
        self.model_dir = model_dir
        self.tokenizer_path = os.path.join(model_dir, "vocab.json")
        self.weights_path = os.path.join(model_dir, "ner_weights.pth")
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self) -> bool:
        if not os.path.exists(self.tokenizer_path) or not os.path.exists(self.weights_path):
            return False
        
        try:
            self.tokenizer = FinanceTokenizer.load(self.tokenizer_path)
            vocab_size = len(self.tokenizer.word2idx)
            
            self.model = TransformerNERModel(
                vocab_size=vocab_size,
                num_classes=len(LABEL_MAP),
                max_len=self.tokenizer.max_len
            )
            
            # Load weights
            state_dict = torch.load(self.weights_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()
            return True
        except Exception as e:
            print(f"Error loading model weights: {e}")
            return False

    def predict(self, text: str) -> Dict[str, Any]:
        if not self.model or not self.tokenizer:
            # Return basic empty output if model not loaded
            return {"tokens": [], "entities": [], "confidence_scores": []}

        tokens = self.tokenizer.tokenize(text)
        if not tokens:
            return {"tokens": [], "entities": [], "confidence_scores": []}

        # Encode and prepare input tensor
        encoded = self.tokenizer.encode(text)
        input_tensor = torch.tensor([encoded], dtype=torch.long, device=self.device)

        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = F.softmax(logits, dim=-1)
            predictions = torch.argmax(probs, dim=-1)[0].cpu().numpy()
            probs = probs[0].cpu().numpy()

        predicted_labels = []
        confidences = []
        
        # We only care about prediction up to length of tokens
        n_tokens = min(len(tokens), self.tokenizer.max_len)
        for i in range(n_tokens):
            pred_idx = predictions[i]
            label = REV_LABEL_MAP.get(pred_idx, "O")
            confidence = float(probs[i][pred_idx])
            predicted_labels.append(label)
            confidences.append(confidence)

        # Parse labels into structured entities (ORG, TICKER, MONEY, EVENT, DATE)
        entities = []
        current_entity = None

        for idx, (token, label) in enumerate(zip(tokens[:n_tokens], predicted_labels)):
            conf = confidences[idx]
            if label == "O":
                if current_entity:
                    entities.append(current_entity)
                    current_entity = None
            elif label.startswith("B-"):
                if current_entity:
                    entities.append(current_entity)
                ent_type = label.split("-")[1]
                current_entity = {
                    "text": token,
                    "type": ent_type,
                    "start_idx": idx,
                    "end_idx": idx,
                    "confidence": conf
                }
            elif label.startswith("I-"):
                ent_type = label.split("-")[1]
                if current_entity and current_entity["type"] == ent_type:
                    current_entity["text"] += " " + token
                    current_entity["end_idx"] = idx
                    current_entity["confidence"] = min(current_entity["confidence"], conf) # minimum token confidence
                else:
                    if current_entity:
                        entities.append(current_entity)
                    current_entity = {
                        "text": token,
                        "type": ent_type,
                        "start_idx": idx,
                        "end_idx": idx,
                        "confidence": conf
                    }
        
        if current_entity:
            entities.append(current_entity)

        # Build token classification output
        token_results = []
        for idx, (token, label) in enumerate(zip(tokens[:n_tokens], predicted_labels)):
            token_results.append({
                "text": token,
                "label": label,
                "confidence": confidences[idx]
            })

        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 1.0

        return {
            "tokens": token_results,
            "entities": entities,
            "overall_confidence": avg_confidence
        }
