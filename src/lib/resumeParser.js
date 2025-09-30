import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const extractTextFromPdf = async (file) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item) => item.str).join(' ');
        }
        resolve(fullText);
      } catch (error) {
        reject('Error parsing PDF: ' + error.message);
      }
    };
    reader.onerror = (error) => {
      reject('Error reading file: ' + error.message);
    };
    reader.readAsArrayBuffer(file);
  });
};

const extractDetailsFromText = (text) => {
  const details = {
    name: null,
    email: null,
    phone: null,
  };

  // Email extraction
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    details.email = emailMatch[0];
  }

  // Phone number extraction (handles various formats)
  const phoneRegex = /\(?[\d]{3}\)?[\s-]?\d{3}[\s-]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    details.phone = phoneMatch[0];
  }

  // Name extraction (simple approach: look for a capitalized two-word phrase)
  // This is a basic implementation and might not be perfectly accurate.
  const nameRegex = /([A-Z][a-z]+)\s([A-Z][a-z]+)/;
  const nameMatch = text.match(nameRegex);
  if (nameMatch) {
    details.name = nameMatch[0];
  }

  return details;
};

export const parseResume = async (file) => {
  if (file.type === 'application/pdf') {
    const resumeText = await extractTextFromPdf(file);
    const details = extractDetailsFromText(resumeText);
    return { ...details, resumeText };
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // DOCX parsing is not implemented yet
    console.warn('DOCX parsing is not supported yet.');
    return { name: '', email: '', phone: '', resumeText: '' };
  } else {
    throw new Error('Unsupported file type');
  }
};
