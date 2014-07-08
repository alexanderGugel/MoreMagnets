var config = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 1,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 1,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : false,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span> </li><%}%></ul>"

};

var genData = function (labels, data) {
  return {
    labels: labels,
    datasets: [{ data: data }]
  };
};

var drawCharts = function () {
  $('#top').find('canvas').each(function (i, canvas) {
    $canvas = $(canvas);
    $canvas.attr('height', 100);
    $canvas.attr('width', $canvas.parent().width());
    var ctx = $canvas.get(0).getContext('2d');
    var data = $canvas.data('data').split(',');
    // var labels = [];
    //
    // for (var i = 0; i < data.length; i++) {
    //   labels.push('');
    // }

    var labels = $canvas.data('labels').split(',');
    new Chart(ctx).Line(genData(labels, data), config);
  });
};

$(function () {
  drawCharts();
});

// Redraw charts on window resize.
$(window).resize(drawCharts);
