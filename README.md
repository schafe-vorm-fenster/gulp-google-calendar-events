# gulp-google-calendar-events
Gulp plugin to load upcoming google calendar events by using the service api.

## Install

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

The plugin results the upcoming events in JSON like received from Google API. See [Events: list](https://developers.google.com/calendar/v3/reference/events/list).

Default name of the JSON file is the calendar id with ".json", e.g. ```schafe-vorm-fenster.de_54lmd2pl6r0b5fqngf54sbuofk@group.calendar.google.com.json```.

Customise the name by 

```
.pipe(rename("events.json"))
```

Default location is a subfolder "events" of the incoming calender config folder. Customise the folder by 

```
.pipe(gulp.dest('_json/'))
```
