"""Extract the shop's supplier rates from manually downloaded Prodigi CSVs."""
import csv
import json
from pathlib import Path

source = Path(r"D:\Files\Downloads")
skus = {f"GLOBAL-{family}-{size}" for family in ("FAP", "BLP", "CFP") for size in ("A3", "A4")}
rows = []
files = sorted(source.glob("prodigi-*.csv"))
for path in files:
    with path.open(encoding="utf-8-sig", newline="") as stream:
        for line, row in enumerate(csv.DictReader(stream), 2):
            if row.get("SKU") in skus:
                rows.append({"sourceFile": path.name, "sourceLine": line, **{key: value.strip() for key, value in row.items()}})
output = Path(__file__).with_name("prodigi-supplier-rates.json")
output.write_text(json.dumps({"observed": "2026-10-13", "source": "https://dashboard.prodigi.com/pricing/", "rates": rows}, indent=2), encoding="utf-8")
for sku in sorted(skus):
    selected = [r for r in rows if r["SKU"] == sku]
    countries = sorted({r["Destination country"] for r in selected})
    print(sku, len(selected), len(countries), "countries", sorted({r["Shipping currency"] for r in selected}))
print("Files:", len(files), "Rows:", len(rows))
print(json.dumps([r for r in rows if r["SKU"] == "GLOBAL-CFP-A3" and r["Destination country"] == "GB"][:6], indent=2))
