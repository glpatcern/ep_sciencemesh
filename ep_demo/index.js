'use strict';

var fs = require('fs');
const apiKey = fs.readFileSync('./APIKEY.txt', 'utf8');

const util = require('util');
const axios = require("axios");
const db = require('ep_etherpad-lite/node/db/DB');

const URL = "http://192.168.1.8:8880";

const api = require('etherpad-lite-client')
const etherpad = api.connect({
  apikey: apiKey,
  host: 'localhost',
  port: 9001,
})

const SessionID = {
  sessionID: null
} 


const postData = async (pad_content) => {

    axios({
      method: "POST",
      url: URL + `/wopi/bridge/${pad_content.pad.id}`,
      data: data,
      headers: { 'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': data.length,
        'X-EFSS-Metadata': data,
        'accept': '*/*' },
    })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (response) {
        console.log(response);
      });
    };

exports.padCreate = function (pad, context) {
    console.log(pad, context)
}

let globalAuthorID = null;
let globalGroupID = null;

exports.padLoad = function (pad, context) {
    console.log('Pad was LOADED')
    console.log(pad, context)

    etherpad.createGroup(function (error, data) {
      if(error) console.error('Error during api call for pad: ' + error.message)
      else { 
        console.log('createGroup: ', JSON.stringify(data))

        globalGroupID = data['groupID'];
        console.log('globalGroupID: ', globalGroupID, '\n')
      }
    })  
}

exports.padUpdate = function (hook_name, context) {
    console.log('Pad was UPDATED | CONTEXT ===============>', context)

    let argss = {
      padID: context.pad.id
    }

    // globalAuthorID = context.pad.id;
    globalAuthorID = context.author
    etherpad.padUsersCount(argss, function(error, data) {
      if(error) console.error('Error during api call for pad: ' + error.message)
      else {
      console.log('Current number of PadUsers: ', JSON.stringify(data))

      // if there are multiple users using a pad, then create a group.
      // maintain a global number of users, 

      etherpad.padUsers(argss, function(error, data) {
        if(error) console.error('Error during api call for pad: ' + error.message)
        else {
          console.log('List of PadUsers: ', JSON.stringify(data))            
        }
      })

    }
    })

    etherpad.listAllGroups(function (error, data) {
      if(error) console.error('Error during api call for pad: ' + error.message)
      else { 
        console.log('Group list: ', JSON.stringify(data))
      }
      })
}

exports.userLeave = function(hook, session, callback) {
  console.log('%s left pad %s', session.author, session.padId, session);

  // After the user has left the session the pad gets stored in the actual DB
  // Can be used to invoke a function that does things after saving to the DB
  callback(new Promise(
    (resolve, reject) => {
        resolve(console.log('USER HAS LEFT THE PAD NOW'))
    }
  ))
  return;
}

exports.exportFileName = function(hook, padId, callback){
  callback("cernbox_etherpad_"+padId);
}

exports.padRemove = function (pad_id) {
  console.log('Pad was removed');
}
