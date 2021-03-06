// global vars
var $graphic = null;

var GRAPHIC_DATA_URL = 'live-data/current.csv';
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 540;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var colorD3 = d3.scale.ordinal()
    .range([ colors['orange3'], colors['orange4'], colors['orange5'], colors['blue5'], colors['blue4'], colors['blue3'], '#ccc' ]);

var graphicData = null;
var currentData = null;
var isMobile = false;
var currentPrice;

// D3 formatters
var fmtComma = d3.format(',');
var fmtYearAbbrev = d3.time.format('%y');
var fmtYearFull = d3.time.format('%m/%d/%y');
var fmtTime = d3.time.format('%I:%M%p')


/*
 * INITIALIZE
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        d3.json("live-data/price-final.json", function(error, json) {
            if (error) return console.warn(error);
            // data = json;
            graphicData = d3.entries(json);
          
            graphicData.forEach(function(d) {
                d['key'] = d3.time.format('%Y-%m-%d').parse(d['key']);
            });
          
            graphicData.sort(sortTheseKeys);
        
            d3.csv(GRAPHIC_DATA_URL, function(error, data) {
                currentData = data;
                currentData.forEach(function(d) {
                    d['date'] = d3.time.format('%Y-%m-%d').parse(d['date']);
                    d['time'] = d3.time.format('%H:%M:%S').parse(d['time']);
                    d['price'] = +d['price']
                });

                render();

                $(window).on("resize", _.throttle(render, 250));
            });
        });
    }
}

/*
 * RENDER THE GRAPHIC
 */
var render = function() {
    var containerWidth = $(window).width();

    // check the container width; set mobile flag if applicable
    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }


    // clear out existing graphics
    $graphic.empty();



currentPrice = currentData[0]['price']
currentDate = currentData[0]['date']
currentTime = currentData[0]['time']


var deltaLevel = (199.91-currentPrice)*2
var deltaPercent = Math.abs(d3.round(100*((199.91-currentPrice)/199.91),2)) + "%"

    $('.reply-title').text("NO").css('color', '#d30015');
    $('.reply-paren').html("We lost $22.06 (or 6%). </br> </br>But if you include fees, we lost grand total of $42.02 (or 11%) on our investment.").css('color', '#d30015') ;

// if (currentPrice > 199.91) {
    // $('.reply-title').text("NO").css('color', '#d30015');
//     $('.reply-paren').html("If we cashed out now, we would lose <em class = 'negative'>$" + d3.round(Math.abs(deltaLevel),2) + " (" + deltaPercent + ") </em> on our short.*");
//     }

// if (currentPrice < 199.91) {
//     $('.reply-title').text("YES").css('color', '#17807E' );
//     $('.reply-paren').html("If we cashed out now, we would make <em class = 'positive'>$" + d3.round(Math.abs(deltaLevel),2) + " (" + deltaPercent + ") </em> on our short.*");
//     }

// if (currentPrice == 199.91) {
//     $('.reply-title').html("NOT Really, We're even").css('color', '#EFC637');
//     }
// neeed to put in block



    // draw the new graphic
    // (this is a separate function in case I want to be able to draw multiple charts later.)
    drawGraph(containerWidth);
}


/*
 * DRAW THE GRAPH
 */
var drawGraph = function(graphicWidth) {
    var aspectHeight;
    var aspectWidth;
    var color = d3.scale.ordinal()
        .range([ colors['red3'], colors['yellow3'], colors['blue3'], colors['orange3'], colors['teal3'] ]);
    var graph = d3.select('#graphic');
    var margin = {
        top: 5,
        right: 30,
        bottom: 30,
        left: 50
    };
    var ticksX;
    var ticksY;

    // params that depend on the container width
    if (isMobile) {
        aspectWidth = 4;
        aspectHeight = 3;
        ticksX = 3;
        ticksY = 5;
        fontSize = '14px';
    } else {
        margin = {
            top: 5,
            right: 150,
            bottom: 30,
            left: 160
        };
        aspectWidth = 16;
        aspectHeight = 9;
        ticksX = 6;
        ticksY = 10;
        fontSize = '18px'
    }

    // define chart dimensions
    var width = graphicWidth - margin['left'] - margin['right'];
    var height = Math.ceil((graphicWidth * aspectHeight) / aspectWidth) - margin['top'] - margin['bottom'];

    var x = d3.time.scale()
        .range([ 0, width ])

    var y = d3.scale.linear()
        .range([ height, 0 ]);


    // parse data into columns
    var formattedData = {}
    formattedData['SPY'] = graphicData.map(function(d) {
            return { 'date': d['key'], 'amt': +d['value']['Close'] };
// filter out empty data. uncomment this if you have inconsistent data.
//        }).filter(function(d) {
//            return d['amt'].length > 0;
        });

    var dateFormat = d3.time.format("%Y-%m-%d"),
        lastDate1 = dateFormat.parse("2015-03-03"),
        firstDate1 = dateFormat.parse("2015-01-15");


    // set the data domain
    x.domain([firstDate1,lastDate1]);



    var minValue = d3.min(d3.entries(formattedData), function(c) { 
            return d3.min(c['value'], function(v) { 
                var n = v['amt'];
                return Math.floor(n/10) * 10; 
            }); 
        });
    var maxValue = d3.max(d3.entries(formattedData), function(c) { 
            return d3.max(c['value'], function(v) { 
                var n = v['amt'];
                return Math.ceil(n/10) * 10; // round to next 10
            }); 
        });

    y.domain([ minValue, maxValue]);

    // define axis and grid
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d,i) {

                return fmtYearFull(d);
        });

    var xAxisGrid = function() {
        return xAxis;
    }

    var yAxis = d3.svg.axis()
        .orient('left')
        .scale(y)
        .ticks(ticksY)
        .tickFormat(function(d,i) {
                return '$' + d;
        });        

    var yAxisGrid = function() {
        return yAxis;
    }

    var area = d3.svg.area()
                .x(function(d) { return x(d['date']); })
                .y0(y(200))
                .y1(function(d) { 
                    return y(d['amt']); 
                });

    // define the line(s)
    var line = d3.svg.line()
        .interpolate('linear')
        .x(function(d) {
            return x(d['date']);
        })
        .y(function(d) {
            return y(d['amt']);
        });

var dateLength = formattedData['SPY'].length
var lastValue = formattedData['SPY'][0]
var firstValue = formattedData['SPY'][dateLength-1]
formattedData['SPY'][dateLength-1]['amt'] = 199.91
var svgWidth =  width + margin['left'] + margin['right']
    // draw the chart
    var svg = graph.append('svg')
        .attr('width', svgWidth)
        .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
            .attr('transform', 'translate(' + margin['left'] + ',' + margin['top'] + ')');


      svg.append("linearGradient")
      .attr("id", "stock-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(200.31))
      .attr("x2", 0).attr("y2", y(199.91))
    .selectAll("stop")
      .data([
        {offset: "0%", color: '#d30015'},
        {offset: "50%", color: colors['yellow5']},
        {offset: "100%", color: '#17807E'}
      ])
    .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    svg.append('g')
        .attr('class', 'hline')
        .append('line')
        .attr('x1', x(lastValue['date']))
        .attr('x2', x(firstValue['date']))
        .attr('y1', y(199.91))
        .attr('y2', y(199.91));

            
    // x-axis (bottom)
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // y-axis (left)
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    
    // x-axis gridlines
    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxisGrid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );
    
    // y-axis gridlines
    svg.append('g')         
        .attr('class', 'y grid')
        .call(yAxisGrid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );

    // draw the line(s)
    svg.append('g')
        .attr('class', 'lines')
        .selectAll('path')
        .data(d3.entries(formattedData))
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line line-' + i + ' ' + classify(d['key']);
            })
            .attr('d', function(d) {
                return line(d['value']);
            });  

    var rectHeight =   y(minValue) - y(199.91)
    var rectHeightHalf =  y(199.91)

    var badUsRect = svg.append('g')
        .attr('class', 'bad-us-rect')
        .append('rect')
        .attr('x', 0)
        .attr('width', width)
        .attr('y', 0)
        .attr('height', rectHeightHalf-3)
        .style('fill', colors['red6'])
        .style('opacity',.5)

    var goodUsRect = svg.append('g')
        .attr('class', 'good-us-rect')
        .append('rect')
        .attr('x', 0)
        .attr('width', width)
        .attr('y', rectHeightHalf)
        .attr('height', rectHeight)        
        .style('fill', colors['teal5'])
        .style('opacity',.3)

    var area = svg.append('g')
        .attr('class', 'area')
        .selectAll('path')
        .data(d3.entries(formattedData))
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'area area-' + i + ' ' + classify(d['key']);
            })
            .attr('d', function(d) {
                return area(d['value'])
            })
        .style('fill', colors['blue3']);    

    svg.append('g')
        .attr('class', 'lastvalue')
        .append('circle')
        .attr('cx', x(lastValue['date']))
        .attr('cy', y(lastValue['amt']))
        .attr('r', 6);

    
    svg.append('g')
        .attr('class', 'lastvalue')
        .append('circle')
        .attr('cx', x(firstValue['date']))
        .attr('cy', y(firstValue['amt']))
        .attr('r', 6);

    var annotation = svg.append('g')
        .attr('class', 'good-us')
        .append('text')
        .attr('x', (width)/2)
        .attr('y', y(192))
        .attr('text-anchor', 'middle')
        .attr('font-size', fontSize)                     
        .text('Good For Us')

    var badUs = svg.append('g')
        .attr('class', 'bad-us')
        .append('text')
        .attr('x', (width)/2)
        .attr('y', y(208))
        .attr('text-anchor', 'middle')
        .attr('font-size', fontSize)        
        .text('Bad For Us')

    var goodUs = svg.append('g')
        .attr('class', 'label current-price')
        .append('text')
        .attr('x', x(lastValue['date']))
        .attr('y', y(lastValue['amt']))
        .attr('dx', 0)
        .attr('dy', 15)
        .attr('text-anchor', 'end')        
        .text('Last Price $' + lastValue['amt'] )          

        svg.append('g')
        .attr('class', 'label current-date')
        .append('text')
        .attr('x', x(lastValue['date']))
        .attr('y', y(lastValue['amt']))
        .attr('dx', 0)
        .attr('dy', 28)
        .attr('text-anchor', 'end')
        .text("Last Date: " + fmtYearFull(lastValue['date'] ))          

        svg.append('g')
        .attr('class', 'label current-price')
        .append('text')
        .attr('x', x(firstValue['date']))
        .attr('y', y(firstValue['amt']))
        .attr('dx', 0)
        .attr('dy', 15)
        .attr('text-anchor', 'start')   
        .text('Buy Price $' + firstValue['amt'] )          

        svg.append('g')
        .attr('class', 'label current-date')
        .append('text')
        .attr('x', x(firstValue['date']))
        .attr('y', y(firstValue['amt']))
        .attr('dx', 0)
        .attr('dy', 28)
        .attr('text-anchor', 'start')
        .text("Buy Date: " + fmtYearFull(firstValue['date'] ))        

var firstPrice = firstValue['amt']
var dailyChange = currentPrice - firstPrice 
var dailyPct = ((100*(currentPrice - firstPrice)/firstPrice))

// if (dailyChange > 0) {
//     $('.reply-deck').html("Right now, <em class = 'positive'>the stock market is up</em> since we shorted it. </br>That's good for most people, but bad for us.");
// }

// if (dailyChange < 0) {
//     $('.reply-deck').html("Right now, <em class = 'negative'>the stock market is down</em> since we shorted it. </br>That's bad for most people, but good for us.");
// }

}


/*
 * HELPER FUNCTIONS
 */
var classify = function(str) { // clean up strings to use as CSS classes
    return str.replace(/\s+/g, '-').toLowerCase();
}
var sortTheseKeys = function(a,b) {
    if (a['key'] > b['key']) {
        return -1;
    }
    if (a['key'] < b['key']) {
        return 1;
    }
    return 0;
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(onWindowLoaded);