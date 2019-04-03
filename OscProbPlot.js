class OscProbPlot {
  constructor() {
    this.Curves = [];
    this.next = undefined;
    this.hvr = undefined;
  }

  DrawAxes(el, xmin_GeV = 0, xmax_GeV = 10, ymin = 0, ymax = 1) {
    this.width = 500;
    this.height = 400;
    this.margin = {top : 20, right : 20, bottom : 75, left : 90};
    this.tot_width = this.width + this.margin.left + this.margin.right;
    this.tot_height = this.height + this.margin.top + this.margin.bottom;

    let xScale = d3.scaleLinear()
                     .domain([ xmin_GeV, xmax_GeV ]) // input
                     .range([ 0, this.width ]);      // output
    this.xScale = xScale;

    let yScale = d3.scaleLinear()
                     .domain([ ymin, ymax ])     // input
                     .range([ this.height, 0 ]); // output
    this.yScale = yScale;

    this.lineGen = d3.line()
                       .x(function(d) { return xScale(d[0]); })
                       .y(function(d) { return yScale(d[1]); });

    this.svg = d3.select(el)
                   .append("svg")
                   .attr("width", this.tot_width)
                   .attr("height", this.tot_height)
                   .append("g")
                   .attr("transform", "translate(" + this.margin.left + "," +
                                          this.margin.top + ")");

    this.xaxis = this.svg.append("g")
                     .attr("class", "x axis")
                     .attr("transform", "translate(0," + this.height + ")")
                     .call(d3.axisBottom(xScale).tickArguments([ 5 ]));

    this.xtitle = this.svg.append("text")
                      .attr("class", "label")
                      .attr("x", this.width * 0.8)
                      .attr("y", this.tot_height * 0.9)
                      .style("text-anchor", "middle")
                      .text("$E_{\\nu} \\textrm{(GeV)}$");

    this.yaxis = this.svg.append("g")
                     .attr("class", "y axis")
                     .call(d3.axisLeft(yScale).tickArguments([ 5 ]));

    this.ytitle = this.svg.append("text")
                      .attr("class", "label")
                      .attr("y", this.width * -0.1)
                      .attr("x", this.height * -0.25)
                      .attr("transform", "rotate(-90)")
                      .style("text-anchor", "middle")
                      .text("$P_{\\textrm{osc.}}$");
  }

  ScrubCurve(curve) {
    let xScale = this.xScale;
    let width = this.width;
    curve.data = curve.data.filter((value, index, arr) => {
      let svg_coords = xScale(value[0]);
      return ((svg_coords > 0) && (svg_coords < width));
    });
  }

  AddCurve(curve, tool_tip_html) {
    this.ScrubCurve(curve);
    let tooltip = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);
    tooltip.html(tool_tip_html);
    MathJax.Hub.Queue([ "Typeset", MathJax.Hub, tooltip.node() ]);

    this.Curves.push({
      path : this.svg.append("path")
                 .attr("d",
                       this.lineGen(curve.data)) // 11. Calls the line generator
                 .attr("class", "osc_line")
                 .on("mouseover",
                     function() {
                       console.log("over");
                       tooltip.transition().duration(200).style("opacity", .9);
                       tooltip.style("left", (d3.event.pageX) + "px")
                           .style("top", (d3.event.pageY - 28) + "px");
                     })
                 .on("mouseout",
                     function() {
                       tooltip.transition().duration(500).style("opacity", 0);
                     }),
      tooltip : tooltip
    });
  };

  RemoveNext() {
    if (this.next != undefined) {
      this.next.path.remove();
      this.next.tooltip.remove();
      this.next = undefined;
    }
  }
  ClearAll() {
    for (let i = 0; i < this.Curves.length; ++i) {
      this.Curves[i].path.remove();
      this.Curves[i].tooltip.remove();
    }
    this.Curves = [];
    this.RemoveNext();
  }

  ShowNext(curve, tool_tip_html) {
    this.ScrubCurve(curve);
    this.RemoveNext();
    let tooltip = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);
    tooltip.html(tool_tip_html);
    MathJax.Hub.Queue([ "Typeset", MathJax.Hub, tooltip.node() ]);

    this.next = {
      path : this.svg.append("path")
                 .attr("d",
                       this.lineGen(curve.data)) // 11. Calls the line generator
                 .attr("class", "osc_line osc_next")
                 .on("mouseover",
                     function() {
                       tooltip.transition().duration(200).style("opacity", .9);
                       tooltip.style("left", (d3.event.pageX) + "px")
                           .style("top", (d3.event.pageY - 28) + "px");
                     })
                 .on("mouseout",
                     function() {
                       tooltip.transition().duration(500).style("opacity", 0);
                     }),
      tooltip : tooltip
    };
  }
  AddHover(curve) {
    this.ScrubCurve(curve);
    if (this.hvr != undefined) {
      this.hvr.remove();
    }
    this.hvr =
        this.svg.append("path")
            .attr("d",
                  this.lineGen(curve.data)) // 11. Calls the line generator
            .attr("class", "osc_line osc_hover");
  }
  RemoveHover() {
    if (this.hvr != undefined) {
      this.hvr.remove();
    }
  }
};
