import axios from "axios";
import { parse, format } from "date-fns";
import cookie from "cookie";

const FLASK_APP_URL = "http://localhost:8333/";
const CAPSOLVER_KEY = "CAP-9CDB5CBF6DE85C23F5BF38365A4B9441";

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

export {
  extractCookies,
  buildCookieHeader,
  delayForSeconds,
  formatDateWithDot,
  fetchGmailOTPCode,
  getCaptchaText,
};
