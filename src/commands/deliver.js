const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, SHOP_ICON, SHOP_URL, BOT_FOOTER } = require('../constants');
const { errorEmbed, hasStaffRole } = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deliver')
    .setDescription('Deliver a product to a customer via DM')
    .addUserOption(o => o.setName('member').setDescription('The customer to deliver to').setRequired(true)),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
    }

    const member = interaction.options.getMember('member');

    const select = new StringSelectMenuBuilder()
      .setCustomId(`deliver_category:${member.id}`)
      .setPlaceholder('Select product category...')
      .addOptions([
        { label: 'Streaming',  emoji: '🎬', value: 'Streaming',  description: 'Netflix, Disney+, Spotify...' },
        { label: 'AI Tools',   emoji: '🤖', value: 'AI Tools',   description: 'ChatGPT Plus, Midjourney...' },
        { label: 'Gaming',     emoji: '🎮', value: 'Gaming',     description: 'Game passes, accounts...' },
        { label: 'Software',   emoji: '💻', value: 'Software',   description: 'Licenses, subscriptions...' },
        { label: 'Other',      emoji: '📦', value: 'Other',      description: 'Miscellaneous products' },
      ]);

    const embed = new EmbedBuilder()
      .setTitle('📦  Select Product Category')
      .setDescription(`Delivering to **${member.displayName}**\nChoose the product category below.`)
      .setColor(VELXO_ORANGE)
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    await interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(select)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
