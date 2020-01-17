// svg box size
var margins = {},
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
        var svg = d3.select(canvas).append("svg");


        // Load map and dataset
        map.on('load', function () {
            d3.csv(dataurl, function(err, data) {
                drawData(data);
            });
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
        function drawData(data) {
            console.log("draw data");

            // give each data an id
            var id = 0;
            data.forEach(function(d){
                d.id = id
                id = id + 1
            }); 

            // 

            var sliderTime = d3
                .sliderBottom()
                .min(new Date(2010, 10))
                .max(new Date(2010, 12))
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



            // 
            
            // Call the update function
            update();

            // Update on map interaction
            map.on("viewreset", function() { update(0); });
            map.on("move", function() { update(0); });
            map.on("moveend", function() { update(0); });

            // var loc = svg.append("g")
            // .attr("class", "slidecontainer_locations");

        // Update function
        function update() { 

            var loc = svg.append("g")
            .attr("class", "slidecontainer_locations");

            var slider_year = d3.timeFormat('%Y %m')(sliderTime.value())
            var new_data = data.filter(function filter_by_year(d){ if (d["yr_mo"] == slider_year ) { return true; }});

            document.querySelectorAll(".slidecontaine_location_markers").forEach(function(d) {
                d.setAttribute("r",0);
            })

            new_data.forEach(function(d) {
                // console.log(d)
                var circle = loc.append("circle")
                    .datum(d)
                    .html(d)
                    .attr('class', "slidecontaine_location_markers")
                    .attr("cx", function(d) { return project(d.lon,d.lat).x ; })
                    .attr("cy", function(d) { return project(d.lon,d.lat).y ; })
                    .attr("r", function(d) { return 100; })
                    .style("fill", function(d) { return "black" })
                    .style("opacity", 1.0)
                    .append("title")
                    .text(function(d) { return d.naver_title; });
            })
        }
        }

        

        function setMapOpacity(value) {

            d3.selectAll(".mapboxgl-canvas")
                .transition()
                .duration(500)
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


        ////////////
        // Toggle
        ////////////

        function toggleViews() {

            // Toggle active view
            if (view == "map") {
                view = "grid";
                hideMap();
            } else if (view == "grid") {
                view = "map";
                showMap();
            }

            update(500);
        }