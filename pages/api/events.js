import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'dummy', 'events.json');
  const data = fs.readFileSync(filePath, 'utf8');
  res.status(200).json(JSON.parse(data));
} 