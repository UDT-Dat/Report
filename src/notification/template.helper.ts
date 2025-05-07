import * as fs from 'fs';
import * as path from 'path';

export class TemplateHelper {
  /**
   * Load an email template from the filesystem
   */
  static async loadTemplate(templateName: string): Promise<string> {
    // Get the root directory of the project
    const rootDir = process.cwd();

    // Try both src and dist directories
    const possiblePaths = [
      path.join(
        rootDir,
        'src',
        'notification',
        'templates',
        `${templateName}.template.html`,
      ),
      path.join(
        rootDir,
        'dist',
        'notification',
        'templates',
        `${templateName}.template.html`,
      ),
    ];

    for (const templatePath of possiblePaths) {
      try {
        const data = await fs.promises.readFile(templatePath, 'utf8');
        return data;
      } catch (err) {
        // Continue to next path if file not found
        continue;
      }
    }

    throw new Error(
      `Failed to load template: ${templateName}. Template not found in any of the expected locations.`,
    );
  }
}
