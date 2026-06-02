import { logger } from '../../configs/logger.config.js';


const signUp = async (req, res) => {
  try {
  } catch (error) {
    logger.error('Internal Server Error at api/auth/signUp', {
      stack: error.stack,
      message: error.message,
    });
  }
};
const resendVerificationToken = async (req, res) => {};
const verifyUser = async (req, res) => {};
const signIn = async (req, res) => {};
const logout = async (req, res) => {};
const logoutFromAllDevices = async (req, res) => {};
const refresh = async (req, res) => {};

export {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logout, // Clears user session from current device
  logoutFromAllDevices, // Clear users session from all other loggedIn devices
  refresh,
};
