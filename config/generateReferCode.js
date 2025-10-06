// utils/generateReferCode.js
module.exports = function generateReferCode(name = '') {
  const random = Math.floor(1000 + Math.random() * 9000);
  const prefix = name ? name.slice(0, 3).toUpperCase() : 'REF';
  return `${prefix}${random}`;
};
