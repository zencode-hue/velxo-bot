require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.interactions = new Collection();

// Resolve base dir — works whether files are in src/ or flat root
const baseDir = __dirname;

// Helper to safely load from a subfolder, falling back to flat files with prefix
function loadDir(subdir, callback) {
  const full = path.join(baseDir, subdir);
  if (fs.existsSync(full)) {
    for (const file of fs.readdirSync(full).filter(f => f.endsWith('.js'))) {
      callback(require(path.join(full, file)));
    }
  } else {
    // Flat layout: files named like "commands/announce.js" don't exist,
    // but Wispbyte may have extracted them as e.g. "commandsannounce.js" — 
    // so we scan all .js files and match by known names
    const prefix = subdir === 'commands'
      ? ['announce','deliver','market','panel','remind','ticket']
      : ['announce_modal','deliver_category','deliver_modal','market_modal',
         'remind_modal','ticket_adduser_modal','ticket_buttons','ticket_dropdown','ticket_modal'];
    for (const name of prefix) {
      const f = path.join(baseDir, `${name}.js`);
      if (fs.existsSync(f)) callback(require(f));
    }
  }
}

loadDir('commands', cmd => {
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
});

loadDir('interactions', handler => {
  if (handler.customId && handler.execute) client.interactions.set(handler.customId, handler);
});

client.once('clientReady', () => {
  console.log(`[Velxo] Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'velxo.shop | Premium Digital Products', type: 3 }],
    status: 'online',
  });
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd) await cmd.execute(interaction, client);
    } else if (interaction.isStringSelectMenu() || interaction.isButton() || interaction.isModalSubmit()) {
      // Try exact match first, then prefix match
      const handler =
        client.interactions.get(interaction.customId) ||
        [...client.interactions.values()].find(h => typeof h.customId === 'string' && interaction.customId.startsWith(h.customId));
      if (handler) await handler.execute(interaction, client);
    }
  } catch (err) {
    console.error('[Velxo] Interaction error:', err);
    const msg = { content: '❌ Something went wrong.', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

// Prefix command: .panel
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() === '.panel') {
    const panelPath = fs.existsSync(path.join(baseDir, 'commands/panel.js'))
      ? path.join(baseDir, 'commands/panel.js')
      : path.join(baseDir, 'panel.js');
    const { panelCommand } = require(panelPath);
    await panelCommand(message, client);
  }
});

client.login(process.env.DISCORD_TOKEN);
