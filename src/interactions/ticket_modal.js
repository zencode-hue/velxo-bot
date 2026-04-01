const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionsBitField, ChannelType, MessageFlags,
} = require('discord.js');
const {
  VELXO_ORANGE, VELXO_GREEN,
  SHOP_ICON, SHOP_URL, BOT_FOOTER,
  PRIORITY_COLORS, PRIORITY_EMOJI, TICKET_META,
} = require('../constants');
const { errorEmbed, getTicketNumber, padTicket } = require('../utils');

module.exports = {
  customId: 'ticket_modal:',

  async execute(interaction, client) {
    const type  = interaction.customId.split(':')[1];
    const guild = interaction.guild;
    const user  = interaction.member;

    // Duplicate check
    const existing = guild.channels.cache.find(
      c => c.topic && c.topic.includes(user.id) && c.name.includes(type)
    );
    if (existing) {
      return interaction.reply({
        embeds: [errorEmbed('Ticket Already Open', `You already have an open ticket: ${existing}`)],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // Build fields
      const fields = {};
      if (type === 'support') {
        fields['Issue']    = interaction.fields.getTextInputValue('issue');
        fields['Order ID'] = interaction.fields.getTextInputValue('order_id') || 'N/A';
        fields['Product']  = interaction.fields.getTextInputValue('product')  || 'N/A';
      } else if (type === 'order') {
        fields['Order ID']       = interaction.fields.getTextInputValue('order_id');
        fields['Email']          = interaction.fields.getTextInputValue('email');
        fields['Product']        = interaction.fields.getTextInputValue('product');
        fields['Payment Method'] = interaction.fields.getTextInputValue('payment_method') || 'N/A';
      } else if (type === 'application') {
        fields['Role']       = interaction.fields.getTextInputValue('role');
        fields['Age']        = interaction.fields.getTextInputValue('age');
        fields['Experience'] = interaction.fields.getTextInputValue('experience');
        fields['Reason']     = interaction.fields.getTextInputValue('reason');
      }

      const rawPriority = type === 'support'
        ? (interaction.fields.getTextInputValue('priority') || 'medium').toLowerCase().trim()
        : 'medium';
      const priority  = ['low', 'medium', 'high'].includes(rawPriority) ? rawPriority : 'medium';
      const ticketNum = getTicketNumber();
      const meta      = TICKET_META[type];
      const color     = PRIORITY_COLORS[priority];

      // Permission overwrites
      const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE_ID);
      const perms = [
        { id: guild.id,       deny:  [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id,        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks] },
        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages] },
      ];
      if (staffRole) {
        perms.push({ id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages] });
      }

      // Use configured category ID, fallback to finding/creating one
      let category = guild.channels.cache.get(process.env.TICKET_CATEGORY_ID)
        || guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.includes('Velxo Tickets'));
      if (!category) {
        category = await guild.channels.create({ name: '📩 Velxo Tickets', type: ChannelType.GuildCategory });
      }

      const channel = await guild.channels.create({
        name: `${type}-${padTicket(ticketNum)}`,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `Ticket #${padTicket(ticketNum)} | ${meta.label} | ${user.user.tag} (${user.id}) | Priority: ${priority.toUpperCase()}`,
        permissionOverwrites: perms,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${meta.emoji}  ${meta.label} — Ticket #${padTicket(ticketNum)}`)
        .setDescription(
          `**Opened by:** ${user}\n` +
          `**Priority:** ${PRIORITY_EMOJI[priority]} ${priority.charAt(0).toUpperCase() + priority.slice(1)}\n` +
          `**Opened at:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `Our staff will be with you shortly. Please be patient.`
        )
        .setColor(color)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `${BOT_FOOTER} | Ticket #${padTicket(ticketNum)}`, iconURL: SHOP_ICON });

      for (const [k, v] of Object.entries(fields)) {
        embed.addFields({ name: k, value: v.length < 100 ? `\`\`\`${v}\`\`\`` : v, inline: false });
      }

      const controls = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ticket_close:${user.id}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('✋'),
        new ButtonBuilder().setCustomId('ticket_adduser').setLabel('Add User').setStyle(ButtonStyle.Primary).setEmoji('➕'),
      );
      const links = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Velxo Shop').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🛒'),
        new ButtonBuilder().setLabel('Browse Deals').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🔥'),
      );

      const mention = staffRole ? `${user} ${staffRole}` : `${user}`;
      await channel.send({ content: mention, embeds: [embed], components: [controls, links] });

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅  Ticket Created')
          .setDescription(`Your ticket has been opened: ${channel}\nA staff member will assist you shortly.`)
          .setColor(VELXO_GREEN)
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })],
      });

      const logCh = guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (logCh) {
        const log = new EmbedBuilder()
          .setTitle(`🎫  New Ticket #${padTicket(ticketNum)}`)
          .addFields(
            { name: 'User',     value: user.toString(),                           inline: true },
            { name: 'Type',     value: meta.label,                                inline: true },
            { name: 'Priority', value: `${PRIORITY_EMOJI[priority]} ${priority}`, inline: true },
            { name: 'Channel',  value: channel.toString(),                        inline: true },
          )
          .setColor(color).setTimestamp()
          .setFooter({ text: `User ID: ${user.id}`, iconURL: SHOP_ICON });
        await logCh.send({ embeds: [log] });
      }

    } catch (err) {
      console.error('[Velxo] Ticket creation error:', err);
      await interaction.editReply({
        embeds: [errorEmbed('Failed to Create Ticket', 'An error occurred. Please try again or contact an admin.')],
      });
    }
  },
};
