import  _ from 'lodash';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import mysql from 'mysql';
import { FacebookAdsApi, AdsPixel } from 'facebook-nodejs-business-sdk';
import handler from './handler.js';
import { map } from './dataMap.js';
import axios from 'axios';

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
  pixelId: `${process.env.PIXEL_ID}`,
  table: `${process.env.MYSQL_TABLE_NAME}`,
  accessToken: `${process.env.ACCESS_TOKEN}`,
  botToken: `${process.env.DISCORD_BOT_TOKEN}`,
  guildId: `${process.env.GUILD_ID}`,
  adAccountId: `${process.env.AD_ACCOUNT_ID}`,
  customConversionId: `${process.env.CUSTOM_CONVERSION_ID}`,
  rootUrl: `${process.env.ROOT_URL}`
}

const db = mysql.createConnection(data);

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
  
  const schemaQuery = `CREATE SCHEMA IF NOT EXISTS ${data.database}`;
  db.query(schemaQuery, (err, result) => {
    if (err) throw err;
  });

  const tableQuery =`
    CREATE TABLE IF NOT EXISTS ${data.table} (
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

const api = FacebookAdsApi.init(data.accessToken);

const showDebugingInfo = true; // Setting this to true shows more debugging info.
if (showDebugingInfo) {
  api.setDebug(true);
}

const logApiCallResult = (apiCallName, data) => {
  if (showDebugingInfo) {
    // console.log(apiCallName + ' Event Data: ' + JSON.stringify(data));
    console.log(apiCallName + ' Event Data sent successfully to Meta.');
  }
};

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  try {
    const guild = client.guilds.cache.get(data.guildId);
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
    const fields = [];

    await handler.onNewUser(member, client)
      .then(async (user) => {
        if (user) {
          let options = await handler.generateRequestPayload(
            map,
            user.userCode,
            data.rootUrl,
            data.pixelId,
            data.accessToken,
          );
          
          console.log('new user: ', user);
          
          /* const events = (new AdsPixel(data.pixelId))
            .createEvent(fields, handler.getEventData(user))
          logApiCallResult('Complete registration', events); */

          !_.isEmpty(options) ?
          axios.request(options)
            .then(() => {
              console.log('Axios: Event sent to Meta successfully');
            })
            .catch((error) => {
              console.log('Axios Error: ', error);
            }) : 
          console.log('Axios: Invalid parameter,  Event not sent to Meta');          
        }
      });

      client.guildInvites = await handler.fetchGuildInvites(member.guild);        

    } catch (err) {
    console.log('GuildMemberAdd handler error: ', err);
  }
  }
);

client.login(data.botToken);
