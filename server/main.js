import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { WebApp } from 'meteor/webapp';
import { Notes } from '../lib/collections';

// export const Notes = new Mongo.Collection('notes');

Meteor.startup(() => {

  var bodyParser = require('body-parser');
  WebApp.connectHandlers.use(bodyParser.urlencoded({extended: false}));
  WebApp.connectHandlers.use(bodyParser.json());
  WebApp.connectHandlers.use('/asen', (req, res, next) => {
    // console.log(req.body);
    res.writeHead(200);
    res.end();
    let response = JSON.parse(req.body.payload);
    if(response.type == "dialog_submission") {
      Meteor.call('dialog_submitted', response);
    } else {
      Meteor.call('new-task-dialog', response);
    }
  });
});
  
Meteor.methods({

  'dialog_submitted'(response) {
    let text = response.submission.task_name;
    let description = response.submission.task_description;
    let login = response.submission.login;
    HTTP.call("POST", response.response_url, {
      data: {
        "text": "You've just added a new task.",
        "response_type": "in_channel"
      }
    }, 
    function(error, request){

      if(error) {
        console.log(error);
      } else {
          console.log(request);
      }
    },
      Notes.insert({
        text,
        description,
        createdAt: new Date(),
        owner: login,
        username: login
      })
    );
  },

  'new-task-dialog'(payload) {
    let response = { 
      headers: { 
        "Authorization": "Bearer xoxp-261581676610-453348279793-464348965120-5beb3cafaf3c4e6b77c6f942b462e6fa",
        "Content-Type": "application/json"},
      data: {
        "trigger_id": payload.trigger_id,
        "dialog": {
          "callback_id": payload.callback_id,
          "title": "New Task",
          "submit_label": "Request",
          "state": "Limo",
          "elements": [
            {
              "type": "text",
              "label": "logIn",
              "name": "login"
            },
            {
              "type": "text",
              "label": "Name",
              "name": "task_name",
              "value": payload.message.text
            },
            {
              "type": "text",
              "label": "Task Description",
              "name": "task_description"
            }
          ]
        }
      }
    };

    HTTP.call("POST", "https://slack.com/api/dialog.open", response,
      function(error, request){
  
        if(error) {
          console.log(error);
        } else {
            console.log(request);
        }
      }
    );
  }

  // 'notes.insert'(text){
      
  //     check(text, String);
      
  //     // Check if user is logged in
  //     if(!Meteor.userId()){
  //         throw new Meteor.Error('not-authorized');
  //     }

  //     Notes.insert({
  //     text,
  //     createdAt: new Date(),
  //     owner: Meteor.userId(),
  //     username: Meteor.user().emails[0].address,
  //   });
  // },

  // 'notes.remove'(note){
  //     check(note._id, String);

  //     if(note.owner !== Meteor.userId()){
  //         throw new Meteor.Error('not-authorised');
  //     }

  //     Notes.remove(note._id);
  // }
});