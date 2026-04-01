const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  AttachmentBuilder,
} = require('discord.js');
const {
  VELXO_ORANGE, VELXO_GREEN, VELXO_RED,
  SHOP_ICON, SHOP_URL, BOT_FOOTER,
} = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'constants.js')) ? 'constants' : '../constants'));
const { errorEmbed, buildTranscript } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'utils.js')) ? 'utils' : '../utils'));

// Handles: ticket_close, ticket_claim, ticket_adduser, ticket_confirm_close, ticket_cancel_close
module.exports = {
  customId: 'ticket_',

  async execute(interaction, client) {
    const id = interaction.customId;

    // ── Close button ──────────────────────────────────────────────────────────
    if (id.startsWith('ticket_close')) {
      const confirm = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_confirm_close').setLabel('Confirm Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('ticket_cancel_close').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
      );
      const embed = new EmbedBuilder()
        .setTitle('🔒  Close Ticket?')
        .setDescription('Are you sure you want to close this ticket? A transcript will be saved.')
        .setColor(VELXO_ORANGE)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      return interaction.reply({ embeds: [embed], components: [confirm], ephemeral: true });
    }

    // ── Confirm close ─────────────────────────────────────────────────────────
    if (id === 'ticket_confirm_close') {
      await interaction.deferUpdate();
      const channel = interaction.channel;
      const guild   = interaction.guild;

      const closing = new EmbedBuilder()
        .setTitle('🔒  Ticket Closing')
        .setDescription(`Closed by ${interaction.user}\nSaving transcript and deleting in **5 seconds**...`)
        .setColor(VELXO_RED)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await channel.send({ embeds: [closing] });

      // Transcript
      const transcriptCh = guild.channels.cache.get(process.env.TRANSCRIPT_CHANNEL_ID);
      if (transcriptCh) {
        const text = await buildTranscript(channel);
        const file = new AttachmentBuilder(Buffer.from(text, 'utf8'), { name: `transcript-${channel.name}.txt` });
        const tEmbed = new EmbedBuilder()
          .setTitle(`📄  Transcript — #${channel.name}`)
          .setDescription(`Closed by ${interaction.user}`)
          .setColor(VELXO_ORANGE).setTimestamp()
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
        await transcriptCh.send({ embeds: [tEmbed], files: [file] });
      }

      await new Promise(r => setTimeout(r, 5000));
      await channel.delete(`Ticket closed by ${interaction.user.tag}`).catch(() => {});
      return;
    }

    // ── Cancel close ──────────────────────────────────────────────────────────
    if (id === 'ticket_cancel_close') {
      return interaction.reply({ content: 'Cancelled.', ephemeral: true });
    }

    // ── Claim button ──────────────────────────────────────────────────────────
    if (id === 'ticket_claim') {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({ embeds: [errorEmbed('No Permission', 'Only staff can claim tickets.')], ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setDescription(`✋  Ticket claimed by ${interaction.user}`)
        .setColor(VELXO_GREEN)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await interaction.reply({ embeds: [embed] });

      // Disable claim button on original message
      const msg = interaction.message;
      const rows = msg.components.map(row => {
        const updated = row.components.map(btn => {
          if (btn.customId === 'ticket_claim') {
            return ButtonBuilder.from(btn).setDisabled(true).setLabel(`Claimed by ${interaction.user.displayName}`);
          }
          return ButtonBuilder.from(btn);
        });
        return new ActionRowBuilder().addComponents(updated);
      });
      await msg.edit({ components: rows }).catch(() => {});
      return;
    }

    // ── Add user button ───────────────────────────────────────────────────────
    if (id === 'ticket_adduser') {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({ embeds: [errorEmbed('No Permission')], ephemeral: true });
      }
      const modal = new ModalBuilder().setCustomId('ticket_adduser_modal').setTitle('➕  Add User to Ticket');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('user_id').setLabel('User ID')
            .setStyle(TextInputStyle.Short).setPlaceholder('Right-click a user → Copy ID').setRequired(true).setMaxLength(20)
        )
      );
      return interaction.showModal(modal);
    }
  },
};
