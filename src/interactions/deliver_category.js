const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder , MessageFlags } = require('discord.js');

module.exports = {
  customId: 'deliver_category:',

  async execute(interaction) {
    const [, memberId] = interaction.customId.split(':');
    const category = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`deliver_modal:${memberId}:${category}`)
      .setTitle('📦  Deliver Product to Customer');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('email').setLabel('Account Email')
          .setStyle(TextInputStyle.Short).setPlaceholder('customer@example.com').setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('password').setLabel('Account Password')
          .setStyle(TextInputStyle.Short).setPlaceholder('Enter the account password').setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('product_name').setLabel('Product Name')
          .setStyle(TextInputStyle.Short).setPlaceholder('e.g. Netflix Premium 4K').setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('notes').setLabel('Notes for Customer')
          .setStyle(TextInputStyle.Paragraph).setPlaceholder('Profile info, expiry date, special instructions...').setRequired(false).setMaxLength(400)
      )
    );

    await interaction.showModal(modal);
  },
};
