'use strict';

const PLUGIN_NAME = 'gulp-google-calendar-events';
const PluginError  = require('plugin-error');
const log = require('fancy-log');
const through = require('through2')
const File = require('vinyl')
const path = require('path')
const {google} = require('googleapis');
const {JWT} = require('google-auth-library');

module.exports = function(credentials) {

  var cid
  var jsonevents = {}

  if (!credentials || !credentials.private_key_id) {
    this.emit('error', new PluginError(PLUGIN_NAME, 'Missing credentials.'));
    return cb();
  }

  function getEvents(file, enc, cb) {

    const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

    if (file.isNull()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Missing calender information.'))
      return cb()
    }

    const cal = JSON.parse(file.contents.toString());
    if (!cal) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Invalid calender information.'))
      return cb()
    }

    if (!cal.id) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Missing calender id as "id"-attribute in incoming JSON calendar information.'))
      return cb()
    }

    cid = cal.id
    log.info('Got calendar id ' + cid)

    // init calendar api incl. auth
    var auth = new google.auth.JWT(
      credentials.client_email, 
      null,
      credentials.private_key, 
      scopes
    );
    var calendar = google.calendar({version: 'v3', auth});

    // request calendar events from google
    calendar.events.list({
        calendarId: cid,
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        if (err) {
          this.emit('error', new PluginError(PLUGIN_NAME, 'The API returned an error: ' + err))
          return cb()
        }
        const events = res.data.items;
        if (events.length) {
          jsonevents = events;
        } else {
          log.info('No upcoming events found for calendar ' + cid)
        }
        return cb()
    })

  }


  function stream(cb) {
    if (!jsonevents) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'No events found to stream.'))
      return cb()
    }

    log.info('Stream events of calendar ' + cid)
    var filename = cid + '.json'
    var opts = {
      path: path.resolve('events', filename)
    }
    // opts.path = path.resolve('events', filename)
    var file = new File(opts)

    file.contents = new Buffer.from(JSON.stringify(jsonevents))
    return cb(null, file)
  }


  return through.obj(getEvents,stream)
};