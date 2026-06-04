import { UAParser } from 'ua-parser-js';

const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || 'Unknown',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || 'Unknown',
    deviceType: result.device.type || 'Desktop',
    userAgent,
  };
};

export { getDeviceInfo };
