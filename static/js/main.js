var drawCharts = function () {
  $('#top').find('canvas').each(function (i, canvas) {
    $canvas = $(canvas);
    $canvas.attr('height', 100);
    $canvas.attr('width', $canvas.parent().width());
    var ctx = $canvas.get(0).getContext('2d');
    new Chart(ctx);
  });
};

$(function () {
  drawCharts();
});

// Redraw charts on window resize.
$(window).resize(drawCharts);
