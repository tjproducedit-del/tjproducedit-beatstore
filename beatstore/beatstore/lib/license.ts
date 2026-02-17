// Simple license PDF generation using a template approach.
// For production, consider using @react-pdf/renderer or puppeteer for styled PDFs.

interface LicenseData {
  customerName: string;
  customerEmail: string;
  beatTitle: string;
  licenseType: string;
  orderId: string;
  date: string;
  producerName: string;
}

export function generateLicenseText(data: LicenseData): string {
  const terms: Record<string, string> = {
    BASIC: `
BASIC LEASE LICENSE AGREEMENT

This license grants the Licensee non-exclusive rights to use the beat "${data.beatTitle}" 
under the following terms:

- Format: MP3 (320kbps)
- Distribution: Up to 5,000 streams/downloads combined
- Commercial use: Permitted with credit to producer
- Exclusivity: Non-exclusive (producer retains ownership)
- Modifications: Licensee may add vocals and modify the arrangement
- Credit: "${data.producerName}" must be credited as the producer

This license does not transfer ownership of the underlying composition or master recording.`,

    PREMIUM: `
PREMIUM LEASE LICENSE AGREEMENT

This license grants the Licensee non-exclusive rights to use the beat "${data.beatTitle}" 
under the following terms:

- Format: MP3 (320kbps) + WAV (44.1kHz/24bit)
- Distribution: Up to 50,000 streams/downloads combined
- Commercial use: Permitted with credit to producer
- Exclusivity: Non-exclusive (producer retains ownership)
- Modifications: Licensee may add vocals and modify the arrangement
- Music videos: One (1) music video permitted
- Credit: "${data.producerName}" must be credited as the producer

This license does not transfer ownership of the underlying composition or master recording.`,

    EXCLUSIVE: `
EXCLUSIVE RIGHTS LICENSE AGREEMENT

This license grants the Licensee EXCLUSIVE rights to use the beat "${data.beatTitle}" 
under the following terms:

- Format: All available formats (MP3, WAV, Stems if available)
- Distribution: Unlimited streams/downloads
- Commercial use: Fully permitted
- Exclusivity: Exclusive -- beat will be removed from all platforms
- Ownership: Full rights transfer to Licensee
- Music videos: Unlimited
- Credit: Appreciated but not required

Upon execution of this agreement, all rights to the beat transfer to the Licensee.`,
  };

  return `
================================================================================
                         BEAT LICENSE AGREEMENT
================================================================================

License ID: ${data.orderId}
Date: ${data.date}

LICENSOR (Producer): ${data.producerName}
LICENSEE: ${data.customerName} (${data.customerEmail})

BEAT: "${data.beatTitle}"
LICENSE TYPE: ${data.licenseType}

${terms[data.licenseType] || terms.BASIC}

--------------------------------------------------------------------------------
GENERAL TERMS
--------------------------------------------------------------------------------

1. This agreement is binding upon execution (completion of payment).
2. The Licensee may not resell, lease, or sublicense the beat itself.
3. The Licensee may not register the beat as their own composition without 
   written consent from the Licensor (except for Exclusive licenses).
4. Any violation of these terms will result in immediate revocation of the license.
5. This agreement is governed by applicable copyright law.

================================================================================
Generated automatically upon purchase. This document serves as proof of license.
================================================================================
`;
}

// Convert the text license to a simple PDF buffer
// Using a minimal PDF structure
export function generateLicensePdfBuffer(data: LicenseData): Buffer {
  const text = generateLicenseText(data);
  const lines = text.split("\n");

  // Build a minimal valid PDF
  const pdfLines: string[] = [];
  let yPos = 750;
  const pageContent: string[] = [];

  for (const line of lines) {
    if (yPos < 50) {
      yPos = 750;
    }
    // Escape special PDF characters
    const escaped = line
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    pageContent.push(`BT /F1 9 Tf 50 ${yPos} Td (${escaped}) Tj ET`);
    yPos -= 14;
  }

  const stream = pageContent.join("\n");

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length ${stream.length} >>
stream
${stream}
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000${(stream.length + 327).toString().padStart(4, "0")} 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}
