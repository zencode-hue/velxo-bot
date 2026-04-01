const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, SHOP_ICON, SHOP_URL, BOT_FOOTER } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'constants.js')) ? 'constants' : '../constants'));

module.exports = {
  customId: 'announce_modal:',

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const channelId   = interaction.customId.split(':')[1];
    const channel     = interaction.guild.channels.cache.get(channelId);
    const title       = interaction.fields.getTextInputValue('title');
    const message     = interaction.fields.getTextInputValue('message');
    const imageUrl    = interaction.fields.getTextInputValue('image_url')    || null;
    const pingRaw     = interaction.fields.getTextInputValue('ping_everyone').trim().toLowerCase();
    const ping        = pingRaw === 'yes';

    if (!channel) {
      return interaction.editReply({ content: '❌ Channel not found.' });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor(VELXO_ORANGE)
      .addFields({
        name: '\u200b',
        value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🚀  Instant Delivery  •  🔐  AES-256 Encrypted  •  🔄  Replacement Guarantee',
        inline: false,
      })
      .setThumbnail(SHOP_ICON)
      .setTimestamp()
      .setFooter({ text: `${BOT_FOOTER} | Announced by ${interaction.user.displayName}`, iconURL: SHOP_ICON });

    if (imageUrl) embed.setImage(imageUrl);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Shop Now').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🛒'),
      new ButtonBuilder().setLabel('Browse Deals').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🔥'),
      new ButtonBuilder().setLabel('Support').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🎫'),
    );

    await channel.send({ content: ping ? '@everyone' : null, embeds: [embed], components: [buttons] });

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('✅  Announcement Sent')
        .setDescription(`Posted in ${channel}`)
        .setColor(VELXO_GREEN)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
    });

    const logCh = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logCh) {
      const log = new EmbedBuilder()
        .setTitle('📢  Announcement Posted')
        .addFields(
          { name: 'Staff',      value: interaction.user.toString(), inline: true },
          { name: 'Channel',    value: channel.toString(),          inline: true },
          { name: '@everyone',  value: ping ? 'Yes' : 'No',         inline: true },
          { name: 'Title',      value: title,                       inline: false },
        )
        .setColor(VELXO_ORANGE).setTimestamp()
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await logCh.send({ embeds: [log] });
    }
  },
};
