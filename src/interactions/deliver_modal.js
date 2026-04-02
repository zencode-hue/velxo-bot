const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, SHOP_ICON, SHOP_URL, BOT_FOOTER } = require('../constants');
const { errorEmbed } = require('../utils');

module.exports = {
  customId: 'deliver_modal:',

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const parts = interaction.customId.split(':');
    const memberId = parts[1];
    const category = parts.slice(2).join(':');

    const email       = interaction.fields.getTextInputValue('email');
    const password    = interaction.fields.getTextInputValue('password');
    const productName = interaction.fields.getTextInputValue('product_name');
    const notes       = interaction.fields.getTextInputValue('notes');

    const member = await interaction.guild.members.fetch(memberId).catch(() => null);
    if (!member) {
      return interaction.editReply({ embeds: [errorEmbed('Member Not Found')] });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉  Order Delivered — Velxo Shop')
      .setDescription(
        `Hey **${member.displayName}**, your order is ready.\n` +
        `Your credentials are below — keep them **private** and do not share them with anyone.`
      )
      .addFields(
        { name: '📦  Product',  value: `\`\`\`${productName}\`\`\``, inline: true },
        { name: '🏷️  Category', value: `\`\`\`${category}\`\`\``,    inline: true },
        { name: '\u200b',       value: '\u200b',                      inline: true },
        { name: '📧  Email',    value: `||${email}||`,                inline: true },
        { name: '🔑  Password', value: `||${password}||`,             inline: true },
        { name: '\u200b',       value: '\u200b',                      inline: true },
        {
          name: '⚠️  Important',
          value: '> • Credentials are for **your use only**\n> • Do **not** change the password unless told to\n> • Open a support ticket if anything is wrong\n> • Replacement guaranteed if product is invalid',
          inline: false,
        }
      )
      .setColor(VELXO_ORANGE)
      .setThumbnail(SHOP_ICON)
      .setTimestamp()
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    if (notes) embed.addFields({ name: '📝  Notes', value: notes, inline: false });

    const view = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Velxo Shop').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🛒'),
      new ButtonBuilder().setLabel('Open Support Ticket').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🎫')
    );

    try {
      await member.send({ embeds: [embed], components: [view] });
      await interaction.editReply({
        embeds: [new EmbedBuilder().setTitle('✅  Delivered').setDescription(`Product sent to **${member.displayName}** via DM.`).setColor(VELXO_GREEN).setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
      });
    } catch {
      return interaction.editReply({ embeds: [errorEmbed('DM Failed', `**${member.displayName}** has DMs disabled.`)] });
    }

    const logCh = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logCh) {
      const log = new EmbedBuilder()
        .setTitle('📦  Product Delivered')
        .addFields(
          { name: 'Staff',    value: interaction.user.toString(), inline: true },
          { name: 'Customer', value: member.toString(),           inline: true },
          { name: 'Product',  value: productName,                 inline: true },
          { name: 'Category', value: category,                    inline: true }
        )
        .setColor(VELXO_ORANGE)
        .setTimestamp()
        .setFooter({ text: `Customer ID: ${member.id}`, iconURL: SHOP_ICON });
      await logCh.send({ embeds: [log] });
    }
  },
};
