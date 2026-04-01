const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, SHOP_ICON, SHOP_URL, BOT_FOOTER } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'constants.js')) ? 'constants' : '../constants'));
const { errorEmbed } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'utils.js')) ? 'utils' : '../utils'));

module.exports = {
  customId: 'remind_modal:',

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const [, memberId, channelId] = interaction.customId.split(':');
    const customMessage = interaction.fields.getTextInputValue('custom_message');

    const member = await interaction.guild.members.fetch(memberId).catch(() => null);
    if (!member) return interaction.editReply({ embeds: [errorEmbed('Member Not Found')] });

    const ticketChannel = channelId !== 'none' ? interaction.guild.channels.cache.get(channelId) : null;

    const embed = new EmbedBuilder()
      .setTitle('🔔  Ticket Reminder — Action Required')
      .setDescription(
        `Hey **${member.displayName}**,\n\n` +
        `Our support team has responded to your ticket and is **waiting for your reply**.\n` +
        `Please check your ticket at your earliest convenience so we can resolve your issue.`
      )
      .setColor(VELXO_ORANGE)
      .setThumbnail(SHOP_ICON)
      .setTimestamp()
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    if (ticketChannel) {
      embed.addFields({ name: '📩  Your Ticket', value: `[Click here to view your ticket](${ticketChannel.url})`, inline: false });
    }
    if (customMessage) {
      embed.addFields({ name: '💬  Message from Staff', value: `> ${customMessage}`, inline: false });
    }
    embed.addFields({
      name: '💡  Quick Tips',
      value: '> • Reply in your ticket channel\n> • Use the close button when resolved\n> • Visit velxo.shop for self-service',
      inline: false,
    });

    const buttons = new ActionRowBuilder();
    if (ticketChannel) {
      buttons.addComponents(new ButtonBuilder().setLabel('Go to Ticket').setURL(ticketChannel.url).setStyle(ButtonStyle.Link).setEmoji('📩'));
    }
    buttons.addComponents(new ButtonBuilder().setLabel('Velxo Shop').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🛒'));

    try {
      await member.send({ embeds: [embed], components: [buttons] });
      await interaction.editReply({
        embeds: [new EmbedBuilder().setTitle('✅  Reminder Sent').setDescription(`Reminder delivered to **${member.displayName}**.`).setColor(VELXO_GREEN).setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
      });
    } catch {
      return interaction.editReply({ embeds: [errorEmbed('DM Failed', `**${member.displayName}** has DMs disabled.`)] });
    }

    const logCh = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logCh) {
      const log = new EmbedBuilder()
        .setTitle('🔔  Reminder Sent')
        .addFields(
          { name: 'Staff',    value: interaction.user.toString(), inline: true },
          { name: 'Customer', value: member.toString(),           inline: true },
          ...(ticketChannel ? [{ name: 'Ticket', value: ticketChannel.toString(), inline: true }] : [])
        )
        .setColor(VELXO_ORANGE).setTimestamp()
        .setFooter({ text: `Customer ID: ${member.id}`, iconURL: SHOP_ICON });
      await logCh.send({ embeds: [log] });
    }
  },
};
