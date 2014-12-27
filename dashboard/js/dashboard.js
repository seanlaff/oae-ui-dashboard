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

        //Different URLs to hit the restful API
        var url1 = '/api/following/' + widgetData.context.id + '/following';
        var url2 = '/api/user/' + widgetData.context.id + '/memberships';
        var url3 = '/api/content/library/' + widgetData.context.id;
        var url4 = '/api/discussion/library/' + widgetData.context.id;
        var url5 = '/api/me';
        var url6 = '/api/following/' + widgetData.context.id + '/followers';

        // The widget container
        var $rootel = $('#' + uid);

        //CODE FOR FOLLOWING NETWORK GRAPH VISUALIZATION

        //List of who the user is following
        var arrayFollowing;

        //Object that will contain all the links and nodes for the network vis
        function networkHolderObj() {
            this.nodes = [];
            this.links = [];
        }

        //Link object for the newtork vis
        function linkObj() {
            this.s; //source
            this.t; //target
            this.v; //value
        }

        //Object for the current user to displayed in the middle of the network vis
        function meObj() {
            this.displayName = "Me";
        }

        //Create an object to hold all of the data we need for the network graph vis
        var networkData = new networkHolderObj();
        var graph;

        //Load in the list of users the current user is following
        $.getJSON(url1, function(result) { 
            arrayFollowing = result.results;
            for(i = 0; i < arrayFollowing.length; i++) {
                networkData.nodes.push(arrayFollowing[i]);
            }
            graph = networkData;
            loadMe(); //after followers have been loaded in, load the current user
        });

        //Add the current user to the network graph and draw connections between the current
        //user and all the other users that are being followed
        function loadMe() {
          $.getJSON(url5, function(result) {
            networkData.nodes.push(result);
            var len = networkData.nodes.length;
            for(j = 0; j < len - 1; j++) {
                var tempLink = new linkObj();
                tempLink.source = j;
                tempLink.target = len - 1;
                tempLink.value = 1;
                networkData.links.push(tempLink);
            }
            runNetworkVis(); //after network data is ready, run the visualization
          });
        }


        //CODE FOR HISTOGRAM VISUALIZATION

        var numGroups; //# of groups current user is a member of 
        var numFiles; //# of files current user has uploaded
        var numDiscussions; //# of dicussions current user has created

        //Object for each entry in the histogram vis
        function histoObj() {
            this.count;
            this.name;
        }

        //List of all the objects in the histogram visualization
        var arrayHistObj = [];

        //Tracks which api calls have executed successfully
        var apiCallChecker = {
          'groups': false,
          'files': false,
          'following': false,
          'followers': false,
          'dicussions': false
        };

        getGroups();
        getFiles();
        getFollowing();
        getFollowers();
        getDiscussions();

        function checkAndRun() {
          for(k in apiCallChecker) {
            if(apiCallChecker[k] == false) {
              console.log(k);
              return;
            }
          }
          runHistogramVis();
        }

        function getGroups() {
            $.getJSON(url2, function(result) {
                numGroups = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Groups";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                apiCallChecker.groups = true;
                checkAndRun();
            });
        }

        function getFiles() {
            $.getJSON(url3, function(result) {
                numFiles = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Files";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                apiCallChecker.files = true;
                checkAndRun();
            });
        }

        function getFollowing() {
            $.getJSON(url1, function(result) {
                numFiles = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Following";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                apiCallChecker.following = true;
                checkAndRun();
            });
        }

        function getFollowers() {
            $.getJSON(url6, function(result) {
                numFiles = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Followers";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                apiCallChecker.followers = true;
                checkAndRun();
            });
        }

        function getDiscussions() {
            $.getJSON(url4, function(result) {
                numDiscussions = result.results.length;
                var tmp = new histoObj();
                tmp.name = "Discussions";
                tmp.count = result.results.length;
                arrayHistObj.push(tmp);
                apiCallChecker.dicussions = true;
                checkAndRun();
            });
        }


        


        function runNetworkVis() {

            var width = 350,
                height = 350;

            var color = d3.scale.category10();

            var force = d3.layout.force()
                .charge(-320)
                .linkDistance(100)
                .size([width, height]);

            var svg = d3.select("#followingbox").append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("display", "block")
                .style("margin", "0 auto");

            
            force
                  .nodes(graph.nodes)
                  .links(graph.links)
                  .start();

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
                  .attr("r", 20)
                  .style("fill", function(d) { return color(Math.floor((Math.random() * 10) + 1)); });

              circle_holds.append("svg:image")
                  .attr("xlink:href", function(d) { return d.picture.small;})
                  .attr("width", 32)
                  .attr("height", 32)
                  .attr("x", -16)
                  .attr("y", -16)
                  .attr("clip-path", "url(#myClip)");

              circle_holds.append("rect");

              circle_holds.append("text")
                  .text(function(d) { return d.displayName; })
                  .attr("font-size", "10px")
                  .attr("text-anchor", "middle")
                  .attr("color", "#333333")
                  .attr("dy", "-30px");

              circle_holds.each( function(d) {
                //var bb = this.text.getBBox();
                var curText = d3.select(this).select('text');
                var curTextBB = curText.node().getBBox();
                var curRect = d3.select(this).select('rect');
                curRect.attr("x", curTextBB.x - 5)
                  .attr("y", curTextBB.y - 3)
                  .attr("width", curTextBB.width + 10)
                  .attr("height", curTextBB.height + 6)
                  .attr("rx", "3px")
                  .attr("ry", "3px")                  
                  .style("fill", "#f5f5f5")
                  .style("stroke", "#dddddd")
                  .style("stroke-width", "1px");
              })


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

        function runHistogramVis() {

            var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 350 - margin.left - margin.right,
                height = 350 - margin.top - margin.bottom;

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

            var svg = d3.select("#actbox").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("display", "block")
                .style("margin", "0 auto")
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
