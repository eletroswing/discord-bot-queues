const { randomUUID } = require("crypto");
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const Queue = require("bull");

require("dotenv").config();

var masterQueue = {};

const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

const processQueue = new Queue("process", process.env.REDIS);

processQueue.process(1, async (job, done) => {
  Object.keys(masterQueue).forEach((key) => {
    io.emit("queue-update", {
      messageId: masterQueue[key].messageId,
      guildId: masterQueue[key].guildId,
      channelId: masterQueue[key].channelId,
      queue: masterQueue[key].queue - 1 || 1,
    });

    masterQueue[key].queue = masterQueue[key].queue - 1;
  });
  ///////////////////////

  //do your heavy work here
  var responseToDiscord = "Simple Response";
  //to get input prompt, use job.data.prompt
  await new Promise((resolve) => setTimeout(resolve, 6000));

  //////////////////////
  delete masterQueue[job.data.id];

  io.emit("queue-response", {
    prompt: job.data.prompt,
    messageId: job.data.messageId,
    guildId: job.data.guildId,
    channelId: job.data.channelId,
    response: responseToDiscord,
  });

  done(undefined, job.data);
});

//join ========================
io.on("connection", (socket) => {
  socket.on("join", (data, callback) => {
    let id = randomUUID();

    let context = {
      prompt: data.prompt,
      messageId: data.messageId,
      channelId: data.channelId,
      guildId: data.guildId,
      id: id,
      queue: Object.keys(masterQueue).length + 1,
    };

    masterQueue[id] = context;
    processQueue.add(context);
    callback({
      queue: Object.keys(masterQueue).length,
    });
  });
});

server.listen(process.env.PORT || port, () => {
  console.log(`Socket worker is running on port: ${port}`);
});
