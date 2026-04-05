import json
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

os.makedirs("results/charts", exist_ok=True)

# ── Load all metrics ──────────────────────────────────────────────
with open("results/centralized_metrics.json")  as f: cent   = json.load(f)
with open("results/federated_metrics.json")    as f: fed    = json.load(f)
with open("results/federated_rounds.json")     as f: rounds = json.load(f)
with open("results/single_h1_metrics.json")    as f: h1     = json.load(f)
with open("results/single_h2_metrics.json")    as f: h2     = json.load(f)

labels   = ["Hospital 1\nOnly\n(Cleveland)", "Hospital 2\nOnly\n(Hungarian)",
            "Federated\n(FedAvg)", "Centralized\n(Baseline)"]
accuracy  = [h1["accuracy"],  h2["accuracy"],  fed["accuracy"],  cent["accuracy"]]
precision = [h1["precision"], h2["precision"], fed["precision"], cent["precision"]]
recall    = [h1["recall"],    h2["recall"],    fed["recall"],    cent["recall"]]
f1        = [h1["f1_score"],  h2["f1_score"],  fed["f1_score"],  cent["f1_score"]]

COLORS = ["#e07b54", "#e8b84b", "#5b9bd5", "#5cb85c"]
plt.rcParams.update({"font.family": "DejaVu Sans", "axes.spines.top": False,
                     "axes.spines.right": False})

# ── Chart 1: Accuracy vs F1 side-by-side ─────────────────────────
fig, ax = plt.subplots(figsize=(10, 6))
x = np.arange(len(labels))
w = 0.35
bars1 = ax.bar(x - w/2, accuracy, w, label="Accuracy", color="#5b9bd5", alpha=0.9)
bars2 = ax.bar(x + w/2, f1,       w, label="F1 Score",  color="#e07b54", alpha=0.9)

for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=9)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=9)

ax.set_xticks(x); ax.set_xticklabels(labels, fontsize=10)
ax.set_ylim(0, 1.0); ax.set_ylabel("Score"); ax.set_title("Accuracy vs F1 Score by Approach", fontweight="bold")
ax.legend(); ax.yaxis.grid(True, linestyle="--", alpha=0.5); ax.set_axisbelow(True)
plt.tight_layout()
plt.savefig("results/charts/accuracy_vs_f1.png", dpi=150)
plt.close()
print("Saved: accuracy_vs_f1.png")

# ── Chart 2: All 4 metrics comparison ────────────────────────────
metrics_data = [accuracy, precision, recall, f1]
metric_names = ["Accuracy", "Precision", "Recall", "F1 Score"]

fig, axes = plt.subplots(1, 4, figsize=(18, 5), sharey=True)
fig.suptitle("Model Performance Comparison Across Approaches", fontweight="bold", fontsize=13)

for i, (ax, data, name) in enumerate(zip(axes, metrics_data, metric_names)):
    bars = ax.bar(range(len(labels)), data, color=COLORS, alpha=0.9, width=0.6)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
                f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=8)
    ax.set_title(name, fontweight="bold")
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=7.5)
    ax.set_ylim(0, 1.0)
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

plt.tight_layout()
plt.savefig("results/charts/comparison_bar.png", dpi=150)
plt.close()
print("Saved: comparison_bar.png")

# ── Chart 3: Federated rounds ─────────────────────────────────────
round_nums  = [m["round"]    for m in rounds]
round_acc   = [m["accuracy"] for m in rounds]
round_f1    = [m["f1_score"] for m in rounds]

fig, ax = plt.subplots(figsize=(12, 6))
ax.plot(round_nums, round_acc, "o-", color="#5b9bd5", label="Federated Accuracy",  linewidth=2, markersize=5)
ax.plot(round_nums, round_f1,  "s-", color="#e07b54", label="Federated F1 Score",  linewidth=2, markersize=5)
ax.axhline(y=cent["accuracy"], color="#5cb85c", linestyle="--", linewidth=1.5,
           label=f"Centralized Accuracy (benchmark = {cent['accuracy']})")

ax.set_xlabel("Communication Round"); ax.set_ylabel("Score")
ax.set_title("Federated Learning — Performance Across Rounds", fontweight="bold")
ax.set_xticks(round_nums)
ax.set_ylim(0.5, 1.0)
ax.legend(); ax.yaxis.grid(True, linestyle="--", alpha=0.5); ax.set_axisbelow(True)
ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False)
plt.tight_layout()
plt.savefig("results/charts/federated_rounds.png", dpi=150)
plt.close()
print("Saved: federated_rounds.png")

print("\nAll charts saved to results/charts/")
