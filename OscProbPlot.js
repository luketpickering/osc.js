class OscProbPlot {
  constructor() { this.Curves = []; }

  DrawAxes(el, xmin_GeV = 0, xmax_GeV = 10, ymin = 0, ymax = 1,
           ylabel = "\\(P_{\\textrm{osc.}}\\)") {
    this.width = 500;
    this.height = 400;
    this.margin = {top : 20, right : 20, bottom : 75, left : 95};
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

    this.svg.append("g")
        .attr("class", "x_axis biglabel")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(xScale).tickArguments([ 5 ]));

    RenderLatexLabel(
        this.svg.append("text").text("\\(E_{\\nu} \\textrm{(GeV)}\\)"),
        this.svg, "25ex", "10ex", this.width * 0.4, this.height * 0.72, 1.5,
        1.5);

    this.svg.append("g")
        .attr("class", "y_axis biglabel")
        .call(d3.axisLeft(yScale).tickArguments([ 3 ]));

    RenderLatexLabel(this.svg.append("text").text(ylabel), this.svg, "25ex",
                     "10ex", -100, -65, 1.5, 1.5, -90);
  }

  ScrubCurvePoints(curve) {
    let xScale = this.xScale;
    let width = this.width;
    curve.data = curve.data.filter((value, index, arr) => {
      let svg_coords = xScale(value[0]);
      return ((svg_coords > 0) && (svg_coords < width));
    });
  }

  GetLastCurveIndex() {
    if (this.Curves.length == 0) {
      return 0;
    } else {
      return this.Curves.length - 1;
    }
  }

  SetCurve(idx, curve) {
    this.ScrubCurvePoints(curve);

    if (this.Curves.length > idx) {
      this.RemoveCurve(idx);
    } else {
      this.Curves.length = idx + 1;
    }

    this.Curves[idx] =
        this.svg.append("path")
            .attr("d",
                  this.lineGen(curve.data)) // 11. Calls the line generator
            .attr("class", `osc_line ColorWheel-${idx + 1}`);
  };
  RemoveCurve(idx) {
    if (this.Curves.length > idx) {
      if (this.Curves[idx] != undefined) {
        this.Curves[idx].remove();
      }
    }
  }

  ClearAll() {
    for (let idx = 0; idx < this.Curves.length; ++idx) {
      if (this.Curves[idx] != undefined) {
        this.Curves[idx].remove();
      }
    }
  }
};
