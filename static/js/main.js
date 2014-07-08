Chart.defaults.global.responsive = true;
Chart.defaults.global.showScale = false;
Chart.defaults.global.showTooltips = false;

var options = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : false,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 1,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : false
};

var genData = function (labels, data) {
  return {
    labels: labels,
    datasets: [{
      strokeColor: "#eee",
      data: data,
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
    }]
  };
};

var drawCharts = function () {
  $('#top').find('canvas').each(function (i, canvas) {
    $canvas = $(canvas);
    $canvas.attr('height', 100);
    $canvas.attr('width', $canvas.parent().width());
    var ctx = $canvas.get(0).getContext('2d');
    var data = $canvas.data('data').split(',');
    var labels = $canvas.data('labels').split(',');
    new Chart(ctx).Line(genData(labels, data), options);
  });
};

$(function () {
  drawCharts();
});

// Redraw charts on window resize.
$(window).resize(drawCharts);
