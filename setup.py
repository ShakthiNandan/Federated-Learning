import urllib.request
import os

os.makedirs('data', exist_ok=True)

cleveland_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
hungarian_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.hungarian.data"

cols = ["age","sex","cp","trestbps","chol","fbs","restecg",
        "thalach","exang","oldpeak","slope","ca","thal","target"]

print("Downloading Cleveland (Hospital 1)...")
urllib.request.urlretrieve(cleveland_url, "data/cleveland.data")

print("Downloading Hungarian (Hospital 2)...")
urllib.request.urlretrieve(hungarian_url, "data/hungarian.data")

print("Downloads complete.")
print("Files saved to data/cleveland.data and data/hungarian.data")
