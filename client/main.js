import { Template } from 'meteor/templating';
import { Notes } from '../lib/collections';
import './main.html';


Template.body.helpers({
  // notes:[
  //   {text:'My Note 1'},
  //   {text:'My Note 2'},
  //   {text:'My Note 3'}
  // ]
  notes(){
    return Notes.find({});
  }
});

Template.add.events({
  'submit .add-form'(event) {
    event.preventDefault();

    // Get input value
    const target = event.target;
    const text = target.text.value;

    Meteor.call('notes.insert', text);

    // Clear the form
    target.text.value = '';

    return false;
  }
});

Template.note.events({
  'click .delete-note'(event) {
    // Notes.remove(this._id);
    Meteor.call('notes.remove', this);
    return false;
  }
})