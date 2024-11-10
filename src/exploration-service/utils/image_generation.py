from PIL import Image, ImageDraw

import random
import io

def generate_planet_image(color_base: str, color_extra: str):
    # Dimensions
    width, height = 512, 512

    img = Image.new("RGB", (width, height), "#0d1b2a")  # Dark space color
    draw = ImageDraw.Draw(img)

    # Starry background
    num_stars = 100
    for _ in range(num_stars):
        x, y = random.randint(0, width - 1), random.randint(0, height - 1)
        draw.point((x, y), fill="white")

    # Planet
    planet_diameter = width // 3
    planet_radius = planet_diameter // 2
    planet_x = (width - planet_diameter) // 2
    planet_y = (height - planet_diameter) // 2

    # Gradient
    for x_offset in range(planet_diameter):
        for y_offset in range(planet_diameter):
            # Calculate the blend ratio based on diagonal distance from top-left to bottom-right
            distance_ratio = (x_offset + y_offset) / (2 * planet_diameter)
            blended_color = (
                int(int(color_base[1:3], 16) * (1 - distance_ratio) + int(color_extra[1:3], 16) * distance_ratio),
                int(int(color_base[3:5], 16) * (1 - distance_ratio) + int(color_extra[3:5], 16) * distance_ratio),
                int(int(color_base[5:7], 16) * (1 - distance_ratio) + int(color_extra[5:7], 16) * distance_ratio),
            )
            # Draw only within the circular boundary
            if (x_offset - planet_radius) ** 2 + (y_offset - planet_radius) ** 2 <= planet_radius ** 2:
                draw.point((planet_x + x_offset, planet_y + y_offset), fill=blended_color)

    # Border
    border_width = 4
    border_color = "black"
    draw.ellipse(
        [
            (planet_x - border_width, planet_y - border_width),
            (planet_x + planet_diameter + border_width, planet_y + planet_diameter + border_width),
        ],
        outline=border_color,
        width=border_width,
    )

    image_bytes = io.BytesIO()
    img.save(image_bytes, format="PNG")

    return image_bytes.getvalue()
