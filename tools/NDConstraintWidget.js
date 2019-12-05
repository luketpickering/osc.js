"use strict";


class PlotPoint {
  constructor(x_namef, x_valuef, y_namef, y_valuef) {
    this.x_name = x_namef;
    this.x_value = x_valuef;
    this.y_name = y_namef;
    this.y_value = y_valuef;
  }
};

class ConstraintAxes {
  constructor(namef, titlef, minf, maxf, tickArgsf = [5], exp_scalef = 1,
    param_namef = undefined) {
    this.name = namef;
    this.title = titlef;
    this.min = minf * exp_scalef;
    this.max = maxf * exp_scalef;
    this.tickArgs = tickArgsf;
    this.exp_scale = exp_scalef;
    this.param_name = param_namef;
    if (this.param_name === undefined) {
      this.param_name = this.name;
    }
  }
};

class ConstraintWidget {

  constructor(xAxisf, yAxisf) {
    this.xAxis = xAxisf;
    this.yAxis = yAxisf;
  };

  AddNewParams(Params) {
    if (this.no_set_point) {
      return;
    }

    let point_class = "";
    if (Params.point_class != undefined) {
      point_class = Params.point_class;
    }

    if (this.last_OscParamPoint != undefined) {
      this.last_OscParamPoint.remove();
    }

    let x = Params[this.xAxis.param_name];
    let y = Params[this.yAxis.param_name];

    this.last_OscParamPoint =
      this.svg.append("circle")
        .attr("class", `cpoint ${point_class}`)
        .attr("pointer-events", "none")
        .attr("cx", this.xScale(x * this.xAxis.exp_scale))
        .attr("cy", this.yScale(y * this.yAxis.exp_scale))
        .attr("r", 3);
  }

  SetParams() { this.last_OscParamPoint = undefined; }

  ClearParams() { this.svg.selectAll(".cpoint").remove(); }

  Initialize(ele, onchanged_callback, on_hover_callback, off_hover_callback) {

    let width = 200;
    let height = 150;
    let margin = { top: 20, right: 20, bottom: 75, left: 90 };
    let tot_width = width + margin.left + margin.right;
    let tot_height = height + margin.top + margin.bottom;

    this.xScale = d3.scaleLinear()
      .domain([this.xAxis.min, this.xAxis.max]) // input
      .range([0, width]);                       // output
    let xScale = this.xScale;
    let xAxis = this.xAxis;
    this.yScale = d3.scaleLinear()
      .domain([this.yAxis.min, this.yAxis.max]) // input
      .range([height, 0]);                      // output
    let yScale = this.yScale;
    let yAxis = this.yAxis;
    this.lineGen =
      d3.line()
        .x(function (d) { return xScale(d[0] * xAxis.exp_scale); })
        .y(function (d) { return yScale(d[1] * yAxis.exp_scale); });
    // .curve(d3.curveNatural);

    this.svg = d3.select(ele)
      .append("svg")
      .attr("width", tot_width)
      .attr("height", tot_height)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    // x axis object
    this.svg.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(this.xScale).tickArguments(this.xAxis.tickArgs));

    // x axis title
    RenderLatexLabel(this.svg.append("text").text(this.xAxis.title), this.svg,
      "25ex", "10ex", width * 0.6, height * 1.2, 1, 1);

    // y axis object
    this.svg.append("g")
      .attr("class", "y_axis")
      .call(d3.axisLeft(this.yScale).tickArguments(this.yAxis.tickArgs));

    // y axis title
    RenderLatexLabel(this.svg.append("text").text(this.yAxis.title), this.svg,
      "25ex", "10ex", -120, -80, 1, 1, -90);

    let xAxis_name = this.xAxis.param_name;
    let yAxis_name = this.yAxis.param_name;

    function clickHandler(owner) {
      // Get x/y in axes coords
      let coords = d3.mouse(owner);
      let xaxcoords = xScale.invert(coords[0]) / xAxis.exp_scale;
      let yaxcoords = yScale.invert(coords[1]) / yAxis.exp_scale;

      let params = new PlotPoint(xAxis_name, xaxcoords, yAxis_name, yaxcoords);

      onchanged_callback(params);
    };

    function hoverHandler() {
      // Get x/y in axes coords
      let coords = d3.mouse(this);
      let xaxcoords = xScale.invert(coords[0]) / xAxis.exp_scale;
      let yaxcoords = yScale.invert(coords[1]) / yAxis.exp_scale;

      let params = new PlotPoint(xAxis_name, xaxcoords, yAxis_name, yaxcoords);

      on_hover_callback(params);
    };

    let plot = this;
    this.no_set_point = false;

    MathJax.Hub.Queue([function () {
      let rect = plot.svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height);

      function mouseDownHandler() {
        plot.no_set_point = true;
        rect.on("mousemove", hoverHandler);
      };

      function mouseUpHandler() {
        plot.no_set_point = false;
        clickHandler(this);
        rect.on("mousemove", null);
        off_hover_callback();
      };

      rect.on("mousedown", mouseDownHandler).on("mouseup", mouseUpHandler);
    }]);
  };

  // Callback for setting new values
};

var constraint_plots = [];

function InitializeNDConstraintWidgets(el, onchanged_callback, on_hover_callback,
  off_hover_callback) {

  let ax_ND280 = new ConstraintAxes("ND280", "\\(\\textrm{ND280}\\)", -1,1, [3], 1, "ND280");

  let ax_WAGASCI = new ConstraintAxes("WAGASCI", "\\(\\textrm{WAGASCI}\\)", -1, 1, [3], 1, "WAGASCI");

  let ax_INGRID = new ConstraintAxes("INGRID", "\\(\\textrm{INGRID}\\)", -1, 1, [3], 1, "INGRID");

  constraint_plots.push(new ConstraintWidget(
    ax_ND280, ax_WAGASCI));
  constraint_plots.push(new ConstraintWidget(
    ax_WAGASCI, ax_INGRID));

  for (let plot_i = 0; plot_i < constraint_plots.length; ++plot_i) {
    constraint_plots[plot_i].Initialize(el, function (pp) {
      let op = onchanged_callback(pp);
      for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
        constraint_plots[plot_j].AddNewParams(op);
      }
    }, on_hover_callback, off_hover_callback);
  }
}

function ClearConstrainWidgetPoints() {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].ClearParams();
  }
}

function SetConstrainWidgetPoints() {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].SetParams();
  }
}

function AddNewConstrainWidgetPoints(params) {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].SetParams();
  }
}
