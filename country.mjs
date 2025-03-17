// // new zealand
// const newZealand = {
//   country: "new zealand",
//   serviceCode: "AQ0046",
//   nationCd: "AQ",
// };

// // nepal
// const nepal = {
//   country: "nepal",
//   serviceCode: "NP0024",
//   nationCd: "NP",
// };

// // belgium
// const belgium = {
//   country: "belgium",
//   serviceCode: "BB0001",
//   nationCd: "BE",
// };

// // india
// const india = {
//   country: "india",
//   serviceCode: "ID0001",
//   nationCd: "ID",
// };

const srilanka = {
  emblCd: "SK",
  // businessNm: `{\"mainKindNm\":[],\"cffdnNm\":[]}`, true
  businessNm: `{"mainKindNm":[],"cffdnNm":[]}`,
  // businessNm: '',
  // businessNm: ``, false
  // businessNm: `{\"mainKindNm\":[\"Visa\"],\"cffdnNm\":[\"Visa\"]}`, true
  // businessNm: '{"mainKindNm":["Visa"],"cffdnNm":["Visa"]}', false
  grpNmListDB: "공증· 영사확인(Documents Authentication)",
  cffdnNmDB: "Documents Authentication",
  mainKind: "SK0025",
  subKind: "SK0025",
  totcnt: "1",
  onedaycnt: "1",
  visitrCttpcNatnCd: "NP",
};

// const srilanka = {
//   emblCd: "SK",
//   businessNm: `{\"mainKindNm\":[\"Visa\"],\"cffdnNm\":[\"Visa\"]}`,
//   grpNmListDB: "Visa",
//   // cffdnNmDB: '사증신청(Visa application)',
//   mainKind: "SK0025",
//   subKind: "SK0025",
//   totcnt: "1",
//   onedaycnt: "1",
//   visitrCttpcNatnCd: "NP",
// };

// // srilanka
// const srilanka = {
//   // country: "sri lanka",
//   mainKind: "SK0025",
//   emblCd: "SK",
// };

const nepalVisa = {
  // country: "sri lanka",
  mainKind: "NP0023",
  emblCd: "NP",
};

const nepalDoc = {
  emblCd: "NP",
  businessNm: `공증· 영사확인(Documents Authentication)`,
  grpNmListDB: "공증· 영사확인(Documents Authentication)",
  cffdnNmDB: "Documents Authentication",
  mainKind: "NP0024",
  subKind: "NP0024",
  totcnt: "1",
  onedaycnt: "1",
  visitrCttpcNatnCd: "NP",
  visitrCttpc: "9812349020",
};

const philipines = {
  emblCd: "CB",
  businessNm: `{"mainKindNm":["Visa(Travel Agency)"],"cffdnNm":["Visa(Travel Agency)"]}`,
  grpNmListDB: "공증· 영사확인(Documents Authentication)",
  // cffdnNmDB: '공증· 영사확인(Documents Authentication)',
  mainKind: "CB0068",
  subKind: "CB0068",
  totcnt: "1",
  onedaycnt: "1",
  visitrCttpcNatnCd: "NP",
};

// const nepalVisa = {
//   emblCd: 'NP',
//   businessNm: `{"mainKindNm":["유학사증(Study VISA)"],"cffdnNm":["유학사증(Study VISA)"]}`,
//   grpNmListDB: '유학사증(Study VISA)',
//   cffdnNmDB: '유학사증(Study VISA)',
//   mainKind: 'NP0025',
//   subKind: 'NP0025',
//   totcnt: '1',
//   onedaycnt: '1',
//   // visitrCttpcNatnCd: "NP",
// }

const nzVisa = {
  emblCd: "AQ",
  businessNm: `{"mainKindNm":["VISA APPLICATION"],"cffdnNm":["사증신청(Visa application)"]}`,
  grpNmListDB: "VISA APPLICATION",
  // cffdnNmDB: '사증신청(Visa application)',
  mainKind: "AQ0046",
  subKind: "AQ0047",
  totcnt: "5",
  onedaycnt: "2",
  visitrCttpcNatnCd: "AQ",
};

const belg = {
  emblCd: "BB",
  businessNm: `{"mainKindNm":["여권/Paspoort/Passeport"],"cffdnNm":["여권/Paspoort/Passeport"]}`,
  grpNmListDB: "여권/Paspoort/Passeport",
  // cffdnNmDB: "여권/Paspoort/Passeport",
  mainKind: "BB0001",
  subKind: "BB0001",
  totcnt: "1",
  onedaycnt: "1",
  visitrCttpcNatnCd: "NP",
};

const nepalFamily = {
  emblCd: "NP",
  businessNm: `{"mainKindNm":["가족관계"],"cffdnNm":["가족관계"]}`,
  grpNmListDB: "가족관계",
  cffdnNmDB: "가족관계",
  mainKind: "NP0014",
  subKind: "NP0014",
  totcnt: "1",
  onedaycnt: "1",
  // visitrCttpcNatnCd: "NP",
};

export const country = nzVisa;
