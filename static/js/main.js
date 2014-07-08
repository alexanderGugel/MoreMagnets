Chart.defaults.global.responsive = true;
Chart.defaults.global.showScale = false;
Chart.defaults.global.showTooltips = false;

var options = {
  ///Boolean - Whether grid lines are shown across the chart
  scaleShowGridLines: false,

  //Boolean - Whether the line is curved between points
  bezierCurve: true,

  //Number - Tension of the bezier curve between points
  bezierCurveTension: 0.4,

  //Boolean - Whether to show a dot for each point
  pointDot: false,

  //Boolean - Whether to show a stroke for datasets
  datasetStroke: true,

  //Number - Pixel width of dataset stroke
  datasetStrokeWidth: 1,

  //Boolean - Whether to fill the dataset with a colour
  datasetFill: false
};

var rand255 = function () {
  return Math.floor(Math.random()*255);
};

var drawCharts = function () {
  $('canvas[data-type=line]').each(function (i, canvas) {
    $canvas = $(canvas);
    var ctx = $canvas.get(0).getContext('2d');
    var data = $canvas.data('data').split(',');
    var labels = $canvas.data('labels').split(',');
    canvas.style.width = '100%';
    $canvas.attr('height', '50px');
    new Chart(ctx).Line({
      labels: labels,
      datasets: [{
        strokeColor: '#999',
        data: data
      }]
    }, options);
  });
  $('canvas[data-type=doughnut]').each(function (k, canvas) {
    $canvas = $(canvas);
    var ctx = $canvas.get(0).getContext('2d');
    var values = $canvas.data('values').split(',');
    var labels = $canvas.data('labels').split(',');
    canvas.style.width = '100%';
    $canvas.attr('height', $canvas.parent().height());

    var data = [];
    for (var i = 0; i < labels.length; i++) {
      var r = rand255(), g = rand255(), b = rand255();
      data.push({
        value: parseInt(values[i]),
        color: 'rgba(' + r + ',' + g + ',' + b + ',0.5)',
        label: labels[i],
        highlight: 'rgba(' + r + ',' + g + ',' + b + ',0.9)',
      });
    }
    new Chart(ctx).Doughnut(data);
  });
  // (function () {
  //   $map = $('#map');
  //   $map.empty();
  //   var map = new Datamap({
  //     element: $map.get(0),
  //     fills: {
  //       defaultFill: '#eee',
  //       BUBBLE: '#333'
  //     },
  //     geographyConfig: {
  //       highlightOnHover: false
  //     }
  //   });
  //   var data = $map.data('data').split(',');
  //   var bubbles = [];
  //   if (data) {
  //     // Every second item in data array is a value (vice versa with labels)
  //     var bubble, max = parseInt(data[1]);
  //     for (var i = 0; i < data.length; i += 2) {
  //       bubble = {
  //         latitude: data[i].split('|')[0],
  //         longitude: data[i].split('|')[1],
  //         radius: 100*(parseInt(data[i+1])/max)+2,
  //         fillKey: 'BUBBLE'
  //       };
  //       bubbles.push(bubble);
  //     }
  //   }
  //   map.bubbles(bubbles, {
  //     borderWidth: 1,
  //     borderColor: '#fff',
  //     fillOpacity: 0.75,
  //     highlightOnHover: true,
  //     highlightFillColor: '#333',
  //     highlightBorderColor: '#fff',
  //     highlightBorderWidth: 2,
  //     highlightFillOpacity: 0.85
  //   });
  // })();
};

$(function () {
  drawCharts();
  // Smooth scrolling to anchor links.
  // See http://css-tricks.com/snippets/jquery/smooth-scrolling/
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});

var updateCreatedAt = function () {
  $('[data-ca]').each(function (i, el) {
    var $el = $(el);
    $el.text(moment($el.data('ca')).fromNow());
  });
};

updateCreatedAt();
setInterval(updateCreatedAt, 1000);

// Redraw charts on window resize.
$(window).resize(drawCharts);
