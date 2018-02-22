const os = require('os');

// http://stackoverflow.com/questions/10750303/how-can-i-get-the-local-ip-address-in-node-js
// like 192.168.120.206
let getLocal = () => {

  let interfaces = os.networkInterfaces();
  let addresses = [];
  for (let k in interfaces) {
    for (let k2 in interfaces[k]) {
      let address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  if (addresses.length) {
    return addresses[0];
  }

  throw new Error('Could not get local ip!');
};


module.exports.getLocal = getLocal;
