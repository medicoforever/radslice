import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PdfPageRaster {
  pageIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

export const rasterizePdfFile = async (
  file: File,
  scale: number = 2.0
): Promise<PdfPageRaster[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pages: PdfPageRaster[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
      const dataUrl = canvas.toDataURL('image/png');
      pages.push({
        pageIndex: pageNum,
        dataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  return pages;
};
