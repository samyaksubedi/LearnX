import { envVariables } from '../../Configs/env.config.js';
import { ApiError, ApiResponse } from '../../utils/api-output.util.js';
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
const logout = async (req, res, next) => {
  try {
    const sessionId = req.user.sessionId;
    await authService.logout(sessionId);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: envVariables.NODE_ENV == 'production', // set to true in production (HTTPS) else fasle in development
      sameSite: 'strict',
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'User logged Out successfully'));
  } catch (error) {
    next(error);
  }
};
const logoutFromAllDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deviceCount = await authService.logoutFromAllDevices(userId);
    console.log(deviceCount);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: envVariables.NODE_ENV == 'production', // set to true in production (HTTPS) else fasle in development
      sameSite: 'strict',
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `User logged out from all ${deviceCount} devices .  `,
        ),
      );
  } catch (error) {
    next(error);
  }
};
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(400)
        .json(new ApiError(400, 'refreshToken is missing in cookies!'));
    }
    const accessToken = await authService.refresh(refreshToken);
    return res.status(200).json(new ApiResponse(200, { accessToken }));
  } catch (error) {
    next(error);
  }
};
const getAllLoggedInDeviceInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const devicesInfo = await authService.getAllLoggedInDeviceInfo(userId);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          devicesInfo,
          'Logged in devices info fetched successfully !',
        ),
      );
  } catch (error) {
    next(error);
  }
};
const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await authService.getMe(id);
    return res
      .status(200)
      .json(new ApiResponse(200, user, 'User fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logout, // Clears user session from current device
  logoutFromAllDevices, // Clear users session from all other loggedIn devices
  refresh,
  getAllLoggedInDeviceInfo,
  getMe,
};
