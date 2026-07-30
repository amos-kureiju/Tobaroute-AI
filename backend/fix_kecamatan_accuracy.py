import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from app.database import SessionLocal
from app.models import Destinasi

def fix_all_kecamatans():
    db = SessionLocal()
    try:
        destinations = db.query(Destinasi).all()
        updated_count = 0
        
        # Mapping nama kecamatan standar
        KECAMATAN_MAP = {
            "habinsaran": "Habinsaran",
            "siantar narumonda": "Siantar Narumonda",
            "sigumpar": "Sigumpar",
            "silaen": "Silaen",
            "laguboti": "Laguboti",
            "balige": "Balige",
            "tampahan": "Tampahan",
            "porsea": "Porsea",
            "parmaksian": "Parmaksian",
            "lumban julu": "Lumban Julu",
            "uluan": "Uluan",
            "ajibata": "Ajibata",
            "borbor": "Borbor",
            "nassau": "Nassau",
            "pangururan": "Pangururan",
            "simanindo": "Simanindo",
            "onan runggu": "Onan Runggu",
            "nainggolan": "Nainggolan",
            "palipi": "Palipi",
            "harian": "Harian",
            "sianjur mulamula": "Sianjur Mulamula",
            "sitio-tio": "Sitio-tio",
            "sitiotio": "Sitio-tio",
            "ronggur nihuta": "Ronggur Nihuta",
            "bakti raja": "Bakti Raja",
            "baktiraja": "Bakti Raja",
            "dolok sanggul": "Doloksanggul",
            "doloksanggul": "Doloksanggul",
            "pollung": "Pollung",
            "lintong nihuta": "Lintong Nihuta",
            "paranginan": "Paranginan",
            "pakkat": "Pakkat",
            "onan ganjang": "Onan Ganjang",
            "sijamapolang": "Sijamapolang",
            "tarutung": "Tarutung",
            "sipoholon": "Sipoholon",
            "siborongborong": "Siborongborong",
            "siborong-borong": "Siborongborong",
            "muara": "Muara",
            "berastagi": "Berastagi",
            "kabanjahe": "Kabanjahe",
            "merek": "Merek",
            "tongging": "Merek",
            "silahisabungan": "Silahisabungan",
            "silalahi": "Silahisabungan",
            "sidikalang": "Sidikalang",
            "sitinjo": "Sitinjo",
            "salak": "Salak",
            "pergetteng-getteng sengku": "Pergetteng-getteng Sengku",
            "girsang sipangan bolon": "Girsang Sipangan Bolon",
            "parapat": "Parapat"
        }

        for item in destinations:
            full_text = f"{item.nama_jalan or ''} {item.deskripsi_lengkap or ''} {item.deskripsi_singkat or ''}"
            
            # Cari kec. / kecamatan
            match = re.search(r'(?:Kec\.|Kecamatan)\s+([A-Za-z\s\-]+?)(?:,|\.|\(|\d|\$)', full_text, re.IGNORECASE)
            detected_kec = None
            if match:
                raw_extracted = match.group(1).strip().lower()
                for key, val in KECAMATAN_MAP.items():
                    if key in raw_extracted:
                        detected_kec = val
                        break
            
            # Jika tidak ketemu via regex Kec., cari nama kecamatan di full_text
            if not detected_kec:
                full_lower = full_text.lower()
                for key, val in KECAMATAN_MAP.items():
                    if f"kec. {key}" in full_lower or f"kecamatan {key}" in full_lower or f" {key}," in full_lower:
                        detected_kec = val
                        break
            
            if detected_kec and item.kecamatan != detected_kec:
                print(f"[FIX] ID {item.id}: '{item.nama}' | {item.kecamatan} -> {detected_kec}")
                item.kecamatan = detected_kec
                updated_count += 1
        
        db.commit()
        print(f"\n[SELESAI] Berhasil memperbarui {updated_count} entitas dengan kecamatan yang 100% presisi!")
    finally:
        db.close()

if __name__ == "__main__":
    fix_all_kecamatans()
