const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, VELXO_RED, SHOP_ICON, BOT_FOOTER } = require('../constants');
const { errorEmbed, hasStaffRole } = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket management commands')
    .addSubcommand(s => s.setName('add').setDescription('Add a user to this ticket').addUserOption(o => o.setName('member').setDescription('Member to add').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a user from this ticket').addUserOption(o => o.setName('member').setDescription('Member to remove').setRequired(true)))
    .addSubcommand(s => s.setName('rename').setDescription('Rename this ticket channel').addStringOption(o => o.setName('name').setDescription('New channel name').setRequired(true)))
    .addSubcommand(s => s.setName('close').setDescription('Force close this ticket channel')),

  async execute(interaction, client) {
    if (!hasStaffRole(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const member = interaction.options.getMember('member');
      await interaction.channel.permissionOverwrites.edit(member, { ViewChannel: true, SendMessages: true });
      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription(`➕  ${member} added to this ticket.`).setColor(VELXO_GREEN).setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
      });
    }

    if (sub === 'remove') {
      const member = interaction.options.getMember('member');
      await interaction.channel.permissionOverwrites.delete(member);
      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription(`➖  ${member} removed from this ticket.`).setColor(VELXO_RED).setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
      });
    }

    if (sub === 'rename') {
      const name = interaction.options.getString('name');
      await interaction.channel.setName(name);
      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription(`✏️  Ticket renamed to **${name}**.`).setColor(VELXO_ORANGE).setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
      });
    }

    if (sub === 'close') {
      const embed = new EmbedBuilder()
        .setTitle('🔒  Ticket Force Closed')
        .setDescription(`Force closed by ${interaction.user}. Deleting in 5 seconds...`)
        .setColor(VELXO_RED)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await interaction.reply({ embeds: [embed] });
      await new Promise(r => setTimeout(r, 5000));
      await interaction.channel.delete(`Force closed by ${interaction.user.tag}`).catch(() => {});
    }
  },
};
