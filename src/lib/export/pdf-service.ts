import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { World, Entity, EntityImage } from "@/types";

/**
 * PDFService handles PDF generation for World Bible exports
 * Creates formatted PDF documents with entity information and images
 */
export class PDFService {
  /**
   * Generate a World Bible PDF with entities and their images
   */
  async generateWorldBiblePDF(
    world: World,
    entities: (Entity & { images: EntityImage[] })[],
    stats?: {
      totalEntities: number;
      entityBreakdown: Record<string, number>;
    }
  ): Promise<Buffer> {
    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Add title page
    this.addTitlePage(doc, world, pageWidth, pageHeight);

    // Add table of contents
    doc.addPage();
    this.addTableOfContents(doc, world, entities, margin);

    // Add statistics page if provided
    if (stats) {
      doc.addPage();
      this.addStatisticsPage(doc, stats, margin, contentWidth);
    }

    // Add entity pages
    for (let i = 0; i < entities.length; i++) {
      doc.addPage();
      await this.addEntityPage(doc, entities[i], i + 1, margin, contentWidth, pageWidth);
    }

    // Add footer to all pages
    this.addFooters(doc, world);

    // Convert to buffer
    const pdfBlob = doc.output("arraybuffer");
    return Buffer.from(pdfBlob);
  }

  /**
   * Add title page with world information
   */
  private addTitlePage(
    doc: jsPDF,
    world: World,
    pageWidth: number,
    pageHeight: number
  ): void {
    // Title
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("World Bible", pageWidth / 2, 80, { align: "center" });

    // World name
    doc.setFontSize(24);
    doc.setFont("helvetica", "normal");
    doc.text(world.name, pageWidth / 2, 100, { align: "center" });

    // Description
    if (world.description) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(world.description, pageWidth - 60);
      doc.text(descLines, pageWidth / 2, 120, { align: "center" });
    }

    // Tags
    if (world.tags && world.tags.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Tags: ${world.tags.join(", ")}`, pageWidth / 2, 150, {
        align: "center",
      });
    }

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generated: ${dateStr}`, pageWidth / 2, pageHeight - 30, {
      align: "center",
    });

    // Branding
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("continueml", pageWidth / 2, pageHeight - 20, {
      align: "center",
    });
  }

  /**
   * Add table of contents
   */
  private addTableOfContents(
    doc: jsPDF,
    world: World,
    entities: Entity[],
    margin: number
  ): void {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Table of Contents", margin, margin + 10);

    // Group entities by type
    const entityByType: Record<string, Entity[]> = {};
    entities.forEach((entity) => {
      if (!entityByType[entity.type]) {
        entityByType[entity.type] = [];
      }
      entityByType[entity.type].push(entity);
    });

    let yPos = margin + 25;
    doc.setFontSize(12);

    // Add sections
    const sections = [
      { title: "Statistics", page: 3 },
      ...Object.entries(entityByType).map(([type, ents], idx) => ({
        title: `${this.capitalizeFirst(type)}s (${ents.length})`,
        page: 4 + idx,
      })),
    ];

    sections.forEach((section) => {
      doc.setFont("helvetica", "normal");
      doc.text(section.title, margin + 5, yPos);
      doc.text(`Page ${section.page}`, margin + 150, yPos);
      yPos += 8;
    });
  }

  /**
   * Add statistics page
   */
  private addStatisticsPage(
    doc: jsPDF,
    stats: { totalEntities: number; entityBreakdown: Record<string, number> },
    margin: number,
    contentWidth: number
  ): void {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("World Statistics", margin, margin + 10);

    let yPos = margin + 25;

    // Total entities
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Entities: ${stats.totalEntities}`, margin, yPos);
    yPos += 15;

    // Entity breakdown table
    doc.setFontSize(12);
    doc.text("Entity Breakdown by Type:", margin, yPos);
    yPos += 10;

    const tableData = Object.entries(stats.entityBreakdown).map(
      ([type, count]) => [this.capitalizeFirst(type), count.toString()]
    );

    autoTable(doc, {
      startY: yPos,
      head: [["Entity Type", "Count"]],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: [66, 66, 66] },
    });
  }

  /**
   * Add entity page with images and details
   */
  private async addEntityPage(
    doc: jsPDF,
    entity: Entity & { images: EntityImage[] },
    entityNumber: number,
    margin: number,
    contentWidth: number,
    pageWidth: number
  ): Promise<void> {
    let yPos = margin;

    // Entity type badge
    const typeColor = this.getTypeColor(entity.type);
    doc.setFillColor(typeColor[0], typeColor[1], typeColor[2]);
    doc.roundedRect(margin, yPos, 30, 8, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(entity.type.toUpperCase(), margin + 15, yPos + 5.5, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    // Entity name
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(entity.name, margin, yPos);
    yPos += 10;

    // Tags
    if (entity.tags && entity.tags.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`Tags: ${entity.tags.join(", ")}`, margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    }

    yPos += 5;

    // Primary image (if available)
    const primaryImage = entity.images.find((img) => img.isPrimary) || entity.images[0];
    if (primaryImage) {
      try {
        // Fetch image and convert to base64
        const imageData = await this.fetchImageAsBase64(primaryImage.url);
        if (imageData) {
          const imgWidth = contentWidth * 0.6;
          const imgHeight = (imgWidth * primaryImage.height) / primaryImage.width;
          const maxHeight = 80;
          const finalHeight = Math.min(imgHeight, maxHeight);
          const finalWidth = (finalHeight * primaryImage.width) / primaryImage.height;

          doc.addImage(
            imageData,
            primaryImage.mimeType.includes("png") ? "PNG" : "JPEG",
            margin + (contentWidth - finalWidth) / 2,
            yPos,
            finalWidth,
            finalHeight
          );
          yPos += finalHeight + 10;
        }
      } catch (error) {
        console.error("Error loading image:", error);
        // Continue without image
      }
    }

    // Description
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Description:", margin, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(entity.description, contentWidth);
    doc.text(descLines, margin, yPos);
    yPos += descLines.length * 5 + 10;

    // Metadata
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Created: ${entity.createdAt.toLocaleDateString()}`,
      margin,
      yPos
    );
    yPos += 5;
    doc.text(`Usage Count: ${entity.usageCount}`, margin, yPos);
    yPos += 5;
    doc.text(`Images: ${entity.images.length}`, margin, yPos);
    doc.setTextColor(0, 0, 0);
  }

  /**
   * Add footers to all pages
   */
  private addFooters(doc: jsPDF, world: World): void {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);

      // Page number
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // World name
      doc.text(world.name, 20, pageHeight - 10);

      // continueml branding
      doc.text("continueml", pageWidth - 20, pageHeight - 10, {
        align: "right",
      });

      doc.setTextColor(0, 0, 0);
    }
  }

  /**
   * Fetch image from URL and convert to base64
   */
  private async fetchImageAsBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = blob.type || "image/jpeg";

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }

  /**
   * Get color for entity type badge
   */
  private getTypeColor(type: string): [number, number, number] {
    const colors: Record<string, [number, number, number]> = {
      character: [59, 130, 246], // blue
      location: [34, 197, 94], // green
      object: [168, 85, 247], // purple
      style: [251, 146, 60], // orange
      custom: [107, 114, 128], // gray
    };
    return colors[type] || [107, 114, 128];
  }

  /**
   * Capitalize first letter of string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export singleton instance
export const pdfService = new PDFService();
