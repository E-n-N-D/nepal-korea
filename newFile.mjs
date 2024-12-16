import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from "fs";
// import cookie from "cookie";
// import * as cheerio from "cheerio";
// import * as CapSolver from "capsolver";
import {country} from './country.mjs';
import {parse} from "date-fns";
import {
  extractCookies,
  buildCookieHeader,
  delayForSeconds,
  fetchGmailOTPCode,
  storeUserCookies,
  getCaptchaText,
} from "./utilities.mjs";
// import cookie_data from './data.json' assert { type: 'json' };
import proxyUrl from "./proxy.mjs";
import users from "./users/document-authorization/2024-10-06.mjs";

class PreLoggedInUser {
  constructor(user) {
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
        ...country
      };

    this.wc = `10.188.149.84_T_${Math.floor(Math.random() * 1000000)}_WC`;

    this.instance = axios.create({
      withCredentials: true,
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
    try {
      let res = false;
      while (!res) {
        // ***** Login Steps Start *****
        await this.getPage();
        this.logMessage("Login page fetched.");
        const captchaText = await this.loadCaptcha();
        //   console.log(captchaText);

        await this.submitCaptcha(captchaText);
        this.logMessage("Waiting for 20 seconds.");
        await delayForSeconds(20);

        this.logMessage("Fetching OTP from Gmail.");

        let otpCode = await fetchGmailOTPCode({
          email: this.user.email,
          password: this.user.password,
        });
        
        //   console.log(otpCode);
        if (!otpCode) {
          this.logMessage("OTP Not found, QUITTING!");
          await delayForSeconds(2);
          otpCode = await fetchGmailOTPCode({
            email: this.user.email,
            password: this.user.password,
          });
        }
        // await this.submitEmailOtp(otpCode);
        this.logMessage("Submitting Login form.");
        res = await this.doLoginProcess(otpCode);
        this.logMessage("Successfully logged in:", "success")
        // ****** Login Steps End ******
      }

      this.logMessage("Appointment Booking Starts")
      await this.getTime()
      await this.getAppointment()

      return;
    } catch (e) {
      console.log(e);
    }
  }

  async getTime(){
    const inte = axios.create({
        withCredentials: true,
        httpsAgent: new HttpsProxyAgent(proxyUrl, { keepAlive: true }),
        proxy: false,
        headers: {
            Host: "www.g4k.go.kr",
            "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua-mobile": "?0",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "sec-ch-ua-platform": '"Windows"',
            Origin: "https://www.g4k.go.kr",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Accept-Language": "en-US,en;q=0.9",
        }
    })

    const visitReserveCalendarUrl = "https://www.g4k.go.kr/ciph/0800/selectVisitReserveCalendarYes.do";
    let dta = `emblCd=AQ&emblTime=202412&visitResveBussGrpCd=AQ0046`;
    let filteredDates = []

    while (filteredDates.length == 0) {
        try {
            const selectableDates = await inte.post(visitReserveCalendarUrl, dta)
            filteredDates = selectableDates.data.visitReserveCalendarYesResult
            .flat()
            .filter(
            (date) =>
                date.visitYn === "Y" &&
            parse(date.visitDe, "yyyyMMdd", new Date()) > new Date()
            );
            console.log("Date available: ", filteredDates)
        } catch (error) {
            console.log(error.message)
        }
        await delayForSeconds(0.1)
    }
    const pickedDate = filteredDates[filteredDates.length - 1].visitDe;
    dta = `emblCd=AQ&visitDe=${pickedDate}&visitResveBussGrpCd=AQ0046`;
    const visitTimeUrl = "https://www.g4k.go.kr/ciph/0800/selectVisitReserveTime.do";
    const resp = await inte.post(visitTimeUrl, dta);
    
    // pick first time slot available
    const availableSlots = resp.data.resveResult.filter(
    (time) => time.visitYn == "Y"
    );
    console.log(availableSlots[availableSlots.length - 1])

    let selectedTimeSlot = availableSlots[availableSlots.length - 1];
    console.log(`Selected Time - ${selectedTimeSlot?.timeNm}`);

    this.completeReservationData.visitDe = pickedDate
    this.completeReservationData.timeCd = selectedTimeSlot.timeCd
    this.completeReservationData.resveTimeNm = selectedTimeSlot?.timeNm?.split(" ~ ")[0];
    this.completeReservationData.visitResveId = selectedTimeSlot.visitResveId
    
    return;
  }


  async getAppointment(){
    this.completeReservationData.captchaTxt = await this.loadCaptcha(true)

    const url = `https://tc.g4k.go.kr/ts.wseq?opcode=5101&nfid=0&prefix=NetFunnel.gRtype=5101;&sid=service_1&aid=INSERT_VISIT&js=yes&&${Date.now()}`;
    const resp = await this.instance.get(url, {
        headers: {
          ...this.config.headers,
          ...{
            Cookie: buildCookieHeader(this.cookies),
          },
        },
      });

    const arr = resp.data.split(";")[1].replace("NetFunnel.gControl.result='", "");
    const key = arr.split("&")[0].split("=")[1]
    const n_cookie = arr.replace("'","")
    this.completeReservationData.netfunnel_insertVisit = key

    const resvData = new URLSearchParams(this.completeReservationData).toString()
    
    const last_resp = await this.instance.post(
        "https://www.g4k.go.kr/ciph/0800/insertResveVisitEng.do",
        resvData, {
            headers: {
                ...this.config.headers,
                ...{
                Cookie: buildCookieHeader(this.cookies) + `; NetFunnel_ID=${encodeURIComponent(n_cookie)}`,
                },
            },
        }
    );

    if (last_resp.data?.wsdlErrorNm && last_resp.data.wsdlErrorNm != "실패") {
        this.logMessage(`${this.user.name} : Appointment Booked: ID: "${last_resp.data?.wsdlErrorNm}"`,'success')
      }
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

  async doLoginProcess(otp) {
    const preLoginUrl = "https://www.g4k.go.kr/cipr/0100/selectNonMember.do";
    const data = new URLSearchParams({
      mberNm: this.user.name,
      // nationCd: "NP",
      nationCd: "AQ",
      moblTelNo: this.user.number,
      emailAddr: this.user.email,
      crtfKeyNo: otp,
      loginType: "emailChk",
    }).toString();

    const resp = await this.instance.post(preLoginUrl, data, this.config);
    // console.log(resp.data);

    // await getNetFunnelId(); //add netfunnelcookie
    const url = "https://www.g4k.go.kr/cipl/0100/loginProcess.do";
    const formData = new URLSearchParams();
    formData.append("NomemberloginType", "idpw");
    formData.append("NomemberloginFormTyp", "popup");
    formData.append("NomemberforwardUrl", "/ciph/0800/selectCIPH0801S1eng.do");
    formData.append("loginId", "NOMEMBER");

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

      return true;
    } catch (error) {
      this.logMessage(`Error doLoginProcess: ${error.message}`);
      return false;
    }
  }
}

users.map(async (user) => {
  await new PreLoggedInUser(user).runTask();
});
