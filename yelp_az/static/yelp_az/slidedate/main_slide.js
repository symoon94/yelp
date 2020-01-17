// svg box size
var width = 150,
    height = 80,
    margins = {},
    centered;

// Set margins around rendered map
margins.top    = 0,
margins.bottom = 0,
margins.left   = 0,
margins.right  = 0;

var projection = d3.geo.mercator()
    .center([111.093735, 34.048927])
    .scale(500)
    .translate([width/1.5, height/6]);

var path = d3.geo.path().projection(projection);

d3.queue()
    .defer(d3.json, topourl)
    .awaitAll(render_map);



function render_map(error, result_data){
    if (error) { console.error(error) };

    var topology  = result_data[0],
        locations = result_data[1];

    var id = 0

    locations.forEach(function(d){
        d.id = id
        id = id + 1
    })

    var features = topojson.feature(topology, topology.objects.cb_2015_arizona_county_20m).features;

    var sliderTime = d3
        .sliderBottom()
        .min(new Date(2010, 10))
        .max(new Date(2019, 05))
        .step(1000 * 60 * 60 * 24)
        .width(800)
        .tickFormat(d3.timeFormat('%Y %m'))
        .default(new Date(2010, 11))
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

    var svg = d3.select("#slidecontainer")
        .append("svg")
        .attr("viewBox",margins.top+" "+margins.left+" "+(width-margins.right)+" "+(height-margins.bottom))
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append('g')
        .attr('class', "slidecontainer_group");

    var map = svg.append("g").attr("id", "map");

    map.selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("class", function(d) { console.log(); return "municipality c" + d.properties.code; })
        .attr("d", path)
        .on("click", clicked);

    map.selectAll("text")
        .data(features)
        .enter().append("text")
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class", "municipality-label")
        .text(function(d) { return d.properties.name; })

    var loc = svg.append("g")
        .attr("class", "slidecontainer_locations");

    function update() {

        var slider_year = d3.timeFormat('%Y %m')(sliderTime.value())
        var new_data = locations.filter(function filter_by_year(d){ if (d["yr_mo"] == slider_year ) { return true; }});


        document.querySelectorAll(".slidecontaine_location_markers").forEach(function(d) {
            d.setAttribute("r",0);
        })

        new_data.forEach(function(d) {
            // console.log(d)
            var circle = loc.append("circle")
                .datum(d)
                .html(d)
                .attr('class', "slidecontaine_location_markers")
                .attr("cx", function(d) { return Number(projection([d.lon,d.lat])[0]); })
                .attr("cy", function(d) { return Number(projection([d.lon,d.lat])[1]); })
                .attr("r", function(d) { return d.post/600; })
                .style("fill", function(d) { return color(d.categ) })
                .style("opacity", 0.7)
                .append("title")
                .text(function(d) { return d.naver_title; });
        })




        // var places = loc.selectAll("circle")

        // var join = places.data(new_data)

        // var enter = join.enter()
        // var exit = join.exit()

        // enter.append("circle")
        //     .attr('class', "slidecontaine_location_markers")
        //     .attr("cx", function(d) { return Number(projection([d.lon,d.lat])[0]); })
        //     .attr("cy", function(d) { return Number(projection([d.lon,d.lat])[1]); })
        //     .attr("r", function(d) { return d.post/5; })
        //     .style("fill", function(d) { return color(d.categ) })
        //     .style("opacity", 0.7)
            // .append("title")
            // .text(function(d) { return d.naver_title; });

        // exit.remove();
    }

    update();

    function clicked(d) {
        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 10;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        map.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        map.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1 / k + "px");

        loc.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        loc.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 0.5 / k + "px");
    };
};
    
