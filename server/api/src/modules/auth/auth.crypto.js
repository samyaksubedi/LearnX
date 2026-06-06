import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
const comparePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};
// const hashRefreshToken = async (refreshToken) => {
//   const salt = await bcrypt.genSalt(10);
//   return bcrypt.hash(refreshToken, salt);
// };
// const compareRefreshToken = async (plain, hashed) => {
//   return bcrypt.compare(plain, hashed);
// };

export { hashPassword, comparePassword };
