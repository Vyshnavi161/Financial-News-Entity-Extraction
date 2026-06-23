import re
import json
import os
from typing import List, Dict, Union

class FinanceTokenizer:
    def __init__(self, max_len: int = 128):
        self.max_len = max_len
        self.word2idx: Dict[str, int] = {"<PAD>": 0, "<UNK>": 1}
        self.idx2word: Dict[int, str] = {0: "<PAD>", 1: "<UNK>"}
        # Splitting regex: words, numbers, punctuation, currencies, decimals, etc.
        self.token_pattern = re.compile(r"(\$|€|£|¥|\d+(?:\.\d+)?%?|\w+|[^\w\s])")

    def tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        # Find all matches
        tokens = self.token_pattern.findall(text)
        return [t for t in tokens if t.strip()]

    def fit_on_texts(self, texts: List[str]):
        for text in texts:
            tokens = self.tokenize(text)
            for token in tokens:
                if token not in self.word2idx:
                    idx = len(self.word2idx)
                    self.word2idx[token] = idx
                    self.idx2word[idx] = token

    def encode(self, text: str) -> List[int]:
        tokens = self.tokenize(text)
        ids = []
        for token in tokens:
            ids.append(self.word2idx.get(token, self.word2idx["<UNK>"]))
        
        # Padding or truncation
        if len(ids) < self.max_len:
            ids = ids + [self.word2idx["<PAD>"]] * (self.max_len - len(ids))
        else:
            ids = ids[:self.max_len]
        return ids

    def decode(self, ids: List[int]) -> List[str]:
        tokens = []
        for idx in ids:
            token = self.idx2word.get(idx, "<UNK>")
            if token == "<PAD>":
                break
            tokens.append(token)
        return tokens

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        data = {
            "max_len": self.max_len,
            "word2idx": self.word2idx,
            "idx2word": {str(k): v for k, v in self.idx2word.items()}
        }
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def load(cls, filepath: str) -> "FinanceTokenizer":
        with open(filepath, "r") as f:
            data = json.load(f)
        
        tokenizer = cls(max_len=data["max_len"])
        tokenizer.word2idx = data["word2idx"]
        tokenizer.idx2word = {int(k): v for k, v in data["idx2word"].items()}
        return tokenizer
