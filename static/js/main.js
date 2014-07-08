Chart.defaults.global.responsive = true;
Chart.defaults.global.showScale = false;
// Chart.defaults.global.showTooltips = false;

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

var genLineData = function (labels, data) {
  return {
    labels: labels,
    datasets: [{
      strokeColor: '#eee',
      data: data
    }]
  };
};

var rand255 = function () {
  return Math.floor(Math.random()*255);
};

var genDoughnutData = function (labels, values) {
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
  return data;
};

var drawCharts = function () {
  $('#top').find('canvas').each(function (i, canvas) {
    $canvas = $(canvas);
    var ctx = $canvas.get(0).getContext('2d');
    var data = [], labels = [];
    if ($canvas.data('data') && $canvas.data('labels')) {
      data = $canvas.data('data').split(',');
      labels = $canvas.data('labels').split(',');
    }
    canvas.style.width = '100%';
    $canvas.attr('height', '50px');
    new Chart(ctx).Line(genLineData(labels, data), options);
  });
  $('#stats').find('canvas').each(function (i, canvas) {
    $canvas = $(canvas);
    var ctx = $canvas.get(0).getContext('2d');
    var data = $canvas.data('data').split(','), values = [], labels = [];
    if (data) {
      // Every second item in data array is a value (vice versa with labels)
      var i;
      for (i = 0; i < data.length; i += 2) {
        labels.push(data[i]);
      }
      for (i = 1; i < data.length; i += 2) {
        values.push(data[i]);
      }
    }
    canvas.style.width = '100%';
    $canvas.attr('height', $canvas.parent().height());
    new Chart(ctx).Doughnut(genDoughnutData(labels, values));
  });

  (function () {
    $map = $('#map');
    $map.empty();
    var map = new Datamap({
      element: $map.get(0),
      fills: {
        defaultFill: '#eee',
        BUBBLE: 'red'
      }
    });
    var data = $map.data('data').split(',');
    var bubbles = [];
    if (data) {
      // Every second item in data array is a value (vice versa with labels)
      var bubble, max = parseInt(data[1]);
      for (var i = 0; i < data.length; i += 2) {
        bubble = {
          latitude: data[i].split('|')[0],
          longitude: data[i].split('|')[1],
          radius: 100*(parseInt(data[i+1])/max),
          fillOptacity: 0.5,
          fillKey: 'BUBBLE'
        };
        bubbles.push(bubble);
      }
    }
    map.bubbles(bubbles);
  })();
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

// Redraw charts on window resize.
$(window).resize(drawCharts);
