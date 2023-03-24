import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import mysql from 'mysql';
import handler from './handler.js';
import sendEvent from './sendEvent.js';

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

const db = mysql.createConnection(data);


db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
  
  const schemaQuery = `CREATE SCHEMA IF NOT EXISTS ${data.database}`;
  db.query(schemaQuery, (err, result) => {
    if (err) throw err;
  });
  
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

client.on('inviteCreate', async (invite) => {
  try {
    const server = await invite.guild.fetch();
    client.guildInvites = await handler.fetchGuildInvites(invite.guild);
    console.log(`Invite created for server ${server.name} (${server.id}) with URL: ${invite.url}`);
  } catch (err) {
    console.log(err);
  }
});

client.on('guildMemberAdd', async (member) => {
  try {
    await handler.onNewUser(member, client)
      .then(async (user) => {
        if (user) {
          const {userId, userCode, userName, joinedAt} = user
          console.log('New User: ', {userId: userId, code: userCode, userName: userName, time: joinedAt});

          const insertQuery = `INSERT INTO ${table} (userId, userCode, userName, timestamp) VALUES (?, ?, ?, ?)`;
          db.query(insertQuery, [userId, userCode, userName, new Date()], (err, result) => {
            if (err) console.log('insertQuery error: ', err);
            console.log('New User saved successfully into the database!');
          });

          await sendEvent(userId, userCode);
        } else {
          const userCode = ' ';
          const userId = `${member.user.id}`;
          const userName = `${member.user.username}`;
          console.log(`${userName} with the ID: ${userId} has Joined without using a custom link`)
    
          const insertQuery = `INSERT INTO ${table} (userId, userCode, userName, timestamp) VALUES (?, ?, ?, ?)`;
          db.query(insertQuery, [userId, userCode, userName, new Date()], (err, result) => {
            if (err) console.log('insertQuery error: ', err);
            console.log('New User saved successfully into the database!');
          });
        }
      });

    client.guildInvites = await handler.fetchGuildInvites(member.guild);
  } catch(err) {
    console.log(err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
