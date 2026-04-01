const { EmbedBuilder , MessageFlags } = require('discord.js');
const { VELXO_ORANGE, VELXO_GREEN, VELXO_RED, SHOP_ICON, BOT_FOOTER } = require('./constants');
const fs = require('fs');

const COUNTER_FILE = './ticket_counter.json';

function baseEmbed(title, description, color = VELXO_ORANGE) {
  return new EmbedBuilder()
    .setTitle(title ?? null)
    .setDescription(description ?? null)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
}

function successEmbed(title, description) {
  return baseEmbed(`✅  ${title}`, description, VELXO_GREEN);
}

function errorEmbed(title, description) {
  return baseEmbed(`❌  ${title}`, description, VELXO_RED);
}

function hasStaffRole(member) {
  const id = process.env.STAFF_ROLE_ID;
  if (!id) return true;
  return member.roles.cache.has(id);
}

function getTicketNumber() {
  let data = { count: 0 };
  if (fs.existsSync(COUNTER_FILE)) {
    data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
  }
  data.count += 1;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(data));
  return data.count;
}

function padTicket(num) {
  return String(num).padStart(4, '0');
}

async function buildTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();
  const lines = [
    '=== VELXO TICKET TRANSCRIPT ===',
    `Channel: #${channel.name}`,
    `Generated: ${new Date().toUTCString()}`,
    '='.repeat(40),
    '',
    ...sorted.map(m => {
      const ts = m.createdAt.toISOString().replace('T', ' ').slice(0, 16);
      return `[${ts}] ${m.author.tag}: ${m.content || '[embed/attachment]'}`;
    }),
  ];
  return lines.join('\n');
}

module.exports = { baseEmbed, successEmbed, errorEmbed, hasStaffRole, getTicketNumber, padTicket, buildTranscript };
