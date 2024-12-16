const iproyal_proxy = {
  port: 12321,
  host: "geo.iproyal.com",
  protocol: "http",
  auth: {
    username: "ZBfOT4v4OJMgyrfk",
    password: "8veMWonizdN9eOss",
  },
};

const proxyUrl = `${iproyal_proxy.protocol}://${iproyal_proxy.auth.username}:${iproyal_proxy.auth.password}@${iproyal_proxy.host}:${iproyal_proxy.port}`;

export default proxyUrl;
