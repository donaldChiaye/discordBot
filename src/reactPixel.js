import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import mysql from 'mysql';
import handler from './handler.js';
import ReactPixel from 'react-facebook-pixel';
const { track } = ReactPixel;

dotenv.config();

const client = new Client({ intents: [
  GatewayIntentBits.Guilds ,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildInvites,
  ]
});

const data = {
  host: `${process.env.MYSQL_HOST}`,
  user: `${process.env.MYSQL_USER}`,
  password: `${process.env.MYSQL_PASSWORD}`,
  database: `${process.env.MYSQL_DATABASE}`,
}

const table = process.env.MYSQL_TABLE_NAME;
const pixelId = process.env.PIXEL_ID;

const options = {
  autoConfig: true,
  debug: false,
};
// ReactPixel.init(pixelId, options);

const db = mysql.createConnection(data);

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
  
  // check if schema exists, create it if not
  const schemaQuery = `CREATE SCHEMA IF NOT EXISTS ${data.database}`;
  db.query(schemaQuery, (err, result) => {
    if (err) throw err;
  });
  
  // check if the table exists, create it if not
  const tableQuery =`
  CREATE TABLE IF NOT EXISTS ${table} (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    userCode VARCHAR(255) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `
  db.query(tableQuery, (err, result) => {
    if (err) throw err;
    console.log('Table created or exists!');
  });

});


client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    client.guildInvites = await handler.fetchGuildInvites(guild);
  } catch (err) {
    console.log(err);
  }
});

// Whenever a new invite is created, we refresh our cache
client.on('inviteCreate', async (invite) => {
  try {
    const server = await invite.guild.fetch();
    client.guildInvites = await handler.fetchGuildInvites(invite.guild);
    console.log(`Invite created for server ${server.name} (${server.id}) with URL: ${invite.url}`);
  } catch (err) {
    console.log(err);
  }
});

// we retrieve the new Invites values and compare them with  their previous values.
client.on('guildMemberAdd', async (member) => {
  try {
    await handler.onNewUser(member, client)
      .then(async (user) => {
        if (user) {
          const {userId, userCode, userName, joinedAt} = user
          console.log('New User: ', {userId, userCode, userName, joinedAt});
         
          track(pixelId, 'CompleteRegistration', {
            em: member.user.email,
            user_id: userId,
            user_name: userName,
          });
        }
      });
  } catch (err) {
    console.log(err);
  }
  });

// login to discord
client.login(process.env.BOT_TOKEN);
