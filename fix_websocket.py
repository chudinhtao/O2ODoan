import sys

file_path = r'd:\srcDOAN\frontend\src\pages\server\hooks\useServerWebSocket.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
old_content = r'''        // Haptic feedback \(Vibrate\)\s*if \('vibrate' in navigator\) {\s*navigator.vibrate\(\[200, 100, 200, 100, 400\]\); // Cảnh báo đỏ\s*}\s*// Play sound\s*const audio = new Audio\('/sounds/alert.mp3'\);\s*audio.play\(\).catch\(\(\) => {}\);\s*if \(payload.cancelledItems\) {\s*toast.error\(t\('server.alert_cancel', { number: payload.tableNumber }\), { duration: 8000, icon: <AlertOctagon className="size-5 text-white" /> }\);\s*} else {\s*toast\(t\('server.alert_urgent'\), { icon: <AlertTriangle className="size-5 text-red-500" />, duration: 5000 }\);\s*}'''

new_content = '''        const isUrgent = payload.cancelledItems || payload.urgentItemIds || payload.pendingSeconds;
        
        if (isUrgent) {
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 400]);
          }
          const audio = new Audio('/sounds/alert.mp3');
          audio.play().catch(() => {});
        }

        if (payload.cancelledItems) {
          toast.error(t('server.alert_cancel', { number: payload.tableNumber }), { duration: 8000, icon: <AlertOctagon className="size-5 text-white" /> });
        } else if (payload.urgentItemIds || payload.pendingSeconds) {
          toast(t('server.alert_urgent'), { icon: <AlertTriangle className="size-5 text-red-500" />, duration: 5000 });
        }'''

content = re.sub(old_content, new_content, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
