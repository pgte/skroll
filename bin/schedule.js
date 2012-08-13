module.exports = function(schedule, titles, unitLinks) {
  var html = '';
  var day = 0;
  var lastHour;

  html += '<h1>Schedule</h1><table class="schedule"><thead><tr>';
  html += '<th>start</th>';
  html += '<th>end</th>';
  html += '<th></th>';
  html += '</tr></thead>';

  html += '<tbody>';

  schedule.forEach(function(entry) {

    if (! entry.start || ! entry.end) { throw new Error('Entry needs start and end'); }

    var hour = parseInt(entry.start.substring(0, 2), 10);

    if ((! lastHour) || hour < lastHour) {
      day ++;
      html += '<tr class="daybreak"><td colspan="3">Day ' + day + '</td></tr>';
    }
    lastHour = hour;

    var title = titles[entry.unit] || entry.unit || (entry['break'] ? 'Break' : '-');

    var link = unitLinks[entry.unit];
    if (link) {
      title = '<a href="' + link + '">' + title + '</a>';
    }

    html += '<tr>';
    html +=   '<td>' + entry.start + '</td>';
    html +=   '<td>' + entry.end + '</td>';
    html +=   '<td>' + title + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}