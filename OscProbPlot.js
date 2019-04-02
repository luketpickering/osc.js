class OscProbPlot {
  constructor() {
    this.Curves = [];
    this.tmp = undefined;
  }

  DrawAxes(el, xmin_GeV = 0, xmax_GeV = 10, ymin = 0, ymax = 1) {
    this.width = 600;
    this.height = 300;
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

  AddCurve(curve) {
    this.Curves.push(
        this.svg.append("path")
            .attr("d",
                  this.lineGen(curve.data)) // 11. Calls the line generator
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none"));
  };
  ClearAll() {
    for (let i = 0; i < this.Curves.length; ++i) {
      this.Curves[i].remove();
    }
    if (this.tmp != undefined) {
      this.tmp.remove();
    }
  }

  AddTmp(curve) {
    if (this.tmp != undefined) {
      this.tmp.remove();
    }
    this.tmp =
        this.svg.append("path")
            .attr("d",
                  this.lineGen(curve.data)) // 11. Calls the line generator
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("fill", "none");
  }
};
