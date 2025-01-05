const iproyal_proxy = {
  port: 80,
  host: "p.webshare.io",
  protocol: "http",
  auth: {
    username: "hchmhmmd-KR-rotate",
    password: "fem4i9498yqh",
  },
};

const proxyUrl = `${iproyal_proxy.protocol}://${iproyal_proxy.auth.username}:${iproyal_proxy.auth.password}@${iproyal_proxy.host}:${iproyal_proxy.port}`;

export default proxyUrl;
