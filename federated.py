import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import copy
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import json, os

os.makedirs("results", exist_ok=True)

feature_cols = ["age","sex","cp","trestbps","chol",
                "fbs","restecg","thalach","exang","oldpeak"]

h1_train      = pd.read_csv("data/processed/h1_train.csv")
h2_train      = pd.read_csv("data/processed/h2_train.csv")
combined_test = pd.read_csv("data/processed/combined_test.csv")

X1 = torch.tensor(h1_train[feature_cols].values, dtype=torch.float32)
y1 = torch.tensor(h1_train["label"].values, dtype=torch.float32)
X2 = torch.tensor(h2_train[feature_cols].values, dtype=torch.float32)
y2 = torch.tensor(h2_train["label"].values, dtype=torch.float32)
X_test = torch.tensor(combined_test[feature_cols].values, dtype=torch.float32)
y_test = combined_test["label"].values

n1, n2 = len(y1), len(y2)

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

def local_train(global_state, X, y, epochs=50, lr=0.001):
    """Clone global model, train locally, return updated state dict."""
    model = MLP()
    model.load_state_dict(copy.deepcopy(global_state))
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.BCELoss()
    model.train()
    for _ in range(epochs):
        optimizer.zero_grad()
        loss = criterion(model(X), y)
        loss.backward()
        optimizer.step()
    return model.state_dict()

def fedavg(state1, state2, n1, n2):
    """Weighted average of two state dicts."""
    total = n1 + n2
    averaged = {}
    for key in state1:
        averaged[key] = (state1[key] * n1 + state2[key] * n2) / total
    return averaged

def evaluate(state, X, y_true):
    model = MLP()
    model.load_state_dict(state)
    model.eval()
    with torch.no_grad():
        y_pred = (model(X).numpy() >= 0.5).astype(int)
    return {
        "accuracy":  round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall":    round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1_score":  round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }

# --- Initialise global model ---
torch.manual_seed(42)
global_model = MLP()
global_state = global_model.state_dict()

ROUNDS = 20
round_metrics = []

print("=== Federated Training (FedAvg) — Cleveland + Hungarian ===\n")

for r in range(1, ROUNDS + 1):
    state1 = local_train(global_state, X1, y1)
    state2 = local_train(global_state, X2, y2)
    global_state = fedavg(state1, state2, n1, n2)

    metrics = evaluate(global_state, X_test, y_test)
    metrics["round"] = r
    round_metrics.append(metrics)
    print(f"Round {r:02d} | Acc: {metrics['accuracy']} | Prec: {metrics['precision']} | Rec: {metrics['recall']} | F1: {metrics['f1_score']}")

final = round_metrics[-1]
final_metrics = {"approach": "federated",
                 **{k: final[k] for k in ["accuracy","precision","recall","f1_score"]}}

print("\n=== Final Federated Model ===")
for k, v in final_metrics.items(): print(f"  {k}: {v}")

with open("results/federated_metrics.json", "w") as f: json.dump(final_metrics, f, indent=2)
with open("results/federated_rounds.json",  "w") as f: json.dump(round_metrics,  f, indent=2)
print("\nSaved.")
