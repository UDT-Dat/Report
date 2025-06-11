const mongoose = require('mongoose');
export const toObjectId = (string: string) =>
  new mongoose.Types.ObjectId(string?.toString());
