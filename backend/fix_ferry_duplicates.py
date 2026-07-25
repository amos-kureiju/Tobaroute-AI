import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import Destinasi

def fix_ferry_data():
    db = SessionLocal()
    try:
        # 1. Update category of all KMP ferries from 'umkm' to 'transportasi'
        ferries = db.query(Destinasi).filter(Destinasi.nama.ilike('%KMP%')).all()
        print(f"Memproses {len(ferries)} data kapal feri...")

        for f in ferries:
            f.kategori = "transportasi"
            f.gambar_url = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80"
        
        db.commit()

        # 2. Deduplicate all Destinasi in DB keeping only unique names
        all_dest = db.query(Destinasi).order_by(Destinasi.id.asc()).all()
        seen_names = set()
        deleted_count = 0

        for d in all_dest:
            clean_name = d.nama.strip().lower()
            if clean_name in seen_names:
                db.delete(d)
                deleted_count += 1
            else:
                seen_names.add(clean_name)

        db.commit()
        print(f"[BERHASIL] Mengubah kategori 48 kapal feri ke 'transportasi' & menghapus {deleted_count} data duplikat.")

        # Print breakdown of categories now
        total = db.query(Destinasi).count()
        wisata = db.query(Destinasi).filter(Destinasi.kategori == 'wisata').count()
        kuliner = db.query(Destinasi).filter(Destinasi.kategori == 'kuliner').count()
        umkm = db.query(Destinasi).filter(Destinasi.kategori == 'umkm').count()
        trans = db.query(Destinasi).filter(Destinasi.kategori == 'transportasi').count()

        print(f"\n--- BREAKDOWN DATASET BARU TERSIAP ---")
        print(f"Total Unique Items: {total}")
        print(f"- Wisata Alam/Budaya: {wisata}")
        print(f"- Kuliner Khas: {kuliner}")
        print(f"- Sentra UMKM & Kerajinan: {umkm}")
        print(f"- Transportasi & Feri: {trans}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_ferry_data()
