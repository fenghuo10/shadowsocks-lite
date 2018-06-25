const { spawn } = require("child_process");
const defaultScore = 100000;

const ipsScore = {};
let selected;

const updateRes = function() {
  for (let ip in ipsScore) {
    if (ipsScore[ip] < (ipsScore[selected] || Number.MAX_SAFE_INTEGER)) {
      selected = ip;
    }
  }
};

const refreshScore = function() {
  for (let ip in ipsScore) {
    ipsScore[ip] = defaultScore;
  }
};

const getPing = function(ips) {
  for (let ip of ips) {
    const ping = spawn("ping", [ip, "-i", 2]);

    ping.stdout.on("data", data => {
      data = data.toString();
      time = data.split(" ")[6].split("=")[1];

      ipsScore[ip] = parseInt(
        (ipsScore[ip] || defaultScore) * 0.8 + time * 0.2
      );
    });
    ping.stderr.on("data", data => {
      console.log(`ping stderr: ${data}`);
    });

    ping.on("close", code => {
      if (code !== 0) {
        console.log(`ping process exited with code ${code}`);
      }
    });
  }

  setInterval(updateRes, 5000);
  setInterval(refreshScore, 30000);
};

const bestIp = () => selected;

exports.bestIp = bestIp;
exports.getPing = getPing;
