import * as fs from 'fs';
import * as path from 'path';

export class TemplateHelper {
  /**
   * Load an email template from the filesystem
   */
  static async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.template.html`);
    
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) {
          reject(new Error(`Failed to load template: ${templateName}. ${err.message}`));
          return;
        }
        
        resolve(data);
      });
    });
  }
} 