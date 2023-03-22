import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Construct the event payload with the user's information
async function sendEvent (id, code) {
  /* const event_payload = {data: [{
    event_name: `Join Discord - ${code}`,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: `https://www.0xbattleground.com`,
    action_source: 'website',
    event_id: `${id} - ${uuidv4()}` ,
    user_data: {
      client_user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1',
      subscription_id: `${code}`
    },
  }],
  // test_event_code: `${process.env.TEST_EVENT_CODE}`
  }; */


  const payload = {
    data: [
      {
        event_name: 'discord_server_join',
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: 'https://www.0xbattleground.com',
        action_source: 'website',
        event_id: `${uuidv4()}`,
        user_data: {
          client_user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1',
          subscription_id: `${code}`
        },
        custom_data: {
          content_name: 'Discord Server Join',
          content_category: 'Discord Server',
          custom_conversion_id: `${process.env.CUSTOM_CONVERSION_ID}`,
        }
      }
    ]
  }

  console.log('event payload: ', payload);
  
  // Send the event to Facebook's Meta Conversion API
  fetch(`https://graph.facebook.com/v16.0/${process.env.PIXEL_ID}/events?access_token=${process.env.ACCESS_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  .then((response) => {
    if (response.status === 200) {
      console.log('New User: Event sent to Facebook Conversion API successfully.');
    } else {
      console.error(`Failed to send event to Facebook Conversion API: ${response.status} - ${response.statusText}`);
    }
  })
  .catch((error) => {
    console.error(`Failed to send event to Facebook Conversion API: ${error}`);
  });

}


export default sendEvent;