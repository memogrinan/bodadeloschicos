import re

path = "BodaWebpage/Arcade/index.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update instructions text size
old_inst = 'font-size: clamp(0.7rem, 2vw, 0.85rem);'
new_inst = 'font-size: clamp(0.9rem, 3vw, 1.1rem);'
content = content.replace(old_inst, new_inst)

old_inst2 = 'font-size: 0.9rem;'
new_inst2 = 'font-size: 1.15rem;'
content = content.replace(old_inst2, new_inst2)

# 2. Update the Back button logic to return to the invitation with the URL parameters
# Looking for window.location.href = '../index.html'
bad_back = "window.location.href = '../index.html';"
good_back = """
        // Preservamos el search query (link personalizado) al volver
        const urlParams = window.location.search;
        window.location.href = '../index.html' + urlParams + '#juegos-acceso';
"""
content = content.replace(bad_back, good_back)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
