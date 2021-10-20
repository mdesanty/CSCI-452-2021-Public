const express = require("express");
const app = express();

app.get("/withoutPromises", withoutPromises);
app.get("/withPromises", withPromises);
app.listen(3000,  process.env.IP, startHandler());

function startHandler() {
  console.log("Server listening at " + process.env.IP + ":3000");
}

async function add(x, y, callback) {
  if(isNaN(x) || isNaN(y)) {
    callback(undefined, "Connot add non-number values.");
  }
  else {
    let result = parseInt(x) + parseInt(y);
    callback(result);
  }
}

function writeResult(res, result) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function withoutPromises(req, res) {
  let value = req.query.value;

  add(value, 2, function(result, err) {
    if(err) {
      writeResult(res, {error: err});
    }
    else {
      add(result, 3, function(result, err) {
        if(err) {
          writeResult(res, {error: err});
        }
        else {
          add(result, 5, function(result, err) {
            if(err) {
              writeResult(res, {error: err});
            }
            else {
              writeResult(res, {result: result});
            }
          });
        }
      });
    }
  });
}

function withPromises(req, res) {
  let value = req.query.value;

  makeAddPromise(value, 2)
    .then(result => makeAddPromise(result, 3))
    .then(result => makeAddPromise(result, 5))
    .then(result => writeResult(res, {result: result}))
    .catch(error => writeResult(res, {error: error}));
}

function makeAddPromise(value, addValue) {
  let promise = new Promise(function(resolve, reject) {
    add(value, addValue, function(result, err) {
      if(err) {
        reject(err);
      }
      else {
        resolve(result);
      }
    });
  });

  return promise;
}