import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os

os.makedirs("data/processed", exist_ok=True)

all_cols = ["age","sex","cp","trestbps","chol","fbs","restecg",
            "thalach","exang","oldpeak","slope","ca","thal","target"]

# Features with good coverage in BOTH Cleveland and Hungarian
feature_cols = ["age","sex","cp","trestbps","chol",
                "fbs","restecg","thalach","exang","oldpeak"]

# --- Load ---
h1 = pd.read_csv("data/cleveland.data",  header=None, names=all_cols, na_values=["?", -9.0])
h2 = pd.read_csv("data/hungarian.data",  header=None, names=all_cols, na_values=["?", -9.0])

print(f"Cleveland raw shape:  {h1.shape}")
print(f"Hungarian raw shape:  {h2.shape}")

# --- Binarize target ---
h1["label"] = (h1["target"] > 0).astype(int)
h2["label"] = (h2["target"] > 0).astype(int)

# --- Keep only selected features + label ---
h1 = h1[feature_cols + ["label"]].copy()
h2 = h2[feature_cols + ["label"]].copy()

# --- Impute missing values with column median (correct pandas CoW-safe syntax) ---
h1_medians = h1[feature_cols].median()
h2_medians = h2[feature_cols].median()

h1[feature_cols] = h1[feature_cols].fillna(h1_medians)
h2[feature_cols] = h2[feature_cols].fillna(h2_medians)

print(f"\nCleveland after imputation: {h1.shape}")
print(f"Hungarian after imputation: {h2.shape}")
print(f"\nCleveland label dist: {h1['label'].value_counts().to_dict()}")
print(f"Hungarian label dist: {h2['label'].value_counts().to_dict()}")
print(f"\nMissing values H1: {h1.isnull().sum().sum()}")
print(f"Missing values H2: {h2.isnull().sum().sum()}")

# --- Normalize independently ---
scaler1 = StandardScaler()
scaler2 = StandardScaler()

h1[feature_cols] = scaler1.fit_transform(h1[feature_cols])
h2[feature_cols] = scaler2.fit_transform(h2[feature_cols])

# --- Train/test split ---
h1_train, h1_test = train_test_split(h1, test_size=0.2, random_state=42, stratify=h1["label"])
h2_train, h2_test = train_test_split(h2, test_size=0.2, random_state=42, stratify=h2["label"])

combined_test = pd.concat([h1_test, h2_test], ignore_index=True)

# --- Save ---
h1_train.to_csv("data/processed/h1_train.csv",          index=False)
h1_test.to_csv("data/processed/h1_test.csv",            index=False)
h2_train.to_csv("data/processed/h2_train.csv",          index=False)
h2_test.to_csv("data/processed/h2_test.csv",            index=False)
combined_test.to_csv("data/processed/combined_test.csv", index=False)

print(f"\nH1 train/test: {h1_train.shape} / {h1_test.shape}")
print(f"H2 train/test: {h2_train.shape} / {h2_test.shape}")
print(f"Combined test: {combined_test.shape}")
print("\nPreprocessing complete. Files saved to data/processed/")
