const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { VELXO_ORANGE, SHOP_ICON, SHOP_URL, SHOP_DEALS, SHOP_SUPPORT, BOT_FOOTER } = require('../constants');
const { errorEmbed, hasStaffRole } = require('../utils');

function buildPanelEmbed() {
  return new EmbedBuilder()
    .setTitle('🎫  Velxo Support Center')
    .setDescription(
      'Welcome to **Velxo Shop** support.\n' +
      'Select a category from the dropdown below to open a ticket.\n' +
      'Our team will assist you as soon as possible.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '🎫  **Support** — Issues, questions, problems\n' +
      '📦  **Claim Order** — Claim a purchased product\n' +
      '📋  **Application** — Join the Velxo staff team\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )
    .addFields(
      { name: '⏱️  Response Time', value: '> Our team typically responds within **15–30 minutes**.', inline: false },
      {
        name: '📌  Before Opening a Ticket',
        value: '> • Check our [FAQ at velxo.shop](https://velxo.shop/support)\n> • Have your Order ID ready if applicable\n> • One ticket per issue please',
        inline: false,
      }
    )
    .setThumbnail(SHOP_ICON)
    .setColor(VELXO_ORANGE)
    .setTimestamp()
    .setFooter({ text: `${BOT_FOOTER} | AES-256 Encrypted • Instant Delivery • Replacement Guarantee`, iconURL: SHOP_ICON });
}

function buildPanelComponents() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket_dropdown')
    .setPlaceholder('🎫  Open a ticket — select a category...')
    .addOptions([
      { label: 'Support',           emoji: '🎫', value: 'support',     description: 'Get help with an issue or question' },
      { label: 'Claim Order',       emoji: '📦', value: 'order',       description: 'Claim a product you\'ve purchased' },
      { label: 'Staff Application', emoji: '📋', value: 'application', description: 'Apply to join the Velxo team' },
    ]);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Velxo Shop').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🛒'),
    new ButtonBuilder().setLabel('Browse Deals').setURL(SHOP_DEALS).setStyle(ButtonStyle.Link).setEmoji('🔥'),
    new ButtonBuilder().setLabel('Support').setURL(SHOP_SUPPORT).setStyle(ButtonStyle.Link).setEmoji('🎫'),
  );

  return [new ActionRowBuilder().addComponents(select), buttons];
}

// Called from .panel prefix command
async function panelCommand(message, client) {
  if (!hasStaffRole(message.member)) {
    return message.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
  }
  await message.channel.send({ embeds: [buildPanelEmbed()], components: buildPanelComponents() });
  await message.delete().catch(() => {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Post the Velxo support ticket panel in this channel'),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
    }
    await interaction.channel.send({ embeds: [buildPanelEmbed()], components: buildPanelComponents() });
    await interaction.reply({ content: '✅ Panel posted.', flags: MessageFlags.Ephemeral });
  },

  panelCommand,
  buildPanelEmbed,
  buildPanelComponents,
};
