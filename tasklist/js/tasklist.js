/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core', './d3.min.js'], function($, oae, d3) {

    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        var arrayFollowing;

        function holderObj() {
            this.nodes = [];
            this.links = [];
        }

        function linkObj() {
            this.s;
            this.t;
            this.v;
        }

        function meObj() {
            this.displayName = "Me";
        }

        function histoObj() {
            this.count;
            this.name;
        }

        var arrayHistObj = [];

        var h1 = new holderObj();
        var h2;
        var graph;

        var numGroups;
        var numFiles;
        var numDiscussions;
        

        var url1 = '/api/following/' + widgetData.context.id + '/following';
        var url2 = '/api/user/' + widgetData.context.id + '/memberships';
        var url3 = '/api/content/library/' + widgetData.context.id;
        var url4 = '/api/discussion/library/' + widgetData.context.id;

        //$.getJSON(url1, function(data) { console.log(data);});
        $.getJSON(url1, function(result) { 
            //console.log(result);
            arrayFollowing = result.results;
            for(i = 0; i < arrayFollowing.length; i++) {
                h1.nodes.push(arrayFollowing[i]);
            }
            console.log(arrayFollowing[0]);
            console.log(h1.nodes);
            h1.nodes.push(new meObj());

            console.log(arrayFollowing[0]);
            console.log(h1.nodes);

            var len = h1.nodes.length;
            console.log(len);
            for(j = 0; j < len - 1; j++) {
                var tempLink = new linkObj();
                tempLink.source = j;
                tempLink.target = len - 1;
                tempLink.value = 1;
                h1.links.push(tempLink);
            }
            console.log(h1);
            h2 = JSON.stringify(h1);
            console.log(h2);
            //graph = JSON.parse(h2);
            graph = h1;
            console.log(graph);
            runVis();
        });

        getGroups();

        function getGroups() {
            $.getJSON(url2, function(result) {
                numGroups = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Groups";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                getFiles();
            });
        }

        function getFiles() {
            $.getJSON(url3, function(result) {
                numFiles = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Files";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                getDiscussions();
            });
        }

        function getDiscussions() {
            $.getJSON(url4, function(result) {
                numDiscussions = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Discussions";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                console.log(arrayHistObj);
                runVis2();
            });
        }


        


        function runVis() {

            var width = 320,
                height = 320;

            var color = d3.scale.category10();

            var force = d3.layout.force()
                .charge(-220)
                .linkDistance(80)
                .size([width, height]);

            var svg = d3.select("#tasklist-container").append("svg")
                .attr("width", width)
                .attr("height", height);

            
            force
                  .nodes(graph.nodes)
                  .links(graph.links)
                  .start();

                  console.log(force);

              var link = svg.selectAll(".link")
                  .data(graph.links)
                .enter().append("line")
                  .attr("class", "link")
                  .style("stroke-width", 1);

              var circle_holds = svg.selectAll("circle")
                  .data(graph.nodes)
                .enter()
                  .append("g")
                  .call(force.drag);

              circle_holds.append("circle")
                  .attr("class", "node")
                  .attr("r", 15)
                  .style("fill", function(d) { return color(Math.floor((Math.random() * 10) + 1)); });

              circle_holds.append("text")
                  .text(function(d) { return d.displayName; })
                  .attr("font-size", "10px")
                  .attr("text-anchor", "middle");


              force.on("tick", function() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                circle_holds.attr("transform", function(d) { 
                    return 'translate(' + [d.x, d.y] + ')'; 
                  })
              });
        }

        function runVis2() {

            var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 320 - margin.left - margin.right,
                height = 320 - margin.top - margin.bottom;

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .5);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10);

            var svg = d3.select("#tasklist-container").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            
              x.domain(arrayHistObj.map(function(d) { return d.name; }));
              y.domain([0, d3.max(arrayHistObj, function(d) { return d.count; })]);

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);

              svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text("Frequency");

              svg.selectAll(".bar")
                  .data(arrayHistObj)
                .enter().append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d) { return x(d.name); })
                  .attr("width", x.rangeBand())
                  .attr("y", function(d) { return y(d.count); })
                  .attr("height", function(d) { return height - y(d.count); });

            

            function type(d) {
              d.count = +d.count;
              return d;
            }
        }
        


    };
});
