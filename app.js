const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(8080);

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html")
});

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const proofContract = web3.eth.contract([{
  "constant": false,
  "inputs": [{"name": "fileHash", "type": "string"}],
  "name": "get",
  "outputs": [{"name": "timestamp", "type": "uint256"}, {"name": "owner", "type": "string"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "owner", "type": "string"}, {"name": "fileHash", "type": "string"}],
  "name": "set",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "name": "status", "type": "bool"}, {
    "indexed": false,
    "name": "timestamp",
    "type": "uint256"
  }, {
    "indexed": false, "name": "owner", "type": "string"
  }, {
    "indexed": false, "name": "fileHash", "type": "string"
  }],
  "name": "logFileAddedStatus",
  "type": "event"
}]);
const proof = proofContract.at("0x2c74385ba35f85d769419720c27be3a11f95e89a");

app.get("/submit", (req, res) => {
  const fileHash = req.query.hash;
  const owner = req.query.owner;

  proof.set.sendTransaction(owner, fileHash, {
    from: web3.eth.accounts[0],
  }, (error, transactionHash) => {
    if (!error) {
      res.send(transactionHash);
    }
    else {
      res.send("Error");
    }
  })
});

app.get("/getInfo", (req, res) => {
  const fileHash = req.query.hash;
  const details = proof.get.call(fileHash);

  res.send(details);
});

proof.logFileAddedStatus().watch((error, result) => {
  if (!error) {
    if (result.args.status == true) {
      io.send(result);
    }
  }
});

module.exports = app;
