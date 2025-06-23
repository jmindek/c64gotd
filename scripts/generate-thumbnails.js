const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Create thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(__dirname, '../public/games/thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Game data to generate thumbnails for
const games = [
  { name: 'Legacy of the Lost Spell', bgColor: '#2c3e50', textColor: '#ecf0f1' },
  { name: 'Luna', bgColor: '#1a237e', textColor: '#e8eaf6' },
  { name: 'Showdown', bgColor: '#b71c1c', textColor: '#ffcdd2' }
];

// Function to generate a simple placeholder image
async function generateThumbnail(game) {
  const width = 320;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = game.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Draw game name
  ctx.fillStyle = game.textColor;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Split text into multiple lines if needed
  const words = game.name.split(' ');
  let lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width < width - 40) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  
  // Draw each line
  const lineHeight = 30;
  const startY = (height - (lines.length * lineHeight)) / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + (index * lineHeight));
  });

  // Save to file
  const filename = `${game.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
  const filepath = path.join(thumbnailsDir, filename);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated thumbnail: ${filepath}`);
  
  return filename;
}

// Generate all thumbnails
async function generateAllThumbnails() {
  console.log('Generating game thumbnails...');
  
  for (const game of games) {
    try {
      await generateThumbnail(game);
    } catch (error) {
      console.error(`Error generating thumbnail for ${game.name}:`, error);
    }
  }
  
  console.log('Thumbnail generation complete!');
}

// Run the generator
generateAllThumbnails().catch(console.error);
