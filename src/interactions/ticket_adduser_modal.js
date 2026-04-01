const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { VELXO_GREEN, VELXO_RED, SHOP_ICON, BOT_FOOTER } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'constants.js')) ? 'constants' : '../constants'));
const { errorEmbed } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'utils.js')) ? 'utils' : '../utils'));

module.exports = {
  customId: 'ticket_adduser_modal',

  async execute(interaction) {
    const userId = interaction.fields.getTextInputValue('user_id').trim();
    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return interaction.reply({ embeds: [errorEmbed('User Not Found', 'Could not find that user in this server.')], ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(member, {
      ViewChannel: true,
      SendMessages: true,
      AttachFiles: true,
    });

    const embed = new EmbedBuilder()
      .setDescription(`➕  ${member} has been added to this ticket.`)
      .setColor(VELXO_GREEN)
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    await interaction.reply({ embeds: [embed] });
  },
};
