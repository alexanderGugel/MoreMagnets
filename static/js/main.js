var data = {
    labels: [""],
    datasets: [
        {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        }
    ]
};

var getData = function () {

};

var drawCharts = function () {
  $('#top').find('canvas').each(function (i, canvas) {
    $canvas = $(canvas);
    $canvas.attr('height', 100);
    $canvas.attr('width', $canvas.parent().width());
    var ctx = $canvas.get(0).getContext('2d');
    new Chart(ctx).Bar(data);
  });
};

$(function () {
  drawCharts();
});

// Redraw charts on window resize.
$(window).resize(drawCharts);
