const iproyal_proxy = {
  port: 12321,
  host: "geo.iproyal.com",
  protocol: "http",
  auth: {
    username: "6E6CWZnOqRXnw9Zt",
    password: "Iproyal25_country-kr",
  },
};

// const iproyal_proxy = {
//   port: 80,
//   host: "p.webshare.io",
//   protocol: "http",
//   auth: {
//     username: "hchmhmmd-rotate",
//     password: "fem4i9498yqh",
//   },
// };

const proxyUrl = `${iproyal_proxy.protocol}://${iproyal_proxy.auth.username}:${iproyal_proxy.auth.password}@${iproyal_proxy.host}:${iproyal_proxy.port}`;

export default proxyUrl;
