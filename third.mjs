import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import fs from "fs";
import { country } from "./country.mjs";
import {
    extractCookies,
    buildCookieHeader,
    delayForSeconds,
    fetchGmailOTPCode,
    // storeUserCookies,
    getCaptchaText,
} from "./utilities.mjs";
import proxyUrl from "./proxy.mjs";
import { parse } from "date-fns";


async function fetch_available_dates() {
    let instance = axios.create({
        withCredentials: true,
        // timeout: 2000,
        httpsAgent: new HttpsProxyAgent(proxyUrl, { keepAlive: true }),
        proxy: false,
    });
    const visitReserveCalendarUrl =
        "https://www.g4k.go.kr/ciph/0800/selectVisitReserveCalendarYes.do";
    const date = "202501";
    let dta = `emblCd=${country.emblCd}&emblTime=${date}&visitResveBussGrpCd=${country.mainKind}`;
    let filteredDates = [];
    // while (filteredDates.length == 0) {
    try {
        const selectableDates = await instance.post(visitReserveCalendarUrl, dta);
        filteredDates = selectableDates.data.visitReserveCalendarYesResult
            .flat()
            .filter(
                (date) =>
                    date.visitYn === "Y" &&
                    parse(date.visitDe, "yyyyMMdd", new Date()) > new Date()
            );
        // console.log("Date available: ", filteredDates);
        // fs.writeFileSync('available_dates.json', JSON.stringify(filteredDates, null, 2));
    } catch (error) {
        console.log(error.message);
    }

    // while (filteredDates.length == 0) {
    //     try {
    //         const selectableDates = await inte.post(visitReserveCalendarUrl, dta);
    //         filteredDates = selectableDates.data.visitReserveCalendarYesResult
    //             .flat()
    //             .filter(
    //                 (date) =>
    //                     date.visitYn === "Y" &&
    //                     parse(date.visitDe, "yyyyMMdd", new Date()) > new Date()
    //             );
    //         console.log("Date available: ", filteredDates);
    //     } catch (error) {
    //         console.log(error.message);
    //     }
    //     await delayForSeconds(0.1);
    // }
    let all_slots = [];
    for (let pickedDate of filteredDates) {
        pickedDate = pickedDate.visitDe;
        dta = `emblCd=${country.emblCd}&visitDe=${pickedDate}&visitResveBussGrpCd=${country.mainKind}`;
        const visitTimeUrl =
            "https://www.g4k.go.kr/ciph/0800/selectVisitReserveTime.do";
        const resp = await instance.post(visitTimeUrl, dta);

        // pick first time slot available
        const availableSlots = resp.data.resveResult.filter(
            (time) => time.visitYn == "Y"
        );
        all_slots = all_slots.concat(availableSlots)
        fs.writeFileSync('available_dates.json', JSON.stringify(all_slots, null, 2));
        await delayForSeconds(2);
        // console.log(availableSlots);
    }
    // fs.writeFileSync('available_dates.json', JSON.stringify(all_slots, null, 2));
    // console.log(all_slots)

    // let selectedTimeSlot = availableSlots[this.index];
    // console.log(`Selected Time - ${selectedTimeSlot?.timeNm}`);

    // this.completeReservationData.visitDe = pickedDate;
    // this.completeReservationData.timeCd = selectedTimeSlot.timeCd;
    // this.completeReservationData.resveTimeNm =
    //     selectedTimeSlot?.timeNm?.split(" ~ ")[0];
    // this.completeReservationData.visitResveId = selectedTimeSlot.visitResveId;


    // await delayForSeconds(0.1);
    // }
}

async function monitor() {
    while (true) {
        await fetch_available_dates()
        await delayForSeconds(0.1);
    }

}

monitor()