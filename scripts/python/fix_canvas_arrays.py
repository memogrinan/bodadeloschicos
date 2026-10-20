import re

path = "BodaWebpage/juegos.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# I need to be extremely precise.
# Let's fix updatePuebla which currently has `chicaPopups` instead of `pueblaPopups`.
# Wait, let's find `pueblaPopups` rendering in updatePuebla.
# Actually, I injected `pueblaPopups` inside updatePuebla but it got overriden or I matched the wrong block.
