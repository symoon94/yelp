// svg box size
var width = 0,
    height = 0,
    margins = {},
    centered;

// Set margins around rendered map
margins.top    = 0,
margins.bottom = 0,
margins.left   = 0,
margins.right  = 0;

var view = "map";

//////////////////
// Mapbox stuff
//////////////////

// Set-up map
mapboxgl.accessToken = 'pk.eyJ1Ijoic29veW91bmdtb29uIiwiYSI6ImNrNWloNmNhcjBlaGUza21tMDZ1dzFicTkifQ.1oTHyX3U78b7-TN0tkA2JQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 11.5,
    center: [-110.9247, 32.2226],
});


//////////////////////////
// Mapbox+D3 Connection
//////////////////////////

// Get Mapbox map canvas container
var canvas = map.getCanvasContainer();

// Overlay d3 on the map
var svg = d3.select(canvas).append("svg").attr("class", "data");
var legendSvg = d3.select(canvas).append("svg").attr("class", "legend");


// Load map and dataset
map.on('load', function () {
    d3.csv(dataurl, function(err, data) {
        drawData(data);
    });

    // Add legend: bar
    legendSvg
        .selectAll("legend-bar")
        .data(stars)
        .enter()
        .append("rect")
        .attr("class", "slidecontainer_legend_bar")
        .attr("width", function(d) { return 25; } )
        .attr("height", 25)
        .attr("transform", function(d) {return "translate(" + d*30 + ",20)"})
        .style("fill", "black")
        .attr("opacity", function(d) { return d/5; });

    // Add legend: labels
    legendSvg
        .selectAll("legend-bar")
        .data(starsSym)
        .enter()
        .append("text")
        .attr("class", "slidecontainer_legend_text")
        .attr('x', function(d){ return 34 + d*27 } )
        .attr('y', 73 )
        .text( function(d){ return "★" + d } );

    // Add legend: circles
    legendSvg.selectAll("circle")
        .data(valuesToShow)
        .enter()
        .append("circle")
        .attr("class", "slidecontainer_legend_circle")
        .attr("cx", xCircle)
        .attr("cy", function(d){ return yCircle - size(d) } )
        .attr("r", function(d){ return size(d) })
        .style("fill", "none")
        .attr("stroke", "black");

    // Add legend: segments
    legendSvg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function(d){ return xCircle + size(d) } )
    .attr('x2', xLabel-5)
    .attr('y1', function(d){ return yCircle - size(d) } )
    .attr('y2', function(d){ return yCircle - size(d) } )
    .style("stroke-dasharray", ("2,2"))
    .style("stroke", "#008F11");  // set the line colour

    // Add legend: labels
    legendSvg
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr('x', xLabel)
        .attr('y', function(d){ return 3 + yCircle - size(d) } )
        .text( function(d){ return d } )
        .style("fill", "#00FF41");
});

// Project GeoJSON coordinate to the map's current state
function project(lon, lat) {
    return map.project(new mapboxgl.LngLat(+lon, +lat));
}


//////////////
// D3 stuff
//////////////

// Draw GeoJSON data with d3
var circles;
var texts;
var legend;
var legendText;
var legendBar;

var size = d3.scaleSqrt()
    .domain([1, 100])  // What's in the data
    .range([1, 100]) 

// Add legend: circles
var valuesToShow = [10, 20, 30]
var xCircle = 90
var xLabel = 200
var yCircle = 200

// Add legend: horizontal
var stars = [0,1,2,3,4,5];
var starsSym = [0, 5]

var colorScale = d3.scaleSequential()
    .domain([0, 5])
    .interpolator(d3["interpolateRainbow"]);

function drawData(data) {
    console.log("draw data");

    // give each data an id
    var id = 0;
    data.forEach(function(d){
        d.id = id
        id = id + 1
    }); 

    var sliderTime = d3
        .sliderBottom()
        .min(new Date(2011, 01))
        .max(new Date(2019, 12))
        .step(1000 * 60 * 60 * 24)
        .width(800)
        .tickFormat(d3.timeFormat('%Y %m'))
        .default(new Date(2019, 12))
        .on("onchange", function input(val) {
            update();
            d3.select('p#value-time').text(d3.timeFormat('%Y %m')(val));
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox","-12 -10 900 100")
        .attr('class', "slider-map")
        .append('g');

    gTime.call(sliderTime);

    d3.select('p#value-time')
        .text(d3.timeFormat('%Y %m')(sliderTime.value()));
    
    // Call the update function
    update();

    // Update on map interaction
    map.on("viewreset", function() { update(0); });
    map.on("move", function() { update(0); });
    map.on("moveend", function() { update(0); });

    


// Update function
function update(transitionTime) { 

    // Default value = 0
    transitionTime = (typeof transitionTime !== 'undefined') ? transitionTime : 0;

    var slider_year = d3.timeFormat('%Y %m')(sliderTime.value())
    var new_data = data.filter(function filter_by_year(d){ if (d["date"] == slider_year ) { return true; }});

    

    document.querySelectorAll(".slidecontainer_location_markers").forEach(function(d) {
        d.setAttribute("r",0);
    })

    document.querySelectorAll(".slidecontainer_location_markers").forEach(function(d) {
        d.setAttribute("r",0);
    })

    // Add circles
    circles = svg.selectAll("circle")
    .data(new_data)
    .enter()
    .append("circle")
        .attr("r", 8)
        .on("click", function(d) {
            alert(d.url)
        })
        .append("title")
        .text(function(d) {return d.title});

    // Add restaurants' title
    texts = svg.selectAll("text")
        .data(new_data)
        .enter()
        .append("text")
        .text(function(d) { return d.title; })
        .style("opacity", 1);
    if (map.getZoom() > 11) {
        d3.selectAll(".slidecontainer_location_titles")
        .style("opacity", 1);
    } else {
        d3.selectAll(".slidecontainer_location_titles")
        .style("opacity", 0);
    }

    // circles
    svg.selectAll("circle")
        .transition()
        .duration(transitionTime)
        .attr('class', "slidecontainer_location_markers")
        .attr("cx", function(d) { return project(d.lon,d.lat).x ; })
        .attr("cy", function(d) { return project(d.lon,d.lat).y ; })
        .attr("opacity", function(d) { return d.rate/5; })
        .attr("r", function(d) { return d.post/1; });

    // restaurants' title
    svg.selectAll("text")
        .transition()
        .duration(transitionTime)
        .attr('class', "slidecontainer_location_titles")
        .attr("dx", function(d) { return d.post/0.7 + project(d.lon,d.lat).x ; })
        .attr("dy", function(d) { return d.post/4 + project(d.lon,d.lat).y ; })
        .text(function(d) { return d.title; });
    

}
}



function setMapOpacity(value) {

    d3.selectAll(".mapboxgl-canvas")
        .transition()
        .duration(200)
            .style("opacity", value);

    d3.selectAll(".mapboxgl-control-container")
        .transition()
        .duration(500)
            .style("opacity", value);
}

function showMap() {
    setMapOpacity(1);

    // Enable map interaction
    map.doubleClickZoom.enable();
    map.scrollZoom.enable();
    map.dragPan.enable();
}

function hideMap() {
    setMapOpacity(0.1);

    // Disable map interaction
    map.doubleClickZoom.disable();
    map.scrollZoom.disable();
    map.dragPan.disable();
}


// ////////////
// // Toggle
// ////////////

// function toggleViews() {

//     // Toggle active view
//     if (view == "map") {
//         view = "grid";
//         hideMap();
//     } else if (view == "grid") {
//         view = "map";
//         showMap();
//     }

//     update(500);
// }