import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";

/**
 * Renders a DOM element into a high-quality PDF File object.
 */
export async function exportElementToPdfFile(element, filename = "document.pdf") {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: 1024, // stabilize desktop layout rendering
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const pdfBlob = pdf.output("blob");
  return new File([pdfBlob], filename, { type: "application/pdf" });
}

/**
 * Shares the generated PDF file directly using Web Share API (WhatsApp, Mail, Files, etc.)
 * or downloads it if Web Share API file sharing is not supported by the browser.
 */
export async function shareOrDownloadPdf(element, filename = "Invoice.pdf", title = "Invoice PDF") {
  const loadingToast = toast.loading("Generating PDF...");
  try {
    const file = await exportElementToPdfFile(element, filename);
    toast.dismiss(loadingToast);

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: `Please find attached ${title}`,
        });
        toast.success("PDF Shared!");
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          return; // user cancelled share modal
        }
      }
    }

    // Fallback: direct download
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("PDF Downloaded!");
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.dismiss(loadingToast);
    toast.error("Could not generate PDF. Opening print dialog...");
    window.print();
  }
}
