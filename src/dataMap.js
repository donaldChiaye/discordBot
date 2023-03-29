import qs from 'qs';
import {v4 as uuid } from 'uuid';

export const map = {
  'ph-video': 'CxnmJEmFyh',
  'ph-video-2': '9mqyFuqTxh',
  'india': 'QEbfejcNGA',
  'india-2': 'EAr8SxmG84',
  'bangladesch': 'VC9kaNMa5N',
  'bangladesch-2': 'RN4GMRVUUg',
  'pakistan': 'P8Q26qwK9j',
  'paskistan-2': 'hgWX8cJeWs',
  'malaysia': 'Z5gaT7tu3T',
  'malaysia-2': 'cUndcrzdwx',
  'indonesia': 'c5hCPjG4yU',
  'indonesia-2': 'BMxVZH2Q77',
  'ee-video': 'RyHb7T9Ed2',
  'ee-video-2': 'R5Yy2VpB8n',
  'we-video-high': 'xgchcr6j3U',
  'we-video-high-2': 'WA4RhYut5F',
  'We-video-low': 'TQDn9xRDC5',
  'we-video-low-2': 'CDah9MeNqJ',
  'us-video': 'ggvtGuU3my',
  'us-video-2': 'WwRpTfYejB',
  'us-video-lead': 'RKhUBHf2F9',
  'india-nft': 'JjewUwH2XC',
  'india-gaming': 'GxrZ6fgPtM',
  'china': 'NdwNZKHHND',
  'venezuala': 'zW3BaGtVxW',
  'pakistan-nft': 'nGNpCNArfH',
  'pakistan-gaming': 'Ntp2BPht8K',
  'india-gaming-2': 'j3refT2DWh',
  'india-3': 'xKyc2ha7Qd',
  'us-gaming': 'xkXSRaJGdG',
  'india-gaming-event': 'VYtcExbK89',
  // 'custom-conversion-test': 'DjBD6kB'
};

export function config (link, code, rootUrl, pixelId, token, fbc) {
  let data;
  let config;
 
  data = qs.stringify({
    'id': `${pixelId}`,
    'ev': 'Custom Conversion Test',
    'dl': `${link}`,
    'rl': 'https://l.facebook.com/',
    'if': 'false',
    'ev_id': uuid(),
    'ts': Math.floor(Date.now() / 1000),
    'cd[Meta]': '{"title":"new_custom_conversion","meta:description":"New+user+Join+Discord."}',
    'cd[OpenGraph]': `{"og:locale":"en_US","og:type":"registration","og:title":"New+user+Join+Discord":${code},"og:url":${link},"og:site_name":"0xbattleground","article:published_time":${new Date()},"article:modified_time":${new Date()},"og:}`,
    'sw': '1280',
    'sh': '720',
    'v': '2.9.100',
    'r': 'stable',
    'a': '0xbattleground',
    'ec': '1',
    'o': '30',
    'fbp': `fb.1.${Math.floor(Date.now() / 1000)}.1984996788`,
    'it': `${code}`,
    'coo': 'false',
    'es': 'automatic',
    'tm': '3',
    'rqm': 'formPOST' 
  });
  
  config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://www.facebook.com/tr/',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded, text/plain', 
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
      'Origin': `${link}`, 
      'Referer': `${rootUrl}`, 
      'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
      'sec-fetch-dest': 'iframe',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'cross-site',
      'Connection': 'keep-alive', 
      'upgrade-insecure-requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 
      'Authorization': `Bearer ${token}`
    },
    data : data
  };

  return Promise.resolve(config);
}
