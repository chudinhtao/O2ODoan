import os
import re
import json

DIR = r"d:\srcDOAN\frontend\src\pages\pos\reservations"
# Complete Vietnamese characters regex
vi_regex = re.compile(r'[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲÝỴỶỸ]')

def find_hardcoded_vietnamese(directory):
    results = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                file_results = []
                for i, line in enumerate(lines):
                    if vi_regex.search(line):
                        text = line.strip()
                        # Ignore lines that already use t() fully wrapping the text, but only if the vietnamese is inside t()
                        # Actually, just ignore comments and lines that are exclusively t('...', '...') or console.logs
                        if text.startswith('//') or text.startswith('/*') or text.startswith('*'): continue
                        if "import " in text or "console." in text: continue
                        
                        # Let's remove any t('...', '...') from the string and see if Vietnamese chars are still left!
                        # This is the safest way to know if there's UNTRANSLATED vietnamese.
                        text_without_t = re.sub(r't\(\s*[\'"][^\'"]+[\'"]\s*,\s*[\'"][^\'"]+[\'"]\s*\)', '', text)
                        text_without_t = re.sub(r't\(\s*[\'"][^\'"]+[\'"]\s*\)', '', text_without_t)
                        
                        if vi_regex.search(text_without_t):
                            file_results.append({ "line": i + 1, "text": text })
                
                if file_results:
                    rel_path = os.path.relpath(filepath, directory)
                    results[rel_path] = file_results
    return results

if __name__ == "__main__":
    res = find_hardcoded_vietnamese(DIR)
    out_path = r"C:\Users\ACER\.gemini\antigravity-ide\brain\3b5cc78b-9561-45ac-95dd-454a3ad370c2\scratch\out_proper.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
    print(f"Done. Wrote to {out_path}")
