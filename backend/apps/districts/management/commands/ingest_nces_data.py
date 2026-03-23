import os

import pandas as pd
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.districts.models import District

LOCALE_MAP = {
    11: District.LOCALE_URBAN,
    12: District.LOCALE_URBAN,
    13: District.LOCALE_URBAN,
    21: District.LOCALE_SUBURBAN,
    22: District.LOCALE_SUBURBAN,
    23: District.LOCALE_SUBURBAN,
    31: District.LOCALE_TOWN,
    32: District.LOCALE_TOWN,
    33: District.LOCALE_TOWN,
    41: District.LOCALE_RURAL,
    42: District.LOCALE_RURAL,
    43: District.LOCALE_RURAL,
}


class Command(BaseCommand):
    help = "Ingest NCES district data from a CSV file in the data/ directory"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default="sample_nces_data.csv",
            help="CSV filename in the data/ directory (default: sample_nces_data.csv)",
        )

    def handle(self, *args, **options):
        data_dir = settings.BASE_DIR.parent / "data"
        csv_path = data_dir / options["file"]

        if not csv_path.exists():
            raise CommandError(f"CSV file not found: {csv_path}")

        self.stdout.write(f"Reading {csv_path}...")
        df = pd.read_csv(csv_path)

        required_cols = {"nces_id", "name", "state", "locale_code", "enrollment", "frl_percentage", "ell_percentage"}
        missing = required_cols - set(df.columns)
        if missing:
            raise CommandError(f"Missing columns: {missing}")

        # Clean data
        df = df.dropna(subset=["nces_id", "name", "state"])
        df["nces_id"] = df["nces_id"].astype(str).str.strip()
        df["name"] = df["name"].str.strip()
        df["state"] = df["state"].str.strip().str.upper()
        df["locale_code"] = pd.to_numeric(df["locale_code"], errors="coerce").fillna(0).astype(int)
        df["enrollment"] = pd.to_numeric(df["enrollment"], errors="coerce").fillna(0).astype(int)
        df["frl_percentage"] = pd.to_numeric(df["frl_percentage"], errors="coerce").fillna(0.0)
        df["ell_percentage"] = pd.to_numeric(df["ell_percentage"], errors="coerce").fillna(0.0)

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            locale_type = LOCALE_MAP.get(row["locale_code"])
            if not locale_type:
                self.stdout.write(
                    self.style.WARNING(f"  Skipping {row['name']}: unknown locale code {row['locale_code']}")
                )
                skipped_count += 1
                continue

            obj, created = District.objects.update_or_create(
                nces_id=row["nces_id"],
                defaults={
                    "name": row["name"],
                    "state": row["state"],
                    "locale_type": locale_type,
                    "enrollment": row["enrollment"],
                    "frl_percentage": round(float(row["frl_percentage"]), 2),
                    "ell_percentage": round(float(row["ell_percentage"]), 2),
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created: {created_count}, Updated: {updated_count}, Skipped: {skipped_count}"
            )
        )
