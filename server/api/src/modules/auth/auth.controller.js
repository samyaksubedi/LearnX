import { logger } from '../../configs/logger.config.js';
import { ApiResponse } from '../../utils/api-output.util.js';
import { authService } from './auth.service.js';

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.signUp({ name, email, password });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          'User Registered Successfully! Please check your Email and Verify it.',
        ),
      );
  } catch (error) {
    
    next(error);
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
