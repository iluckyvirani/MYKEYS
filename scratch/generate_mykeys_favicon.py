import os
import math
from PIL import Image, ImageDraw

# Create public directory if not exists
os.makedirs("public", exist_ok=True)
os.makedirs("src/app", exist_ok=True)
os.makedirs("artifacts", exist_ok=True)

# SVG Content for vector precision
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <!-- MYKEYS Premium Gold Emblem (#C78A1D) -->
  <g fill="#C78A1D">
    <!-- Key Head: Trefoil 3-Ring Crown -->
    <!-- Top Ring -->
    <path fill-rule="evenodd" d="M 230 75 C 230 50.147 250.147 30 275 30 C 299.853 30 320 50.147 320 75 C 320 99.853 299.853 120 275 120 C 250.147 120 230 99.853 230 75 Z M 275 52 C 262.298 52 252 62.298 252 75 C 252 87.702 262.298 98 275 98 C 287.702 98 298 87.702 298 75 C 298 62.298 287.702 52 275 52 Z" />
    <!-- Bottom Left Ring -->
    <path fill-rule="evenodd" d="M 185 130 C 185 107.909 202.909 90 225 90 C 247.091 90 265 107.909 265 130 C 265 152.091 247.091 170 225 170 C 202.909 170 185 152.091 185 130 Z M 225 108 C 212.85 108 203 117.85 203 130 C 203 142.15 212.85 152 225 152 C 237.15 152 247 142.15 247 130 C 247 117.85 237.15 108 225 108 Z" />
    <!-- Bottom Right Ring -->
    <path fill-rule="evenodd" d="M 285 130 C 285 107.909 302.909 90 325 90 C 347.091 90 365 107.909 365 130 C 365 152.091 347.091 170 325 170 C 302.909 170 285 152.091 285 130 Z M 325 108 C 312.85 108 303 117.85 303 130 C 303 142.15 312.85 152 325 152 C 337.15 152 347 142.15 347 130 C 347 117.85 337.15 108 325 108 Z" />
    
    <!-- Neck connector -->
    <path d="M 253 155 L 297 155 L 297 185 L 253 185 Z" />

    <!-- Vertical Key Shaft (Left stem of K) -->
    <!-- Main shaft: X from 253 to 297, Y from 185 to 455 -->
    <path d="M 253 185 L 297 185 L 297 445 L 275 470 L 253 445 L 253 405 L 241 405 L 241 385 L 253 385 L 253 355 L 237 355 L 237 335 L 253 335 Z" />

    <!-- Upper Diagonal Arm of 'K' -->
    <path d="M 297 315 L 395 195 L 435 228 L 327 355 Z" />

    <!-- Lower Diagonal Arm of 'K' -->
    <path d="M 297 315 L 327 285 L 435 412 L 395 445 Z" />
  </g>
</svg>'''

with open("public/favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

with open("src/app/icon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

print("SVG files generated successfully!")

# Render high quality PNGs using 8x supersampled PIL vector drawing
def draw_emblem(scale=4):
    canvas_size = 512 * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    gold = (199, 138, 29, 255) # #C78A1D
    
    def S(val):
        return val * scale

    # Helper for ring with hole
    def draw_ring(cx, cy, r_outer, r_inner):
        cx, cy, r_outer, r_inner = S(cx), S(cy), S(r_outer), S(r_inner)
        # Create temp mask for ring
        ring_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        r_draw = ImageDraw.Draw(ring_img)
        r_draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=gold)
        # Mask out inner hole by drawing transparent circle with composite
        # Instead, build polygon/pies or composite erase
        hole_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        h_draw = ImageDraw.Draw(hole_img)
        h_draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], fill=(255, 255, 255, 255))
        
        # Erase hole from ring_img using alpha mask
        r_alpha = ring_img.split()[3]
        h_alpha = hole_img.split()[3]
        # Clear inner pixels
        import numpy as np
        r_np = np.array(ring_img)
        h_np = np.array(h_alpha)
        r_np[h_np > 0] = [0, 0, 0, 0]
        return Image.fromarray(r_np)

    # We can draw all components onto one composite image
    # 1. Top Ring
    top_ring = draw_ring(275, 75, 45, 23)
    img = Image.alpha_composite(img, top_ring)
    
    # 2. Bottom Left Ring
    bl_ring = draw_ring(225, 130, 40, 22)
    img = Image.alpha_composite(img, bl_ring)
    
    # 3. Bottom Right Ring
    br_ring = draw_ring(325, 130, 40, 22)
    img = Image.alpha_composite(img, br_ring)

    # Re-obtain draw object for solid paths
    draw = ImageDraw.Draw(img)

    # 4. Neck connector
    draw.polygon([
        (S(253), S(155)),
        (S(297), S(155)),
        (S(297), S(185)),
        (S(253), S(185))
    ], fill=gold)

    # 5. Key Shaft with Teeth & Tip
    shaft_poly = [
        (S(253), S(185)),
        (S(297), S(185)),
        (S(297), S(445)),
        (S(275), S(470)),
        (S(253), S(445)),
        (S(253), S(405)),
        (S(237), S(405)),
        (S(237), S(385)),
        (S(253), S(385)),
        (S(253), S(355)),
        (S(231), S(355)),
        (S(231), S(335)),
        (S(253), S(335))
    ]
    draw.polygon(shaft_poly, fill=gold)

    # 6. Upper Diagonal Arm of 'K'
    draw.polygon([
        (S(297), S(315)),
        (S(395), S(195)),
        (S(435), S(228)),
        (S(327), S(355))
    ], fill=gold)

    # 7. Lower Diagonal Arm of 'K'
    draw.polygon([
        (S(297), S(315)),
        (S(327), S(285)),
        (S(435), S(412)),
        (S(395), S(445))
    ], fill=gold)

    # Center fill smooth join
    draw.polygon([
        (S(297), S(280)),
        (S(340), S(330)),
        (S(297), S(380))
    ], fill=gold)

    return img

print("Generating high quality antialiased PNG assets...")
base_img = draw_emblem(scale=4) # 2048x2048 high-res master

sizes = [16, 32, 48, 64, 180, 192, 512]
png_images = {}

for sz in sizes:
    resized = base_img.resize((sz, sz), Image.Resampling.LANCZOS)
    png_images[sz] = resized
    resized.save(f"public/favicon-{sz}x{sz}.png")
    print(f"Saved public/favicon-{sz}x{sz}.png")

# Save specific standard named icons
png_images[180].save("public/apple-touch-icon.png")
png_images[192].save("public/android-chrome-192x192.png")
png_images[512].save("public/android-chrome-512x512.png")
png_images[512].save("src/app/icon.png")

# Save ICO file with multiple sizes
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
ico_imgs = [png_images[sz[0]] for sz in ico_sizes]
ico_imgs[0].save("public/favicon.ico", format="ICO", sizes=ico_sizes, append_images=ico_imgs[1:])
ico_imgs[0].save("src/app/favicon.ico", format="ICO", sizes=ico_sizes, append_images=ico_imgs[1:])

# Save artifact copy for preview
base_img.resize((512, 512), Image.Resampling.LANCZOS).save("artifacts/mykeys_k_favicon_vector.png")

print("All favicon icons successfully generated!")
