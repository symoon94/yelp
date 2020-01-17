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
            d3.json("data/berlin-parks.json", function(err, data) {
                drawData(data);
            });
        });

        // Project GeoJSON coordinate to the map's current state
        function project(d) {
            return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
        }


        //////////////
        // D3 stuff
        //////////////

        // Draw GeoJSON data with d3
        var circles;
        function drawData(data) {
            console.log("draw data");

            // Add circles
            circles = svg.selectAll("circle")
                .data(data.features)
                .enter()
                .append("circle")
                    .attr("r", 16)
                    .on("click", function(d) {
                        alert(d.properties.name);
                    });

            // Call the update function
            update();

            // Update on map interaction
            map.on("viewreset", function() { update(0); });
            map.on("move", function() { update(0); });
            map.on("moveend", function() { update(0); });
        }

        // Update function
        function update(transitionTime) {

            // Default value = 0
            transitionTime = (typeof transitionTime !== 'undefined') ? transitionTime : 0;

            // Map view
            if (view === "map") {

                svg.selectAll("circle")
                    .transition()
                    .duration(transitionTime)
                       .attr("cx", function(d) { return project(d.geometry.coordinates).x })
                       .attr("cy", function(d) { return project(d.geometry.coordinates).y });

            // Grid view
            } else if (view === "grid") {

                var ix = 0,
                    iy = 0,
                    rows = 3,
                    cols = 3;

                // Check window with and height
                var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

                var gridItemWidth = (windowWidth*0.8)/(cols+1);
                var gridItemHeight = (windowHeight)/(rows+1);

                svg.selectAll("circle").each(function(d) {

                    var circle = d3.select(this);

                    console.log("ix: " + ix + ", iy: " + iy);

                    circle
                        .transition()
                        .duration(transitionTime)
                            .attr("cx", function(d) {
                                return (windowWidth*0.2) + (ix*gridItemWidth) + (0.5*gridItemWidth);
                            })
                            .attr("cy", function(d) {
                                return (iy*gridItemHeight) + gridItemHeight;
                            });

                    // Increase iterators
                    ix++;
                    if (ix === cols) { ix = 0; iy++; }
                    if (iy === rows) { iy = 0; }
                });
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