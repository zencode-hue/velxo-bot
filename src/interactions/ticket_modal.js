const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionsBitField, ChannelType,
} = require('discord.js');
const {
  VELXO_ORANGE, VELXO_GREEN, VELXO_RED,
  SHOP_ICON, SHOP_URL, BOT_FOOTER,
  PRIORITY_COLORS, PRIORITY_EMOJI, TICKET_META,
} = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'constants.js')) ? 'constants' : '../constants'));
const { errorEmbed, getTicketNumber, padTicket } = require(require('path').join(__dirname, require('fs').existsSync(require('path').join(__dirname,'utils.js')) ? 'utils' : '../utils'));

module.exports = {
  customId: 'ticket_modal:',

  async execute(interaction, client) {
    const type = interaction.customId.split(':')[1];
    const guild = interaction.guild;
    const user  = interaction.member;

    // Duplicate check
    const existing = guild.channels.cache.find(
      c => c.name.includes(`${type}-`) && c.topic?.includes(user.id)
    );
    if (existing) {
      return interaction.reply({
        embeds: [errorEmbed('Ticket Already Open', `You already have an open ticket: ${existing}`)],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Build fields from modal
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
    const priority = ['low', 'medium', 'high'].includes(rawPriority) ? rawPriority : 'medium';

    const ticketNum = getTicketNumber();
    const meta      = TICKET_META[type];
    const color     = PRIORITY_COLORS[priority];

    // Permissions
    const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE_ID);
    const perms = [
      { id: guild.id,   allow: [], deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: user.id,    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks] },
      { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages] },
    ];
    if (staffRole) {
      perms.push({ id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages] });
    }

    // Category
    let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === '📩  Velxo Tickets');
    if (!category) {
      category = await guild.channels.create({ name: '📩  Velxo Tickets', type: ChannelType.GuildCategory });
    }

    const channel = await guild.channels.create({
      name: `${meta.emoji}${type}-${padTicket(ticketNum)}`,
      type: ChannelType.GuildText,
      parent: category.id,
      topic: `Ticket #${padTicket(ticketNum)} | ${meta.label} | ${user.user.tag} (${user.id}) | Priority: ${priority.toUpperCase()}`,
      permissionOverwrites: perms,
    });

    // Ticket embed
    const embed = new EmbedBuilder()
      .setTitle(`${meta.emoji}  ${meta.label} — Ticket #${padTicket(ticketNum)}`)
      .setDescription(
        `**Opened by:** ${user}\n` +
        `**Priority:** ${PRIORITY_EMOJI[priority]} ${priority.charAt(0).toUpperCase() + priority.slice(1)}\n` +
        `**Opened at:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
        `Our staff will be with you shortly. Please be patient.`
      )
      .setColor(color)
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `${BOT_FOOTER} | Ticket #${padTicket(ticketNum)}`, iconURL: SHOP_ICON });

    for (const [k, v] of Object.entries(fields)) {
      embed.addFields({ name: k, value: v.length < 100 ? `\`\`\`${v}\`\`\`` : v, inline: false });
    }

    // Control buttons
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
          { name: 'User',     value: user.toString(),                                    inline: true },
          { name: 'Type',     value: meta.label,                                         inline: true },
          { name: 'Priority', value: `${PRIORITY_EMOJI[priority]} ${priority}`,          inline: true },
          { name: 'Channel',  value: channel.toString(),                                 inline: true },
        )
        .setColor(color).setTimestamp()
        .setFooter({ text: `User ID: ${user.id}`, iconURL: SHOP_ICON });
      await logCh.send({ embeds: [log] });
    }
  },
};
