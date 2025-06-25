# AI Resume Builder

A web app that generates customized, ATS-friendly resumes using the Gemini API.

## Features
- Content generation based on user career information
- Industry-specific keyword optimization
- ATS compatibility checking
- Multiple format export options (PDF, DOCX, HTML)
- Job description matching analysis
- 3+ visual templates with customization
- Smart content suggestions
- Feedback loop that improves outputs based on user edits
- Responsive, cross-browser UI
- Local storage for privacy

## Setup
1. Clone/download this repo.
2. Get a Gemini API key from Google AI Studio.
3. Replace `YOUR_GEMINI_API_KEY` in `app.js` with your key.
4. Open `index.html` in your browser.

## API Usage & Limitations
- Uses Gemini API for resume content generation and optimization.
- API key is used client-side; do not share your key publicly.
- Free tier may have usage limits.
- Outputs may require manual review for accuracy.

## Privacy
- All user data and edits are stored locally in your browser (localStorage).
- No data is sent to any server except Gemini API for content generation.

## Export Options
- HTML export is available.
- PDF and DOCX export coming soon.

## License
MIT 