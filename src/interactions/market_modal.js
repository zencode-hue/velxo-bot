const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, SHOP_ICON, SHOP_URL, BOT_FOOTER } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'constants.js')) ? 'constants' : '../constants'));

module.exports = {
  customId: 'market_modal',

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const subject      = interaction.fields.getTextInputValue('subject');
    const message      = interaction.fields.getTextInputValue('message');
    const dealLink     = interaction.fields.getTextInputValue('deal_link')     || SHOP_URL;
    const discountCode = interaction.fields.getTextInputValue('discount_code') || null;

    const guild   = interaction.guild;
    const members = (await guild.members.fetch()).filter(m => !m.user.bot);
    const total   = members.size;
    let sent = 0, failed = 0;

    const progressEmbed = () => new EmbedBuilder()
      .setTitle('📤  Campaign In Progress...')
      .setDescription(`Progress: **${sent + failed}/${total}**\n✅ Sent: **${sent}** | ❌ Failed: **${failed}**`)
      .setColor(VELXO_ORANGE)
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    const statusMsg = await interaction.editReply({ embeds: [progressEmbed()] });

    const dmEmbed = new EmbedBuilder()
      .setTitle(`🛍️  ${subject}`)
      .setDescription(message)
      .setColor(VELXO_ORANGE)
      .setThumbnail(SHOP_ICON)
      .setTimestamp()
      .setFooter({ text: `${BOT_FOOTER} | You received this as a server member`, iconURL: SHOP_ICON });

    if (discountCode) {
      dmEmbed.addFields({ name: '🎟️  Exclusive Discount Code', value: `\`\`\`${discountCode}\`\`\``, inline: false });
    }
    dmEmbed.addFields({
      name: '🔒  Why Shop at Velxo?',
      value: '> 🚀 Instant automated delivery\n> 🔐 AES-256 encrypted credentials\n> 🔄 Replacement guarantee on all products\n> 💳 Crypto & Discord payments accepted',
      inline: false,
    });

    const view = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Shop Now').setURL(dealLink).setStyle(ButtonStyle.Link).setEmoji('🛒'),
      new ButtonBuilder().setLabel('Browse Deals').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🔥'),
    );

    let i = 0;
    for (const [, member] of members) {
      try {
        await member.send({ embeds: [dmEmbed], components: [view] });
        sent++;
      } catch {
        failed++;
      }
      i++;
      await new Promise(r => setTimeout(r, 1000));
      if (i % 15 === 0) {
        await interaction.editReply({ embeds: [progressEmbed()] }).catch(() => {});
      }
    }

    const done = new EmbedBuilder()
      .setTitle('✅  Campaign Complete')
      .addFields(
        { name: '📨  Sent',   value: String(sent),   inline: true },
        { name: '❌  Failed', value: String(failed),  inline: true },
        { name: '👥  Total',  value: String(total),   inline: true },
      )
      .setColor(VELXO_GREEN).setTimestamp()
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
    await interaction.editReply({ embeds: [done] });

    const logCh = guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logCh) {
      const log = new EmbedBuilder()
        .setTitle('📣  Marketing Campaign')
        .addFields(
          { name: 'Staff',   value: interaction.user.toString(), inline: true },
          { name: 'Subject', value: subject,                     inline: true },
          { name: 'Sent',    value: String(sent),                inline: true },
          { name: 'Failed',  value: String(failed),              inline: true },
        )
        .setColor(VELXO_ORANGE).setTimestamp()
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await logCh.send({ embeds: [log] });
    }
  },
};
