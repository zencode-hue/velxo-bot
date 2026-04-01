require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const commands = [];
const cmdPath  = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(cmdPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(cmdPath, file));
  if (cmd.data) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[Velxo] Deploying ${commands.length} slash commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('[Velxo] Commands deployed successfully.');
  } catch (err) {
    console.error('[Velxo] Deploy error:', err);
  }
})();
