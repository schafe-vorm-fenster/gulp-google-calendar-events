'use strict'

const PLUGIN_NAME = 'gulp-google-calendar-events'

const PluginError  = require('plugin-error')
const log = require('fancy-log')
const through = require('through2')
const File = require('vinyl')
const path = require('path')
const {google} = require('googleapis')
const {JWT} = require('google-auth-library')

module.exports = function(credentials) {

  if (!credentials || !credentials.private_key || !credentials.client_email) {
    this.emit('error', new PluginError(PLUGIN_NAME, 'Missing credentials.'))
    return cb()
  }

  function get(file, enc, cb) {

    // set scope to rad calender events
    const scopes = ['https://www.googleapis.com/auth/calendar.readonly']

    if (file.isNull()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Missing calender information.'))
      return cb()
    }

    const cal = JSON.parse(file.contents.toString())
    if (!cal) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Invalid calender information.'))
      return cb()
    }

    if (!cal.id) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Missing calender id as "id"-attribute in incoming JSON calendar information.'))
      return cb()
    }

    // get the calendar id from incoming JSON file
    const cid = cal.id
    log.info('Got calendar id ' + cid)

    // init calendar api incl. auth by JWT for a server-to-server usage
    var auth = new google.auth.JWT(
      credentials.client_email, 
      null,
      credentials.private_key, 
      scopes
    )
    var calendar = google.calendar({version: 'v3', auth})

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
        const events = res.data.items
        if (events.length) {

          // Stream out the JSON event list to be used by additional GulpJS tasks.
          log.info('Stream events of calendar ' + cid)

          // set a subfolder "events" plus calendar id
          var folder = 'events/' + cid

          for (var i = 0; i < events.length; i++){
            var event = events[i]
            // set event file name to event id
            var filename = event.id + '.json'
            var opts = {
              path: path.resolve(folder, filename)
            }

            var file = new File(opts)

            // stream out the event as json file
            file.contents = new Buffer.from(JSON.stringify(event))
            this.push(file)
          }

          return cb(null, file)
        } else {
          log.info('No upcoming events found for calendar ' + cid)
          return cb()
        }
        
    })

  }

  return through.obj(get)
}