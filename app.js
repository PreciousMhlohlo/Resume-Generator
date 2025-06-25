// Replace with your Gemini API key
const GEMINI_API_KEY = 'AIzaSyB_7c8YW9xLDS-FybYSU-UwbBUDneT5E8w';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const form = document.getElementById('resume-form');
const previewContent = document.getElementById('preview-content');
const templateSelector = document.getElementById('template-selector');
let selectedTemplate = 1;

// Load user data from localStorage if available
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('resumeUserData');
  if (saved) {
    const data = JSON.parse(saved);
    for (const [key, value] of Object.entries(data)) {
      const input = form.elements[key];
      if (input) input.value = value;
    }
  }
});

// Handle template selection
[...templateSelector.querySelectorAll('button')].forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTemplate = btn.getAttribute('data-template');
    renderPreview(previewContent.innerText, selectedTemplate);
  });
});

// Handle form submission
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const userData = Object.fromEntries(formData.entries());
  localStorage.setItem('resumeUserData', JSON.stringify(userData));
  previewContent.innerHTML = 'Generating resume...';
  const aiContent = await generateResumeContent(userData);
  renderPreview(aiContent, selectedTemplate);
});

// Call Gemini API for resume content generation
async function generateResumeContent(userData) {
  let structureInstructions = '';
  if (selectedTemplate === '2') {
    // Formal
    structureInstructions = `
      - Resume format: Contact Information at the top, then SUMMARY, then WORK EXPERIENCE, then EDUCATION, then SKILLS.
      - Section headings in uppercase.
      - Add a horizontal line (<hr>) under each heading.
      - Use a serif font for headings (e.g., Times New Roman).
      - Add extra spacing between sections.
      - Layout and order should match a traditional professional resume.
    `;
  } else if (selectedTemplate === '3') {
    // Creative
    structureInstructions = `
      - Resume format: Name and job title as a large header at the top, then SKILLS in a highlighted block, then WORK EXPERIENCE, then EDUCATION, then CONTACT INFORMATION at the bottom.
      - Use accent color blocks and rounded backgrounds for sections.
      - Use a modern, playful font for headings (e.g., Arial Rounded, Comic Sans, or similar sans-serif).
      - Make SKILLS look like tags or badges.
      - Layout and order should match a modern creative resume.
    `;
  } else {
    // Normal
    structureInstructions = `
      - Resume format: SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS, CONTACT INFORMATION.
      - Use standard section headings.
      - Keep formatting simple and clear.
      - Layout and order should match a standard resume.
    `;
  }

  const prompt = `
Generate ONLY the ATS-friendly resume in clean HTML for the following user data: ${JSON.stringify(userData)}.
Requirements:
${structureInstructions}
- Do NOT use tables, columns, images, or graphics.
- Use only standard HTML tags: <h2>, <h3>, <ul>, <li>, <p>, <strong>, <em>, <hr>, <span>, <div>.
- Optimize for ATS parsing and include relevant keywords from the provided job description.
- Do not use inline styles or CSS classes.
- Output ONLY the HTML for the resume body (no <html>, <head>, or <body> tags, no explanations, no extra information).
Template: ${selectedTemplate}.
`;
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    console.log('Gemini API response:', data);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || (data.error?.message || 'Error generating resume.');
  } catch (err) {
    return 'Error connecting to Gemini API: ' + err.message;
  }
}

function cleanHTMLContent(content) {
  // Remove code block markers and quotes
  return content
    .replace(/^```html\n?/gmi, '')
    .replace(/```$/gmi, '')
    .replace(/^```|```$/gmi, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function getTemplateStyle(templateId) {
  switch (String(templateId)) {
    case '2': // Formal
      return `
        <style>
          #preview-content h2 { color: #1a237e; border-bottom: 1px solid #b0bec5; }
          #preview-content { color: #263238; background: #f5f7fa; }
        </style>
      `;
    case '3': // Creative
      return `
        <style>
          #preview-content h2 { color: #d84315; border-bottom: 2px solid #ffab91; }
          #preview-content { color: #263238; background: #fff3e0; }
        </style>
      `;
    case '1': // Normal
    default:
      return `
        <style>
          #preview-content h2 { color: #2d3e50; border-bottom: 1px solid #b0b8c1; }
          #preview-content { color: #222; background: #f7fafd; }
        </style>
      `;
  }
}

function renderPreview(content, templateId) {
  const cleanContent = cleanHTMLContent(content);
  const style = getTemplateStyle(templateId);
  previewContent.innerHTML = style + cleanContent;
}

// Export buttons (stubs)
document.getElementById('export-pdf').addEventListener('click', () => {
  const content = document.getElementById('preview-content');
  html2canvas(content).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Scale image to fit page
    const imgWidth = pageWidth - 40;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('resume.pdf');
  });
});

document.getElementById('export-docx').addEventListener('click', () => {
  if (!window.htmlDocx) {
    alert('DOCX export library failed to load. Please check your internet connection or try again.');
    return;
  }
  const content = document.getElementById('preview-content').innerHTML;
  // Wrap in a minimal HTML document for Word compatibility
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + content + '</body></html>';
  const converted = window.htmlDocx.asBlob(html);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(converted);
  a.download = 'resume.docx';
  a.click();
});

// Export buttons (stubs)
document.getElementById('export-html').addEventListener('click', () => {
  const html = previewContent.innerHTML;
  const blob = new Blob([html], {type: 'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'resume.html';
  a.click();
});

// Feedback loop: Save edits to preview
previewContent.addEventListener('input', () => {
  localStorage.setItem('resumeUserEdits', previewContent.innerHTML);
});

// Section-by-section preview (optional: can add live update as user types) 