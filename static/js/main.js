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

var genData = function (labels, data) {
  return {
    labels: labels,
    datasets: [{
      strokeColor: '#eee',
      data: data
    }]
  };
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
    $canvas.attr('height', 50);
    new Chart(ctx).Line(genData(labels, data), options);
  });
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
