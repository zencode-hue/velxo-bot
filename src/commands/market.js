const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { errorEmbed, hasStaffRole } = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('Launch a mass marketing DM campaign to all members'),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
    }

    const modal = new ModalBuilder()
      .setCustomId('market_modal')
      .setTitle('📣  Mass Marketing Campaign');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('subject').setLabel('Campaign Title')
          .setStyle(TextInputStyle.Short).setPlaceholder('e.g. 🔥 Flash Sale — 20% Off Everything!').setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('message').setLabel('Campaign Message')
          .setStyle(TextInputStyle.Paragraph).setPlaceholder('Write your marketing message here...').setRequired(true).setMaxLength(1000)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('deal_link').setLabel('Product / Deal Link (optional)')
          .setStyle(TextInputStyle.Short).setPlaceholder('https://velxo.shop/...').setRequired(false).setMaxLength(200)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('discount_code').setLabel('Discount Code (optional)')
          .setStyle(TextInputStyle.Short).setPlaceholder('e.g. VELXO20').setRequired(false).setMaxLength(50)
      )
    );

    await interaction.showModal(modal);
  },
};
