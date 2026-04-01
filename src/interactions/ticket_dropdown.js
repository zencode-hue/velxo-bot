const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'ticket_dropdown',

  async execute(interaction) {
    const type = interaction.values[0];

    if (type === 'support') {
      const modal = new ModalBuilder().setCustomId('ticket_modal:support').setTitle('🎫  Support Request');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('issue').setLabel('Describe your issue')
            .setStyle(TextInputStyle.Paragraph).setPlaceholder('Please describe your issue in detail...').setRequired(true).setMaxLength(500)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('order_id').setLabel('Order ID (if applicable)')
            .setStyle(TextInputStyle.Short).setPlaceholder('Your order ID from velxo.shop').setRequired(false).setMaxLength(50)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('product').setLabel('Product Name')
            .setStyle(TextInputStyle.Short).setPlaceholder('e.g. Netflix Premium, ChatGPT Plus').setRequired(false).setMaxLength(100)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('priority').setLabel('Priority (low / medium / high)')
            .setStyle(TextInputStyle.Short).setPlaceholder('low, medium, or high').setRequired(true).setMaxLength(6).setValue('medium')
        )
      );
      return interaction.showModal(modal);
    }

    if (type === 'order') {
      const modal = new ModalBuilder().setCustomId('ticket_modal:order').setTitle('📦  Claim Your Order');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('order_id').setLabel('Order ID')
            .setStyle(TextInputStyle.Short).setPlaceholder('Your order ID from velxo.shop').setRequired(true).setMaxLength(100)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('email').setLabel('Email Used at Checkout')
            .setStyle(TextInputStyle.Short).setPlaceholder('customer@example.com').setRequired(true).setMaxLength(100)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('product').setLabel('Product Name')
            .setStyle(TextInputStyle.Short).setPlaceholder('e.g. Spotify Premium, Midjourney').setRequired(true).setMaxLength(100)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('payment_method').setLabel('Payment Method')
            .setStyle(TextInputStyle.Short).setPlaceholder('e.g. Crypto, Discord payment').setRequired(false).setMaxLength(50)
        )
      );
      return interaction.showModal(modal);
    }

    if (type === 'application') {
      const modal = new ModalBuilder().setCustomId('ticket_modal:application').setTitle('📋  Staff Application');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('role').setLabel('Role Applying For')
            .setStyle(TextInputStyle.Short).setPlaceholder('e.g. Support Agent, Moderator, Developer').setRequired(true).setMaxLength(100)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('age').setLabel('Your Age')
            .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('experience').setLabel('Relevant Experience')
            .setStyle(TextInputStyle.Paragraph).setPlaceholder('Previous roles, skills, experience...').setRequired(true).setMaxLength(500)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('reason').setLabel('Why do you want to join Velxo?')
            .setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500)
        )
      );
      return interaction.showModal(modal);
    }
  },
};
