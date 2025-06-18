const operators = ['lte', 'gte', 'lt', 'gt', 'ne', 'like'];
const regex = new RegExp(`_(${operators.join('|')})$`);
function splitKey(key) {
  const match = key.match(regex);
  if (!match) return { attribute: key, operator: null };
  const operator = match[0].slice(1);
  const field = key.slice(0, -operator.length - 1);

  return {
    attribute: field,
    operator,
  };
}

export default function convertParam(queryParams: object) {
  const result = {};
  const errors: string[] = [];
  const pagination = {
    limit: 10,
    page: 1,
  };

  for (const [key, value] of Object.entries(queryParams)) {
    const { attribute, operator } = splitKey(key);
    const operand = value;

    if (typeof value === 'string') {
      switch (operator) {
        case 'gt':
          if (isNaN(operand)) {
            errors.push(
              `${attribute}: ${value} - giá trị không hợp lệ cho ${operator}`,
            );
            break;
          }
          result[attribute] = {
            ...result[attribute],
            $gt: parseFloat(operand),
          };
          break;
        case 'lt':
          if (isNaN(operand)) {
            errors.push(
              `${attribute}: ${value} - giá trị không hợp lệ cho ${operator}`,
            );
            break;
          }
          result[attribute] = {
            ...result[attribute],
            $lt: parseFloat(operand),
          };
          break;
        case 'gte':
          if (isNaN(operand)) {
            errors.push(
              `${attribute}: ${value} - giá trị không hợp lệ cho ${operator}`,
            );
            break;
          }
          result[attribute] = {
            ...result[attribute],
            $gte: parseFloat(operand),
          };
          break;
        case 'lte':
          if (isNaN(operand)) {
            errors.push(
              `${attribute}: ${operand} - giá trị không hợp lệ cho ${operator}`,
            );
            break;
          }
          result[attribute] = {
            ...result[attribute],
            $lte: parseFloat(operand),
          };
          break;
        case 'like':
          result[attribute] = { $regex: operand, $options: 'i' };
          break;
        case 'ne':
          if (!isNaN(operand)) {
            result[attribute] = {
              ...result[attribute],
              $ne: parseFloat(operand),
            };
            break;
          }
          result[attribute] = {
            ...result[attribute],
            $ne: decodeURIComponent(operand),
          };
          break;
        default:
          if (['true', 'false'].includes(value)) {
            result[attribute] = value === 'true';
            break;
          }
          if (key === 'limit') {
            pagination.limit = isNaN(Number(value)) ? 10 : Number(value);
            break;
          }
          if (key === 'page') {
            pagination.page = isNaN(Number(value)) ? 1 : Number(value);
            break;
          }
          result[key] =
            isNaN(Number(value)) || !value ? value : parseFloat(value);
      }
    } else if (value) {
      result[key] = value;
    }
  }

  return { result, errors, pagination };
}
