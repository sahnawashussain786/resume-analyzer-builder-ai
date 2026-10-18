let workerReady = false;

/** Client-side text extraction from a PDF (robust modern pdf.js, no server parsing). */
export async function extractPdfText(file) {
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  if (!workerReady) {
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    workerReady = true;
  }
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    // Group items into lines using y-coordinates for readable text
    let lastY = null;
    for (const item of tc.items) {
      if (typeof item.str !== 'string') continue;
      const y = item.transform?.[5];
      if (lastY !== null && Math.abs(y - lastY) > 2.5) text += '\n';
      text += item.str;
      if (item.hasEOL) text += '\n';
      lastY = y;
    }
    text += '\n';
  }
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
