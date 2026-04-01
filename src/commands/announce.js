const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { errorEmbed, hasStaffRole } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'utils.js')) ? 'utils' : '../utils'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post a branded announcement embed to a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to post in').setRequired(true)),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
    }

    const channel = interaction.options.getChannel('channel');

    const modal = new ModalBuilder()
      .setCustomId(`announce_modal:${channel.id}`)
      .setTitle('📢  Create Announcement');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('title').setLabel('Announcement Title')
          .setStyle(TextInputStyle.Short).setPlaceholder('e.g. 🔥 New Products Now Available!').setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('message').setLabel('Message')
          .setStyle(TextInputStyle.Paragraph).setPlaceholder('Write your announcement here...').setRequired(true).setMaxLength(2000)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('image_url').setLabel('Image URL (optional)')
          .setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false).setMaxLength(300)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('ping_everyone').setLabel('Ping @everyone? (yes / no)')
          .setStyle(TextInputStyle.Short).setPlaceholder('yes or no').setRequired(true).setMaxLength(3).setValue('no')
      )
    );

    await interaction.showModal(modal);
  },
};
