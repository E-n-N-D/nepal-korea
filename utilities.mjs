import axios from "axios";
import { parse, format } from "date-fns";
import cookie from "cookie";

const FLASK_APP_URL = "http://localhost:8333/";
const CAPSOLVER_KEY = "CAP-23FE76728B07D9890480B17213CBCC9D";

// Function to extract cookies from a response header
const extractCookies = (response) => {
  if (response.headers["set-cookie"]) {
    return response.headers["set-cookie"]
      .map((cookieStr) => cookie.parse(cookieStr.split(";")[0] + ";"))
      .reduce((cookies, cookieObj) => ({ ...cookies, ...cookieObj }), {});
  }
  return {};
};

// Function to build a cookie header string from cookies object
const buildCookieHeader = (cookies) => {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
};

const delayForSeconds = async (seconds = 10) => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const getCaptchaText = async (captchaImageBase64) => {
  let data = JSON.stringify({
    clientKey: CAPSOLVER_KEY,
    task: {
      type: "ImageToTextTask",
      module: "common",
      body: captchaImageBase64,
      websiteURL: "https://www.g4k.go.kr",
    },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.capsolver.com/createTask",
    headers: {
      "Content-Type": "application/json",
      Host: "api.capsolver.com",
    },
    data: data,
  };

  return await axios
    .request(config)
    .then((response) => {
      return response.data.solution;
    })
    .catch((error) => {
      console.log(error);
    });
};

const formatDateWithDot = (dateToFormat) => {
  return format(parse(dateToFormat, "yyyyMMdd", new Date()), "yyyy.MM.dd");
};

const fetchGmailOTPCode = async (gmailAccess) => {
  let data = JSON.stringify(gmailAccess);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${FLASK_APP_URL}/fetch-gmail-otp`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  return await axios
    .request(config)
    .then((response) => {
      if (response.data.success) {
        return response.data.otp;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

const storeUserCookies = async (email, cookies) => {
  let data = JSON.stringify({
    key: email,
    value: cookies,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${FLASK_APP_URL}/redis/cookie`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  return await axios
    .request(config)
    .then((response) => {
      return response.data.success;
    })
    .catch((error) => {
      console.log(error);
    });
};

const fetchUserCookies = async (email) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${FLASK_APP_URL}/redis/cookie/${email}`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return await axios
    .request(config)
    .then((response) => {
      if (response.data.success) {
        return response.data;
      } else {
        return {
          success: false,
        };
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export {
  extractCookies,
  buildCookieHeader,
  delayForSeconds,
  formatDateWithDot,
  fetchGmailOTPCode,
  storeUserCookies,
  fetchUserCookies,
  getCaptchaText,
};
