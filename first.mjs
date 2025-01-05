import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from "fs";
import { country } from "./country.mjs";
import { parse } from "date-fns";
import {
  extractCookies,
  buildCookieHeader,
  delayForSeconds,
  fetchGmailOTPCode,
  // storeUserCookies,
  getCaptchaText,
} from "./utilities.mjs";
import proxyUrl from "./proxy.mjs";
import users from "./users/document-authorization/first.mjs";

class PreLoggedInUser {
  constructor(user, index) {
    this.index = index;
    this.user = user;
    this.cookies = {};
    this.first_url = "https://www.g4k.go.kr/ciph/0800/selectCIPH0801DPeng.do";
    this.email_sender =
      "https://www.g4k.go.kr/cipr/0100/certiFyNonMemberEng.do";
    this.submit_otp =
      "https://www.g4k.go.kr/cipr/0100/certiFyNonMemberConfirm.do";
    this.config = {
      headers: {
        Host: "www.g4k.go.kr",
        "sec-ch-ua":
          '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua-mobile": "?0",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "sec-ch-ua-platform": '"Windows"',
        Origin: "https://www.g4k.go.kr",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Language": "en-US,en;q=0.9",
      },
    };

    this.completeReservationData = {
      visitDe: "",
      resveTimeNm: "",
      timeCd: "",
      visitResveId: "",
      pospprDB: "{}",
      captchaTxt: "",
      idnyCnfrmNo: user.passportNo,
      visitrCttpcNatnCd: "NP",
      visitrCttpc: user.number,
      ntcnRcvpeAgreYn: "N",
      netfunnel_insertVisit: "",
      ...country,
    };

    this.wc = `10.188.149.84_T_${Math.floor(Math.random() * 1000000)}_WC`;

    this.instance = axios.create({
      withCredentials: true,
      // timeout: 2000,
      httpsAgent: new HttpsProxyAgent(proxyUrl, { keepAlive: true }),
      proxy: false,
    });

    this.instance.interceptors.response.use((response) => {
      if (response.headers["set-cookie"]) {
        fs.writeFileSync(
          "cookies.log",
          JSON.stringify(response.headers["set-cookie"]) + "\n",
          { flag: "a" }
        );
        const newCookies = response.headers["set-cookie"];
        const currentCookies = this.instance.defaults.headers.Cookie
          ? this.instance.defaults.headers.Cookie.split("; ")
          : [];

        // Create an object to hold all cookies
        const cookieJar = {};

        // First, add all current cookies to the jar
        currentCookies.forEach((cookie) => {
          const [key, value] = cookie.split("=");
          cookieJar[key] = value;
        });

        // Then, update or add new cookies
        newCookies.forEach((cookie) => {
          const [keyValue] = cookie.split(";"); // Take only the first part (key=value)
          const [key, value] = keyValue.split("=");
          cookieJar[key] = value;
        });

        // Convert the cookie jar back into a string
        this.instance.defaults.headers.Cookie = Object.entries(cookieJar)
          .map(([key, value]) => `${key}=${value}`)
          .join("; ");
      }
      return response;
    });
  }

  logMessage(message, status = null) {
    let fullMsg = `User: "${this.user.name}" - ${message}`;
    if (status === "success") {
      console.log(`\x1b[32m ${fullMsg} \x1b[0m`);
    } else if (status === "error") {
      console.log(`\x1b[31m ${fullMsg} \x1b[0m`);
    } else {
      console.log(fullMsg);
    }
  }

  async runTask() {
    let res = false;
    while (!res) {
      try {
        // ***** Login Steps Start *****
        await this.getPage();
        this.logMessage("Login page fetched.");
        const captchaText = await this.loadCaptcha();

        const url = `https://tc.g4k.go.kr/ts.wseq?opcode=5101&nfid=0&prefix=NetFunnel.gRtype=5101;&sid=service_1&aid=login_btn&js=yes&${Date.now()}`;
        const resp = await this.instance.get(url, {
          headers: {
            ...this.config.headers,
            ...{
              Cookie: buildCookieHeader(this.cookies),
            },
          },
        });

        // await this.submitEmailOtp(otpCode);
        this.logMessage("Submitting Login form.");
        res = await this.doLoginProcess(captchaText);
        // ****** Login Steps End ******
      } catch (e) {
        console.log(e);
      }
    }
    this.logMessage("Successfully logged in:", "success");
    this.logMessage("Appointment Booking Starts");
    res = false;
    while (!res) {
      try {
        await this.getTime();
        res = await this.getAppointment();
      } catch (error) {
        console.log(error.message);
      }
    }

    return;
  }

  async getTime() {
    let jsonFilePath = "available_dates.json";
    while (true) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
        if (Array.isArray(data) && data.length > 0 && data.length >= index) {
          this.completeReservationData.visitDe = data[index].emblCd;
          this.completeReservationData.timeCd = data[index].timeCd;
          this.completeReservationData.resveTimeNm =
            data[index]?.timeNm?.split(" ~ ")[0];
          this.completeReservationData.visitResveId = data[index].visitResveId;
        }
      } catch (error) {
        console.error("Error reading JSON file:", error.message);
      }
      await delayForSeconds(0.1);
    }
    return;
  }

  async getAppointment() {
    this.completeReservationData.captchaTxt = await this.loadCaptcha(true);

    const url = `https://tc.g4k.go.kr/ts.wseq?opcode=5101&nfid=0&prefix=NetFunnel.gRtype=5101;&sid=service_1&aid=INSERT_VISIT&js=yes&&${Date.now()}`;
    const resp = await this.instance.get(url, {
      headers: {
        ...this.config.headers,
        ...{
          Cookie: buildCookieHeader(this.cookies),
        },
      },
    });

    const arr = resp.data
      .split(";")[1]
      .replace("NetFunnel.gControl.result='", "");
    const key = arr.split("&")[0].split("=")[1];
    const n_cookie = arr.replace("'", "");
    this.completeReservationData.netfunnel_insertVisit = key;

    const resvData = new URLSearchParams(
      this.completeReservationData
    ).toString();

    const last_resp = await this.instance.post(
      "https://www.g4k.go.kr/ciph/0800/insertResveVisitEng.do",
      resvData,
      {
        headers: {
          ...this.config.headers,
          ...{
            Cookie:
              buildCookieHeader(this.cookies) +
              `; NetFunnel_ID=${encodeURIComponent(n_cookie)}`,
          },
        },
      }
    );

    if (last_resp.data?.wsdlErrorNm && last_resp.data.wsdlErrorNm != "실패") {
      this.logMessage(
        `${this.user.name} : Appointment Booked: ID: "${last_resp.data?.wsdlErrorNm}"`,
        "success"
      );
      return true;
    }
    return false;
  }

  async getPage() {
    const response = await this.instance.get(
      "https://www.g4k.go.kr/cipl/0100/login.do"
    );
    this.cookies = { ...this.cookies, ...extractCookies(response) };
  }

  async loadCaptcha(last = false) {
    this.logMessage("Finding Captcha Text...");
    while (true) {
      try {
        let captchaResponse = null;
        const captchaName = last ? "captchaImg" : "captchaSms";
        const image_url = `https://www.g4k.go.kr/biz/common/captchaImage.do?g=${Date.now()}&objGubn=${captchaName}`;
        const response = await this.instance.get(image_url, {
          responseType: "arraybuffer",
          headers: {
            ...this.config.headers,
            ...{
              Cookie: buildCookieHeader(this.cookies),
            },
          },
        });
        this.cookies = { ...this.cookies, ...extractCookies(response) };

        const base64 = Buffer.from(response.data, "binary").toString("base64");
        captchaResponse = await getCaptchaText(base64);
        // console.log(captchaResponse);
        if (
          captchaResponse.confidence * 100 >= 98 &&
          captchaResponse.text.length === 6
        ) {
          this.logMessage(`Captcha Found: ${captchaResponse.text}`);
          return captchaResponse.text;
        }
        this.logMessage("Captcha Not Found, trying again.");
      } catch (error) {
        this.logMessage(
          "Error fetching or converting the image: " + error.message
        );
      }
    }
  }

  async submitCaptcha(captchaText) {
    this.logMessage("Submitting Login Captcha.");
    const data = {
      captchaTxt: captchaText,
      langTypeWebsite: "ENG",
      rcvpe_num: this.user.number,
      mberNm: this.user.name,
      emailAddr: this.user.email,
      certNoFlag: "NONE",
    };
    // console.log(data);
    while (true) {
      try {
        const res_ = await this.instance.post(this.email_sender, data, {
          headers: {
            ...this.config.headers,
            ...{
              Referer: "https://www.g4k.go.kr/cipl/0100/login.do",
              Cookie: buildCookieHeader(this.cookies),
            },
          },
        });

        this.cookies = { ...this.cookies, ...extractCookies(res_) };
        return;
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  async submitEmailOtp(otpCode) {
    const otpres = await this.instance.post(
      this.submit_otp,
      {
        crtfKeyNo: otpCode,
      },
      this.config
    );
    await this.doLoginProcess(otpCode);
  }

  async doLoginProcess(captcha) {
    const url = "https://www.g4k.go.kr/cipl/0100/loginProcess.do";
    const formData = new URLSearchParams();
    formData.append("ksignInputMberId", "");
    formData.append("loginType", "idpw");
    formData.append("failResult", "");
    formData.append("cffdnCd", "");
    formData.append("callCd", "");
    formData.append("forwardUrl", "/");
    formData.append("loginId", this.user.email);
    formData.append("loginPwd", this.user.password);
    formData.append("captchaTxt", captcha);

    try {
      const resp = await this.instance.post(url, formData.toString(), {
        headers: {
          ...this.config.headers,
          ...{
            Cookie: buildCookieHeader(this.cookies),
          },
        },
      });
      this.cookies = { ...this.cookies, ...extractCookies(resp) };
      console.log(resp);
      console.log(this.cookies);

      return true;
    } catch (error) {
      this.logMessage(`Error doLoginProcess: ${error.message}`);
      return false;
    }
  }
}

users.map(async (user, index) => {
  await new PreLoggedInUser(user, index).runTask();
});

// // Function to monitor the JSON file
// async function monitorJsonFile() {
//   let previousData = [];
//   while (true) {
//     try {
//       const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
//       if (Array.isArray(data) && data.length > 0 && data.length !== previousData.length) {
//         previousData = data; // Update previous data
//         // Run PreLoggedInUser for each user in the array
//         for (let index = 0; index < data.length && index < users.length; index++) {
//           await new PreLoggedInUser(users[index], index, data[index]).runTask();
//         }
//       }
//     } catch (error) {
//       console.error("Error reading JSON file:", error.message);
//     }
//     delayForSeconds(0.1);
//   }
// }

// // Start monitoring the JSON file
// monitorJsonFile();

// // ... existing code ...
