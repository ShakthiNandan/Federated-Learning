import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import json, os

os.makedirs("results", exist_ok=True)

feature_cols = ["age","sex","cp","trestbps","chol",
                "fbs","restecg","thalach","exang","oldpeak"]

h1_train      = pd.read_csv("data/processed/h1_train.csv")
h2_train      = pd.read_csv("data/processed/h2_train.csv")
combined_test = pd.read_csv("data/processed/combined_test.csv")
X_test  = torch.tensor(combined_test[feature_cols].values, dtype=torch.float32)
y_test  = combined_test["label"].values

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(10, 32), nn.ReLU(),
            nn.Linear(32, 16), nn.ReLU(),
            nn.Linear(16, 1),  nn.Sigmoid()
        )
    def forward(self, x):
        return self.net(x).squeeze()

def train_and_evaluate(X_train, y_train, label, seed=42):
    torch.manual_seed(seed)
    model = MLP()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.BCELoss()
    for _ in range(500):
        model.train()
        optimizer.zero_grad()
        loss = criterion(model(X_train), y_train)
        loss.backward()
        optimizer.step()
    model.eval()
    with torch.no_grad():
        y_pred = (model(X_test).numpy() >= 0.5).astype(int)
    return {
        "approach":  label,
        "accuracy":  round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall":    round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score":  round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
    }

X1 = torch.tensor(h1_train[feature_cols].values, dtype=torch.float32)
y1 = torch.tensor(h1_train["label"].values, dtype=torch.float32)
X2 = torch.tensor(h2_train[feature_cols].values, dtype=torch.float32)
y2 = torch.tensor(h2_train["label"].values, dtype=torch.float32)

m1 = train_and_evaluate(X1, y1, "single_hospital_1")
m2 = train_and_evaluate(X2, y2, "single_hospital_2")

print("=== Hospital 1 Only (Cleveland) ===")
for k, v in m1.items(): print(f"  {k}: {v}")
print("\n=== Hospital 2 Only (Hungarian) ===")
for k, v in m2.items(): print(f"  {k}: {v}")

with open("results/single_h1_metrics.json", "w") as f: json.dump(m1, f, indent=2)
with open("results/single_h2_metrics.json", "w") as f: json.dump(m2, f, indent=2)
print("\nSaved.")
