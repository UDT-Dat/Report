const _ = require('lodash');

export interface DataObject {
  _id?: any;
  [key: string]: any;
}

export const getInfoData = (
  fields: string[] = [],
  object: DataObject = {},
  key: string = '_id',
): DataObject => {
  const { _id, ...rest } = object;
  if (!fields.length) {
    return {
      ...rest,
      [key]: _id,
    };
  }

  const [fieldsToKeep, fieldsToRemove] = fields.reduce<[string[], string[]]>(
    ([keep, remove], field) => {
      const target = field.startsWith('-') ? remove : keep;
      target.push(field.replace(/^-/, ''));
      return [keep, remove];
    },
    [[], []],
  );

  const result = fieldsToKeep.length ? _.pick(rest, fieldsToKeep) : rest;

  const sanitizedResult = fieldsToRemove.length
    ? _.omit(result, fieldsToRemove)
    : result;

  if (
    sanitizedResult &&
    typeof sanitizedResult === 'object' &&
    !Array.isArray(sanitizedResult)
  ) {
    return _id
      ? ({ ...sanitizedResult, [key]: _id } as DataObject)
      : (sanitizedResult as DataObject);
  }
  return {};
};
