import mammoth from 'mammoth';

export async function extractText({ buffer, mimetype, originalname }) {
  const name = (originalname || '').toLowerCase();
  if (mimetype === 'application/pdf' || name.endsWith('.pdf')) {
    const err = new Error('PDF files are extracted in the browser (with modern pdf.js). Send TXT or DOCX to this endpoint instead.');
    err.statusCode = 400;
    throw err;
  }
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return clean(value);
  }
  if (mimetype === 'text/plain' || name.endsWith('.txt')) {
    return clean(buffer.toString('utf8'));
  }
  const err = new Error('Unsupported file type. Upload a PDF, DOCX or TXT file.');
  err.statusCode = 400;
  throw err;
}

function clean(text) {
  return (text || '')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
