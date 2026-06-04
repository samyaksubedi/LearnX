import { envVariables } from '../../Configs/env.config.js';
import { ApiResponse } from '../../utils/api-output.util.js';
import { getDeviceInfo } from './auth.device.js';
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
const verifyUser = async (req, res, next) => {
  try {
    const { token } = req.params;
    await authService.verifyUser(token);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'User verified successfully'));
  } catch (error) {
    next(error);
  }
};
const resendVerificationToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.resendVerificationToken(email);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'Verification email resent, Check your email',
        ),
      );
  } catch (error) {
    next(error);
  }
};
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const deviceInfo = getDeviceInfo(req.headers['user-agent']);

    const { user, accessToken, refreshToken, refreshTokenExpires } =
      await authService.signIn(email, password, deviceInfo, ipAddress);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: envVariables.NODE_ENV == 'production', // set to true in production (HTTPS) else fasle in development
      sameSite: 'strict',
      expires: refreshTokenExpires,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          user, // user has id, name , email only
        },
        'User loggedIn successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res) => {};
const logoutFromAllDevices = async (req, res) => {};
const refresh = async (req, res) => {};
const getAllLoggedInDeviceInfo = async (req, res, next) => {};

export {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logout, // Clears user session from current device
  logoutFromAllDevices, // Clear users session from all other loggedIn devices
  refresh,
  getAllLoggedInDeviceInfo,
};
