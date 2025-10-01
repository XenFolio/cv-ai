import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { CVData, PersonalSection, ExperienceItem, EducationItem, SkillsSection, CVSection } from '@/types/cv';
import { templates } from '@/components/CVCreator/templates';

interface ExportOptions {
  format: 'pdf' | 'docx';
  quality: 'standard' | 'high' | 'print';
  includeATS: boolean;
  watermark?: string;
}

interface ExportResult {
  success: boolean;
  url?: string;
  error?: string;
}

class ExportService {
  private async createHighQualityCanvas(element: HTMLElement, quality: number = 2): Promise<HTMLCanvasElement> {
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      logging: false,

      foreignObjectRendering: true
    });

    return canvas;
  }

  async exportToPDF(
    element: HTMLElement,
    filename: string,
    options: ExportOptions = { format: 'pdf', quality: 'high', includeATS: true }
  ): Promise<ExportResult> {
    try {
      const quality = options.quality === 'standard' ? 1.5 : options.quality === 'high' ? 2 : 3;
      const canvas = await this.createHighQualityCanvas(element, quality);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add metadata
      const metadata = {
        title: filename,
        subject: 'CV - Curriculum Vitae',
        author: 'CV ATS Pro',
        creator: 'CV ATS Pro',
        producer: 'CV ATS Pro Export Engine',
        keywords: 'CV, resume, curriculum vitae, ATS'
      };

      pdf.setProperties(metadata);

      // Add watermark if specified
      if (options.watermark) {
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(60);
          pdf.setTextColor(200, 200, 200);
          pdf.setGState({ opacity: 0.1 });
          pdf.text(options.watermark, 105, 150, { align: 'center', angle: 45 });
        }
      }

      // Save the PDF
      pdf.save(filename);

      return {
        success: true,
        url: pdf.output('dataurlstring')
      };
    } catch (error) {
      console.error('PDF Export Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during PDF export'
      };
    }
  }

  async exportToDOCX(cvData: CVData, filename: string): Promise<ExportResult> {
    try {
      // Create HTML content optimized for Word
      const htmlContent = this.generateWordHTML(cvData);

      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], {
        type: 'application/msword'
      });

      // Save the file
      saveAs(blob, filename);

      return {
        success: true,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('DOCX Export Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during DOCX export'
      };
    }
  }

  private generateWordHTML(cvData: CVData): string {
    const personal = (cvData.sections.find((s: CVSection) => s.type === 'personal')?.content as PersonalSection) || {};
    const experience = (cvData.sections.find((s: CVSection) => s.type === 'experience')?.content as ExperienceItem[]) || [];
    const education = (cvData.sections.find((s: CVSection) => s.type === 'education')?.content as EducationItem[]) || [];
    const skills = (cvData.sections.find((s: CVSection) => s.type === 'skills')?.content as SkillsSection) || {};

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${personal.name || 'CV'}</title>
      <style>
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          margin: 2cm;
          color: #333333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2pt solid #007acc;
          padding-bottom: 10px;
        }
        .name {
          font-size: 20pt;
          font-weight: bold;
          color: #007acc;
          margin-bottom: 5px;
        }
        .title {
          font-size: 14pt;
          font-weight: bold;
          color: #666666;
          margin-bottom: 10px;
        }
        .contact {
          font-size: 10pt;
          color: #666666;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          color: #007acc;
          margin-bottom: 10px;
          border-bottom: 1pt solid #007acc;
          padding-bottom: 2px;
        }
        .experience-item, .education-item {
          margin-bottom: 15px;
        }
        .item-header {
          font-weight: bold;
          margin-bottom: 2px;
        }
        .item-subheader {
          font-style: italic;
          color: #666666;
          margin-bottom: 5px;
        }
        .item-date {
          color: #666666;
          font-size: 10pt;
        }
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill-category {
          margin-bottom: 10px;
        }
        .skill-category-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .skill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .skill-tag {
          background-color: #f0f0f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10pt;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="name">${personal.name || ''}</div>
        <div class="title">${personal.title || ''}</div>
        <div class="contact">
          ${personal.email ? `📧 ${personal.email} | ` : ''}
          ${personal.phone ? `📱 ${personal.phone} | ` : ''}
          ${personal.location ? `📍 ${personal.location}` : ''}
        </div>
      </div>

      <!-- Summary -->
      ${personal.summary ? `
      <div class="section">
        <div class="section-title">Résumé Professionnel</div>
        <p>${personal.summary}</p>
      </div>
      ` : ''}

      <!-- Experience -->
      ${experience.length > 0 ? `
      <div class="section">
        <div class="section-title">Expérience Professionnelle</div>
        ${experience.map((exp: ExperienceItem) => `
          <div class="experience-item">
            <div class="item-header">${exp.position || exp.title}</div>
            <div class="item-subheader">${exp.company}</div>
            <div class="item-date">${exp.startDate} - ${exp.endDate || 'Présent'}</div>
            <p>${exp.description || ''}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Education -->
      ${education.length > 0 ? `
      <div class="section">
        <div class="section-title">Formation</div>
        ${education.map((edu: EducationItem) => `
          <div class="education-item">
            <div class="item-header">${edu.degree || edu.diploma}</div>
            <div class="item-subheader">${edu.institution}</div>
            <div class="item-date">${edu.startDate} - ${edu.endDate || 'Présent'}</div>
            ${edu.description ? `<p>${edu.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Skills -->
      ${(skills.technical?.length || skills.soft?.length) ? `
      <div class="section">
        <div class="section-title">Compétences</div>
        <div class="skills-container">
          ${skills.technical?.length ? `
            <div class="skill-category">
              <div class="skill-category-title">Compétences Techniques</div>
              <div class="skill-list">
                ${skills.technical.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${skills.soft?.length ? `
            <div class="skill-category">
              <div class="skill-category-title">Compétences Douces</div>
              <div class="skill-list">
                ${skills.soft.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Additional sections -->
      ${cvData.sections.filter(s => !['personal', 'experience', 'education', 'skills'].includes(s.type) && s.visible).map(section => `
        <div class="section">
          <div class="section-title">${section.title}</div>
          <p>${section.content || ''}</p>
        </div>
      `).join('')}

      <!-- Footer -->
      <div style="margin-top: 50px; text-align: center; font-size: 8pt; color: #999999;">
        Généré par CV ATS Pro - ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </body>
    </html>
    `;
  }

  async exportWithTemplate(
    cvData: CVData,
    templateId: string,
    filename: string,
    options: ExportOptions = { format: 'pdf', quality: 'high', includeATS: true }
  ): Promise<ExportResult> {
    try {
      // Create a temporary element with the template styling
      const tempElement = document.createElement('div');
      tempElement.innerHTML = this.generateTemplateHTML(cvData, templateId);
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.width = '210mm'; // A4 width
      document.body.appendChild(tempElement);

      let result: ExportResult;

      if (options.format === 'pdf') {
        result = await this.exportToPDF(tempElement, filename, options);
      } else {
        result = await this.exportToDOCX(cvData, filename);
      }

      // Clean up
      document.body.removeChild(tempElement);

      return result;
    } catch (error) {
      console.error('Template Export Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during template export'
      };
    }
  }

  private generateTemplateHTML(cvData: CVData, templateId: string): string {
    const template = templates.find(t => t.id === templateId);

    const primaryColor = template ? '#' + template.theme.primaryColor : '#3b82f6';
    const fontFamily = template ? `'${template.theme.font}', -apple-system, BlinkMacSystemFont, sans-serif` : 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

    // Ajuster les styles pour le template créatif (marges réduites)
    const headerMarginTop = templateId === '2' ? '10px' : '30px';
    const headerMarginBottom = templateId === '2' ? '20px' : '40px';
    const containerPadding = templateId === '2' ? '20px' : '40px 20px';

    const baseStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=${template?.theme.font === 'Inter' ? 'Inter:wght@300;400;500;600;700&display=swap' : 'noto-sans:wght@300;400;500;600;700&display=swap'}');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: ${fontFamily};
          line-height: 1.6;
          color: #333;
          background: white;
        }

        .cv-container {
          max-width: 800px;
          margin: 0 auto;
          padding: ${containerPadding};
        }

        .cv-header {
          text-align: center;
          margin-top: ${headerMarginTop};
          margin-bottom: ${headerMarginBottom};
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }

        .cv-name {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .cv-title {
          font-size: 1.25rem;
          color: #6b7280;
          margin-bottom: 16px;
        }

        .cv-contact {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .cv-section {
          margin-bottom: 32px;
        }

        .cv-section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${primaryColor};
        }

        .cv-item {
          margin-bottom: 20px;
        }

        .cv-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .cv-item-title {
          font-weight: 600;
          color: #1f2937;
        }

        .cv-item-company {
          color: ${primaryColor};
          font-weight: 500;
        }

        .cv-item-date {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .cv-item-description {
          color: #4b5563;
          margin-top: 8px;
        }

        .cv-skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .cv-skill-category {
          margin-bottom: 16px;
        }

        .cv-skill-category-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .cv-skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cv-skill-tag {
          background-color: #eff6ff;
          color: ${primaryColor};
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.875rem;
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${(cvData.sections.find(s => s.type === 'personal')?.content as PersonalSection)?.name || 'CV'}</title>
        ${baseStyles}
      </head>
      <body>
        <div class="cv-container">
          ${this.generateCVContent(cvData, templateId)}
        </div>
      </body>
      </html>
    `;
  }

  private generateCVContent(cvData: CVData, templateId: string): string {
    const template = templates.find(t => t.id === templateId);

    const personal = (cvData.sections.find(s => s.type === 'personal')?.content as PersonalSection) || {};

    const sectionTitles = template?.sectionTitles || {
      profileTitle: 'Résumé Professionnel',
      experienceTitle: 'Expérience Professionnelle',
      educationTitle: 'Formation',
      skillsTitle: 'Compétences',
      languagesTitle: 'Langues',
      contactTitle: 'CONTACT'
    };

    return `
      <!-- Header -->
      <div class="cv-header">
        <h1 class="cv-name">${personal.name || ''}</h1>
        <div class="cv-title">${personal.title || ''}</div>
        <div class="cv-contact">
          ${personal.email ? `<span>📧 ${personal.email}</span>` : ''}
          ${personal.phone ? `<span>📱 ${personal.phone}</span>` : ''}
          ${personal.location ? `<span>📍 ${personal.location}</span>` : ''}
        </div>
      </div>

      <!-- Summary -->
      ${personal.summary ? `
      <div class="cv-section">
        <h2 class="cv-section-title">${sectionTitles.profileTitle}</h2>
        <p>${personal.summary}</p>
      </div>
      ` : ''}

      <!-- Experience -->
      ${this.generateExperienceSection(cvData, sectionTitles)}

      <!-- Education -->
      ${this.generateEducationSection(cvData, sectionTitles)}

      <!-- Skills -->
      ${this.generateSkillsSection(cvData, sectionTitles)}

      <!-- Additional Sections -->
      ${cvData.sections.filter(s => !['personal', 'experience', 'education', 'skills'].includes(s.type) && s.visible).map(section => `
        <div class="cv-section">
          <h2 class="cv-section-title">${section.title}</h2>
          <div>${section.content || ''}</div>
        </div>
      `).join('')}
    `;
  }

  private generateExperienceSection(cvData: CVData, sectionTitles: Record<string, string>): string {
    const experience = (cvData.sections.find(s => s.type === 'experience')?.content as ExperienceItem[]) || [];

    if (!experience.length) return '';

    return `
      <div class="cv-section">
        <h2 class="cv-section-title">${sectionTitles.experienceTitle}</h2>
        ${experience.map((exp: ExperienceItem) => `
          <div class="cv-item">
            <div class="cv-item-header">
              <div>
                <div class="cv-item-title">${exp.position || exp.title}</div>
                <div class="cv-item-company">${exp.company}</div>
              </div>
              <div class="cv-item-date">${exp.startDate} - ${exp.endDate || 'Présent'}</div>
            </div>
            ${exp.description ? `<div class="cv-item-description">${exp.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateEducationSection(cvData: CVData, sectionTitles: Record<string, string>): string {
    const education = (cvData.sections.find(s => s.type === 'education')?.content as EducationItem[]) || [];

    if (!education.length) return '';

    return `
      <div class="cv-section">
        <h2 class="cv-section-title">${sectionTitles.educationTitle}</h2>
        ${education.map((edu: EducationItem) => `
          <div class="cv-item">
            <div class="cv-item-header">
              <div>
                <div class="cv-item-title">${edu.degree || edu.diploma}</div>
                <div class="cv-item-company">${edu.institution}</div>
              </div>
              <div class="cv-item-date">${edu.startDate} - ${edu.endDate || 'Présent'}</div>
            </div>
            ${edu.description ? `<div class="cv-item-description">${edu.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateSkillsSection(cvData: CVData, sectionTitles: Record<string, string>): string {
    const skills = (cvData.sections.find(s => s.type === 'skills')?.content as SkillsSection) || {};

    if ((!skills.technical?.length) && (!skills.soft?.length)) return '';

    return `
      <div class="cv-section">
        <h2 class="cv-section-title">${sectionTitles.skillsTitle}</h2>
        <div class="cv-skills-grid">
          ${skills.technical?.length ? `
            <div class="cv-skill-category">
              <div class="cv-skill-category-title">Compétences Techniques</div>
              <div class="cv-skills-list">
                ${skills.technical.map((skill: string) => `<span class="cv-skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${skills.soft?.length ? `
            <div class="cv-skill-category">
              <div class="cv-skill-category-title">Compétences Douces</div>
              <div class="cv-skill-list">
                ${skills.soft.map((skill: string) => `<span class="cv-skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

export default ExportService;
