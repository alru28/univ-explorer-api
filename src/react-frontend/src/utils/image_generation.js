function generatePlanetImage(colorBase, colorExtra) {
    const isValidColor = (color) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
  
    // If invalid colors...
    const baseColor = isValidColor(colorBase) ? colorBase : "#808080"; // Gray
    const extraColor = isValidColor(colorExtra) ? colorExtra : "#A9A9A9"; // Light gray
  
    const width = 512;
    const height = 512;
  
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
  
    // Background
    ctx.fillStyle = "#0d1b2a";
    ctx.fillRect(0, 0, width, height);
  
    // Stars
    const numStars = 100;
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = "white";
      ctx.fillRect(x, y, 1, 1);
    }
  
    // Planet
    const planetDiameter = width / 3;
    const planetRadius = planetDiameter / 2;
    const planetX = (width - planetDiameter) / 2;
    const planetY = (height - planetDiameter) / 2;
  
    // Diagonal Gradient
    const gradient = ctx.createLinearGradient(
      planetX,
      planetY,
      planetX + planetDiameter,
      planetY + planetDiameter
    );
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, extraColor);
  
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(planetX + planetRadius, planetY + planetRadius, planetRadius, 0, 2 * Math.PI);
    ctx.fill();
  
    // Border
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(planetX + planetRadius, planetY + planetRadius, planetRadius, 0, 2 * Math.PI);
    ctx.stroke();
  
    return canvas.toDataURL("image/png");
  }
  
  
  export function generatePlanetImageWithCache(planetId, colorBase, colorExtra) {
    const cachedImage = localStorage.getItem(`planetImage_${planetId}`);
    if (cachedImage) {
      return cachedImage;
    }
  
    const imageUrl = generatePlanetImage(colorBase, colorExtra);
    localStorage.setItem(`planetImage_${planetId}`, imageUrl);
    return imageUrl;
  }