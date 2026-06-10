import os
import re

dir_path = r'd:\srcDOAN\frontend\src\pages\pos\reservations'
t_regex = re.compile(r"t\(\s*['\"]([^'\"]+)['\"]\s*\)")

results = []
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = t_regex.findall(content)
                if matches:
                    results.append(f"{file}: {matches}")

for r in results:
    print(r)
