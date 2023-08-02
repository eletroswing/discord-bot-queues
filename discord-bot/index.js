const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const { io } = require("socket.io-client");
const fs = require("node:fs");
const path = require("node:path");

// dotenv
const dotenv = require("dotenv");
dotenv.config();
const { TOKEN, SOCKET_SERVER } = process.env;

// import commands
const deploy = require("./deploy-commands");
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

//socket the api

const socket = new io(SOCKET_SERVER);

socket.on("queue-update", async (data) => {
  let message = await client.guilds
    .resolve(data.guildId)
    .channels.resolve(data.channelId)
    .messages.fetch(data.messageId);
  const embed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle("Response: QUEUE")
    .addFields(
      //{ name: "\u200B", value: "\u200B" },
      {
        name: `You are in the ${data.queue} position in queue.`,
        value: `You need to wait!`,
        inline: true,
      }
    );

  await message.edit({ embeds: [embed] });
});

socket.on("queue-response", async (data) => {
  let message = await client.guilds
    .resolve(data.guildId)
    .channels.resolve(data.channelId)
    .messages.fetch(data.messageId);

   const embed = new EmbedBuilder()
     .setColor("Orange")
     .setTitle("Your result: ")
     .addFields({ name: "response", value: data.response })

   await message.edit({ embeds: [embed] });
});

//=================

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `The command in path is broken(missing "data" pr "execute"): ${filePath};`
    );
  }
}

//================================
// Login in bot
client.once(Events.ClientReady, async (c) => {
  await deploy();
  console.log(`Bot logged in as: ${c.user.tag}`);
});
client.login(TOKEN);

// Listener
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error("Command not found.");
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply("Failed to execute this command");
  }
});
