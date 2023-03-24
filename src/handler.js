import  _ from 'lodash';
import crypto from 'crypto';

const salt = 'Hashing salt string';

function compareObjects(obj1, obj2) {
  const diff = {};
  const keys = Object.keys(obj1).concat(Object.keys(obj2));
  
  keys.forEach(key => {
    if (obj1[key] !== obj2[key]) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        diff[key] = compareObjects(obj1[key], obj2[key]);
      } else {
        diff[key] = [obj1[key], obj2[key]];
      }
    }
  });
  
  return diff;
}

const findDifference = (obj) => {
  let result = null;
  for (let item in obj) {
    const [a, b] = obj[item];
    if (Math.abs(a - b) === 1) {
      result = { [item]: [a, b] };
      break;
    }
  }
  return result;
}

async function fetchGuildInvites (guild) {
  const inviteCounts = {};

  await guild.invites.fetch()
    .then((invites) => {
      invites.forEach((invite) => {
        inviteCounts[invite.code] = invite.uses;
      });      
    })
  return inviteCounts;
}

async function onNewUser(member, client) {
  if(member.user.bot) return;
  
  const guild = member.guild;

  const newInvites = await fetchGuildInvites(guild);

  const inviteUsed = compareObjects(client.guildInvites, newInvites);

  const usedCode = Object.keys(inviteUsed).length === 1 ?
     Object.keys(inviteUsed)[0] :
     findDifference(inviteUsed);  

  if (!_.isEmpty(usedCode)) {
    const serverName = guild.name;
    const message = `${member.user.username} with the ID: ${member.user.id} joined using code ${usedCode} on server ${serverName}`;
    console.log(message);

    return {
      userName: `${member.user.username}`,
      userCode: `${usedCode}`,
      userId: `${member.user.id}`,
      joinedAt: Math.floor(Date.now() / 1000)
    };
  }
}

const generateHash = (str, salt) => {
  if (!_.isEmpty(str)) {
    return crypto.createHmac('sha256', salt)
      .update(str)
      .digest('hex');
  }
  return;
};

const saveUser = async (db, userId, userCode, userName) => {
  await db.query(`
  INSERT INTO users (userId, userCode, userName) VALUES (?, ?, ?)
`, [userId, userCode, userName]);
};

function getEventData(user) {
  let params;
  params =  {'data': [{
    'event_name': 'CompleteRegistration',
    'event_time': Math.floor(Date.now() / 1000),
    'event_source_url': 'https://www.0xbattleground.com',
    'action_source': 'website',
    'user_data': {
      'fn': generateHash(user.userName, salt) || ' ',
      'external_id': generateHash(user.userId, salt) || '',
      'fbc': `${process.env.FBC}`,
      'fbp': `${process.env.FBP}`,
      'subscription_id': user.code,
      'client_user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1'
    },
    'custom_data': {
      'content_name': 'Discord Server Join',
      'currency': user.code,
      'status': true,
      'value': 0
    },
  }]}
  console.log('params: ', params);
  return params;
}

export default {
  compareObjects,
  fetchGuildInvites,
  onNewUser,
  getEventData
}
