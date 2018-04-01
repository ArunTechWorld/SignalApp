 $("#slider").roundSlider({
    radius: 90,
    circleShape: "pie",
    sliderType: "min-range",
    showTooltip: true,
    editableTooltip: false,
    startAngle: 305,
    tooltipFormat: "changeTooltip",
    lineCap: "round",
    min: 25,
    max: 125,
    step: 5,
    width: 20,
    value: window.Maxspeed,
});
$("#slider").roundSlider({"endAngle": "+290"});
function changeTooltip(e) {
    var val = e.value, speed;
   /* if (val < 20) speed = "Slow";
    else if (val < 40) speed = "Normal";
    else if (val < 70) speed = "Speed";
    else speed = "Very Speed";*/
    window.Maxspeed=val;
    return val + '<div class="mph">MPH</div>';
}
 