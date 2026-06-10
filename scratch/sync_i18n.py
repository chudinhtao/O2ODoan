import os
import json
import re

dir_path = r'd:\srcDOAN\frontend\src\pages\pos\reservations'
vi_path = r'd:\srcDOAN\frontend\src\config\locales\vi.json'
en_path = r'd:\srcDOAN\frontend\src\config\locales\en.json'

with open(vi_path, 'r', encoding='utf-8') as f:
    vi_data = json.load(f)

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Regex to match t('key', 'fallback') or t("key", "fallback")
# Group 1: key
# Group 2: fallback string with quotes (e.g. 'fallback') or variable
t_regex = re.compile(r't\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*([\'"].*?[\'"]|\{.*?\}|[^)]+)\)')

keys_found = []

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            full_path = os.path.join(root, file)
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = t_regex.findall(content)
                for key, fallback in matches:
                    # Strip quotes if it's a string literal
                    if (fallback.startswith("'") and fallback.endswith("'")) or \
                       (fallback.startswith('"') and fallback.endswith('"')):
                        fallback = fallback[1:-1]
                    keys_found.append((key, fallback))

def set_nested_value(d, keys, value):
    for k in keys[:-1]:
        d = d.setdefault(k, {})
    if keys[-1] not in d:
        d[keys[-1]] = value
        return True
    return False

vi_updated = 0
en_updated = 0

for key, fallback in keys_found:
    key_parts = key.split('.')
    if set_nested_value(vi_data, key_parts, fallback):
        vi_updated += 1
    if set_nested_value(en_data, key_parts, fallback):
        en_updated += 1

if vi_updated > 0:
    with open(vi_path, 'w', encoding='utf-8') as f:
        json.dump(vi_data, f, ensure_ascii=False, indent=2)

if en_updated > 0:
    with open(en_path, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)

print(f"Updated vi.json: {vi_updated} keys added.")
print(f"Updated en.json: {en_updated} keys added.")
