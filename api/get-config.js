export default function handler(req, res) {
  res.status(200).json({ GEMINI_API_KEY: process.env.GEMINI_API_KEY });
}
