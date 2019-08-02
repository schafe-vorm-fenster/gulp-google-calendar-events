# gulp-google-calendar-events

Gulp plugin to load upcoming google calendar events by using the service api.

## Install

[![npm](https://nodei.co/npm/gulp-google-calendar-events.svg?downloads=true)](https://nodei.co/npm/gulp-google-calendar-events/)

```sh
npm install --save-dev gulp-google-calendar-events
```

## Basic Usage

```javascript
const gulp = require('gulp')
const googleevents = require('gulp-google-calendar-events/index.js')

const credentials = JSON.parse(fs.readFileSync('Schafe-vorm-Fenster-f85d38f06aa2.json', 'utf8'))

gulp.task('events:google', function() {
	return gulp.src('_json/calendars/**/*.json')
	.pipe(googleevents(credentials))
	.pipe(gulp.dest('_json/'))
})
```

## Config

**Credentials**:  
Expects a credential json file of a server to server api access.
See [Google API Console](https://console.developers.google.com/project/_/apiui/apis/library).

**Incoming file**:  
As incoming file a JSON file with at least the attribute "id" is expected. The id value has to be the calendar id of a public Google Calendar. See [Resource representations of Calendars](https://developers.google.com/calendar/v3/reference/calendars#resource).

Example:

```
{
  "id": "schafe-vorm-fenster.de_54lmd2pl6r0b5fqngf54sbuofk@group.calendar.google.com"
}
```

## Result

The plugin streams out the upcoming events in JSON like received from Google API. See [Events: list](https://developers.google.com/calendar/v3/reference/events/list). Every events will be streamed as a single file.

By default events are stroed within a folder "events" and a subfolder named by the calendar id.
The name of the event JSON file is the event id with ".json".

## Env

To securely store the API access data, it can be passed from environment:

```
#!/bin/sh

echo "set GOOGLEAPI_PRIVATE_KEY"
GOOGLEAPI_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
export GOOGLEAPI_PRIVATE_KEY
echo $GOOGLEAPI_PRIVATE_KEY

echo "set GOOGLEAPI_CLIENT_EMAIL"
GOOGLEAPI_CLIENT_EMAIL='kalenderdatenimport@schafe-vorm-fenster.iam.gserviceaccount.com'
export GOOGLEAPI_CLIENT_EMAIL
echo $GOOGLEAPI_CLIENT_EMAIL
```

So it can be accessed via dotenv and you are able to create the credential json as const within your task file:

```
const gulp = require('gulp')
const googleevents = require('gulp-google-calendar-events/index.js')
require('dotenv').config()

const credentials = {
	"private_key": JSON.parse(`"${process.env.GOOGLEAPI_PRIVATE_KEY}"`),
	"client_email": process.env.GOOGLEAPI_CLIENT_EMAIL
}

gulp.task('events:get', function() {
	return gulp.src('_json/calendars/**/*.json')
	.pipe(googleevents(credentials))
	.pipe(gulp.dest('_json/'))
});
```

