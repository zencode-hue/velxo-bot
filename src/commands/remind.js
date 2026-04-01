const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { errorEmbed, hasStaffRole } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'utils.js')) ? 'utils' : '../utils'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Send a ticket reminder to a customer')
    .addUserOption(o => o.setName('member').setDescription('The customer to remind').setRequired(true))
    .addChannelOption(o => o.setName('ticket_channel').setDescription('The ticket channel to link').setRequired(false)),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
    }

    const member = interaction.options.getMember('member');
    const ticketChannel = interaction.options.getChannel('ticket_channel');
    const channelId = ticketChannel ? ticketChannel.id : 'none';

    const modal = new ModalBuilder()
      .setCustomId(`remind_modal:${member.id}:${channelId}`)
      .setTitle('🔔  Send Ticket Reminder');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('custom_message')
          .setLabel('Custom Message (optional)')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Add a personal note to the reminder...')
          .setRequired(false)
          .setMaxLength(300)
      )
    );

    await interaction.showModal(modal);
  },
};
