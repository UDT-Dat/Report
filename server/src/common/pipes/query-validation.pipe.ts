import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryValidationPipe implements PipeTransform {
  private readonly eqOnlyFieldsSet: Set<string>;
  private readonly allowedAttributesSet: Set<string>;
  private readonly allowedOperatorsSet: Set<string>;
  // private isValidQuery(queryString: string): boolean {
  //     if (!queryString.includes('=')) {
  //       return false;
  //     }
  //     return true
  //   }
  private parseFilterString(filterString?: string): any {
    if (!filterString) return {};

    try {
      // Thử parse như JSON
      return JSON.parse(filterString);
    } catch (e) {
      // Nếu không phải JSON, parse như query string
      return this.parseQueryString(filterString);
    }
  }

  private parseQueryString(queryString: string): any {
    const result = {};
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        result[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }

    return result;
  }
  constructor(
    allowedAttributes: string[],
    allowedOperators: string[],
    eqOnlyFields: string[],
  ) {
    // Chuyển arrays thành Sets để tìm kiếm nhanh hơn với O(1)
    this.allowedAttributesSet = new Set(allowedAttributes);
    this.allowedOperatorsSet = new Set([
      ...allowedOperators,
      'lte',
      'gte',
      'lt',
      'gt',
      'ne',
      'like',
    ]);
    this.eqOnlyFieldsSet = new Set([
      ...eqOnlyFields,
      'page',
      'size',
      'limit',
      'status',
      'title',
    ]);
  }

  transform(value: any) {
    const invalidKeys: string[] = [];

    for (const key of Object.keys(value)) {
      // Parse key to extract attribute and operator
      const lastUnderscoreIndex = key.lastIndexOf('_');
      const hasOperator = lastUnderscoreIndex !== -1;

      const attr = hasOperator ? key.slice(0, lastUnderscoreIndex) : key;
      const op = hasOperator ? key.slice(lastUnderscoreIndex + 1) : 'eq';

      const isEqOnly = this.eqOnlyFieldsSet.has(attr);
      const isAllowedAttr = this.allowedAttributesSet.has(attr) || isEqOnly;
      if (isEqOnly && isAllowedAttr) {
        continue;
      }
      // Validate attribute and operator in one condition check
      if (
        !isAllowedAttr ||
        (isEqOnly && op !== 'eq') ||
        (!isEqOnly && !this.allowedOperatorsSet.has(op))
      ) {
        invalidKeys.push(key);
      }
    }

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid query parameters: ${invalidKeys.join(', ')}`,
      );
    }

    return value;
  }
}
