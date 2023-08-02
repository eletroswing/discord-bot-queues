const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { io } = require('socket.io-client');

const dotenv = require('dotenv')
dotenv.config()

const embedPlaceholder = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Wait...")

module.exports = {
  //edit here to principal command
  data: new SlashCommandBuilder()
    .setName("async-builder")
    .setDescription("Wait for a long command response")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Type the sentence.")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let prompt = interaction.options.get("prompt");

    let response = await interaction.reply({embeds: [embedPlaceholder]});
    let interactionReply = await interaction.fetchReply()

    const socket = new io(process.env.SOCKET_SERVER);

    var QueuePosition;
    socket.emit('join', {
        prompt: prompt.value,
        messageId: interactionReply.id,
        channelId: response.interaction.channelId,
        guildId: response.interaction.guildId,
    },async (res) => {
      const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("Orchestrator")
      .addFields(
        //{ name: "\u200B", value: "\u200B" },
        {
          name: `Wait...`,
          value: `You are on ${res.queue}!`,
          inline: true,
        },
      );    
    
    await interaction.editReply({embeds: [embed]})
    })
  },
};