
import sys

file_path = r'd:\srcDOAN\frontend\src\pages\server\hooks\useServerWebSocket.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_content = r'''    // L?ng nghe c?p nh?t Khay Ð? \(ch? nh?n event khi món N?u xong ho?c ð? Býng\)\s*const unsubscribeDeliveries = subscribe\('/topic/server/deliveries', \(\) => {\s*queryClient.invalidateQueries\({ queryKey: \['server', 'deliveries'\] }\);\s*queryClient.invalidateQueries\({ queryKey: \['server', 'kpi'\] }\);\s*}\);'''

new_content = '''    // L?ng nghe c?p nh?t Khay Ð? (ch? nh?n event khi món N?u xong ho?c ð? Býng)
    const unsubscribeDeliveries = subscribe('/topic/server/deliveries', () => {
       // Thêm delay 500ms ð? ð?m b?o DB Transaction bên Backend ð? commit xong trý?c khi fetch l?i
       setTimeout(() => {
         queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
         queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
       }, 500);
    });'''

content = re.sub(old_content, new_content, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')

