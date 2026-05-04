const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const SHOTS = path.join(__dirname, '..', 'docs', 'screenshots');
const VIDEO_DIR = path.join(__dirname, '..', 'docs', 'video');
const LIST = path.join(VIDEO_DIR, 'frames.txt');
const OUT = path.join(VIDEO_DIR, 'vulnlab-demo.mp4');

function main() {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static did not provide a binary path.');
  }

  const frames = fs
    .readdirSync(SHOTS)
    .filter((f) => f.endsWith('.png'))
    .sort();

  if (frames.length < 2) {
    throw new Error('Need at least 2 screenshots to build demo video.');
  }

  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const lines = [];
  for (const frame of frames) {
    const abs = path.join(SHOTS, frame).replace(/'/g, "'\\''");
    lines.push(`file '${abs}'`);
    lines.push('duration 2');
  }
  const last = path.join(SHOTS, frames[frames.length - 1]).replace(/'/g, "'\\''");
  lines.push(`file '${last}'`);

  fs.writeFileSync(LIST, lines.join('\n'));

  const args = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', LIST,
    '-vf', 'fps=30,format=yuv420p',
    '-movflags', '+faststart',
    OUT
  ];

  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed with code ${result.status}`);
  }

  console.log(`\nDemo video created: ${OUT}`);
}

main();
