"use strict";

class OPContour {
  constructor(namef, xpointsf, ypointsf, lineclassf, tool_tip_htmlf) {
    this.name = namef;
    this.x = xpointsf;
    this.y = ypointsf;
    this.lineclass = lineclassf;
    this.tool_tip_html = tool_tip_htmlf;
  }

  GetPointList() {
    let data = [];
    for (let sit = 0; sit < this.x.length; sit++) {
      data[sit] = [];
      for (let dit = 0; dit < this.x[sit].length; dit++) {
        data[sit].push([ this.x[sit][dit], this.y[sit][dit] ]);
      }
    }
    return data;
  }
};

class OscProbConstraints {
  constructor() { this.Constraints = {}; }

  AddConstraint(namef, xaxf, yaxf, xpointsf, ypointsf,
                lineclass = "constraint_line", tool_tip_html = undefined) {
    if (!OscProbConstraints.IsValidAxis(xaxf)) {
      console.log(`Failed to add constraint with invalid axis name: ${xaxf}`);
      return;
    }
    if (!(xaxf in this.Constraints)) {
      this.Constraints[xaxf] = {};
    }
    if (!OscProbConstraints.IsValidAxis(yaxf)) {
      console.log(`Failed to add constraint with invalid axis name: ${yaxf}`);
      return;
    }
    if (!(yaxf in this.Constraints[xaxf])) {
      this.Constraints[xaxf][yaxf] = [];
    }
    this.Constraints[xaxf][yaxf].push(
        new OPContour(namef, xpointsf, ypointsf, lineclass, tool_tip_html));
  }

  static IsValidAxis(axname) {
    if (axname === "Dm2_Atm") {
      return true;
    } else if (axname === "Dm2_Sol") {
      return true;
    } else if (axname === "S2Th23") {
      return true;
    } else if (axname === "S2Th13") {
      return true;
    } else if (axname === "S2Th12") {
      return true;
    } else if (axname === "dcp") {
      return true;
    }
    return false;
  }

  GetConstraintData() {
    let data = {};
    Object.keys(this.Constraints).forEach(function(key_x) {
      Object.keys(this.Constraints[key_x]).forEach(function(key_y) {
        let constraints = this.Constraints[key_x][key_y];
        let plotn = [ key_x + "_" + key_y ].join("");
        if (!(plotn in data)) {
          data[plotn] = [];
        }

        for (let cit = 0; cit < constraints.length; ++cit) {
          data[plotn].push({
            meta : {
              id : cit,
              name : constraints[cit].name,
              tool_tip_html : constraints[cit].tool_tip_html,
              lineclass : constraints[cit].lineclass
            },
            data : constraints[cit].GetPointList()
          });
        }
      }, this);
    }, this);
    return data;
  }
};

class ConstraintAxes {
  constructor(namef, titlef, minf, maxf, tickArgsf = [ 5 ], exp_scalef = 1,
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

  constructor(ConstraintDataf, xAxisf, yAxisf) {
    this.ConstraintData = ConstraintDataf;
    this.xAxis = xAxisf;
    this.yAxis = yAxisf;

    this.osc_param_list = [];
    this.svg_points = [];
    this.current_index = 0;
  };

  SetOscParams(i, oscParams) {

    if (this.osc_param_list.length > i) {
      this.ClearOscParam(i);
      // this.current_index = i;
    } else {
      this.osc_param_list.length = (i + 1);
      this.svg_points.length = (i + 1);
    }

    let x_scaled = oscParams.Get(this.xAxis.param_name) * this.xAxis.exp_scale;
    let y_scaled = oscParams.Get(this.yAxis.param_name) * this.yAxis.exp_scale;

    this.osc_param_list[i] = oscParams;

    if ((x_scaled >= this.xAxis.min) && (x_scaled <= this.xAxis.max) &&
        (y_scaled >= this.yAxis.min) && (y_scaled <= this.yAxis.max)) {
      this.svg_points[i] = this.svg.append("circle")
                               .attr("class", `cpoint ColorWheel-${i + 1}`)
                               .attr("pointer-events", "none")
                               .attr("cx", this.xScale(x_scaled))
                               .attr("cy", this.yScale(y_scaled))
                               .attr("r", 3)
                               .attr("data-index", i);
    } else {
      this.svg_points[i] = undefined;
    }
  }

  GetOscParams(i) {
    if ((this.osc_param_list.length == 0) ||
        (this.osc_param_list.length <= i)) {
      this.osc_param_list.length = i + 1;
      this.osc_param_list[i] = new OscParams();
    }

    if (this.osc_param_list[i] === undefined) {
      console.log(`WARN: Getting plot oscillation parameter from list (index: ${
          i}), but it was never set.`);
      this.osc_param_list[i] = new OscParams();
    }

    return this.osc_param_list[i];
  }

  GetAllSeries() {
    let rtn = {};
    for (var i = 0; i < this.osc_param_list.length; ++i) {
      if (this.osc_param_list[i] !== undefined) {
        rtn[i] = this.osc_param_list[i].Copy();
      }
    }
    return rtn;
  }

  ClearOscParam(i) {
    if ((this.svg_points.length > i) && (this.svg_points[i] !== undefined)) {
      this.svg_points[i].remove();
    }
    this.osc_param_list[i] = undefined;
    this.current_index = i;
  }

  ClearOscParams() {
    this.svg.selectAll(".cpoint").remove();
    this.svg_points = [];
    this.osc_param_list = [];
    this.current_index = 0;
  }

  IncrementIndex() {
    for (var i = 0; i < this.osc_param_list.length; ++i) {
      if (this.osc_param_list[i] === undefined) {
        this.current_index = i;
        return this.current_index;
      }
    }

    // If we don't have a space
    this.current_index = this.osc_param_list.length;
    this.osc_param_list.length = this.osc_param_list.length + 1;
    return this.current_index;
  }

  SetIndex(idx) {
    if (this.osc_param_list.length <= idx) {
      this.osc_param_list.length = (idx + 1);
      this.svg_points.length = (idx + 1);
    }
    this.current_index = idx;
  }

  Initialize(ele, onchanged_callback) {

    let width = 200;
    let height = 150;
    let margin = {top : 20, right : 20, bottom : 60, left : 90};
    let tot_width = width + margin.left + margin.right;
    let tot_height = height + margin.top + margin.bottom;

    this.xScale = d3.scaleLinear()
                      .domain([ this.xAxis.min, this.xAxis.max ]) // input
                      .range([ 0, width ]);                       // output
    let xScale = this.xScale;
    let xAxis = this.xAxis;
    this.yScale = d3.scaleLinear()
                      .domain([ this.yAxis.min, this.yAxis.max ]) // input
                      .range([ height, 0 ]);                      // output
    let yScale = this.yScale;
    let yAxis = this.yAxis;
    this.lineGen =
        d3.line()
            .x(function(d) { return xScale(d[0] * xAxis.exp_scale); })
            .y(function(d) { return yScale(d[1] * yAxis.exp_scale); });
    // .curve(d3.curveNatural);

    let divele = d3.select(ele).append("div").classed(
        "col-lg-4 col-md-6 col-auto mx-auto", true);

    // everything is a child of the group that includes the offset
    this.svg = divele.append("svg")
                   .attr("width", tot_width)
                   .attr("height", tot_height)
                   .classed("border rounded", true)
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

    let plot = this;

    function clickHandler(owner) {
      // Get x/y in axes coords
      let coords = d3.mouse(owner);
      let xaxcoords = xScale.invert(coords[0]) / xAxis.exp_scale;
      let yaxcoords = yScale.invert(coords[1]) / yAxis.exp_scale;

      let oscpars = plot.GetOscParams(plot.current_index);
      oscpars = oscpars.Copy();

      oscpars.Set(xAxis_name, xaxcoords);
      oscpars.Set(yAxis_name, yaxcoords);

      onchanged_callback(plot.current_index, oscpars);
    };

    MathJax.Hub.Queue([ function() {
      let rect = plot.svg.append("rect")
                     .attr("class", "overlay")
                     .attr("width", width)
                     .attr("height", height);

      function mouseUpHandler() { clickHandler(this); };

      rect.on("mouseup", mouseUpHandler);

      let tooltip = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

      if (plot.ConstraintData !== undefined) {
        for (let ci = 0; ci < plot.ConstraintData.length; ++ci) {
          for (let pi = 0; pi < plot.ConstraintData[ci].data.length; ++pi) {
            let tool_tip_html = plot.ConstraintData[ci].meta.tool_tip_html;
            let path =
                plot.svg.append("path")
                    .attr(
                        "d",
                        plot.lineGen(
                            plot.ConstraintData[ci].data[pi])) // 11. Calls the
                    // line generator
                    .attr("class", plot.ConstraintData[ci].meta.lineclass)
                    .on("mouseup", mouseUpHandler);
            if (tool_tip_html != undefined) {
              path.on("mouseover", function() {
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .html(tool_tip_html);
                  }).on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
              });
            }
          }
        }
      }
    } ]);
  };

  // Callback for setting new values
};

function GetConstraintData() {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'data/osc_constraint_contours.js', false);
  xobj.send(null);

  let OscProbConstraintData = JSON.parse(xobj.responseText);

  let ConstraintData = new OscProbConstraints();
  ConstraintData.AddConstraint(
      "T2K2018_68", "S2Th23", "Dm2_Atm",
      OscProbConstraintData.T2K2018.S2Th23_Dm2_Atm[68].S2Th23,
      OscProbConstraintData.T2K2018.S2Th23_Dm2_Atm[68].Dm2_Atm,
      "constraint_line constraint_inner T2KConstraint",
      `<div>Expt: ${OscProbConstraintData.T2K2018.Expt}</div><div>Year: ${
          OscProbConstraintData.T2K2018.Year}</div><div>Ref: ${
          OscProbConstraintData.T2K2018.Ref}</div>`);
  ConstraintData.AddConstraint(
      "T2K2018_90", "S2Th23", "Dm2_Atm",
      OscProbConstraintData.T2K2018.S2Th23_Dm2_Atm[90].S2Th23,
      OscProbConstraintData.T2K2018.S2Th23_Dm2_Atm[90].Dm2_Atm,
      "constraint_line constraint_outer T2KConstraint",
      `<div>Expt: ${OscProbConstraintData.T2K2018.Expt}</div><div>Year: ${
          OscProbConstraintData.T2K2018.Year}</div><div>Ref: ${
          OscProbConstraintData.T2K2018.Ref}</div>`);

  ConstraintData.AddConstraint(
      "T2K2018_68", "S2Th13", "dcp",
      OscProbConstraintData.T2K2018.S2Th13_dcp[68].S2Th13,
      OscProbConstraintData.T2K2018.S2Th13_dcp[68].dcp,
      "constraint_line constraint_inner T2KConstraint",
      `<div>Expt: ${OscProbConstraintData.T2K2018.Expt}</div><div>Year: ${
          OscProbConstraintData.T2K2018.Year}</div><div>Ref: ${
          OscProbConstraintData.T2K2018.Ref}</div>`);
  ConstraintData.AddConstraint(
      "T2K2018_90", "S2Th13", "dcp",
      OscProbConstraintData.T2K2018.S2Th13_dcp[90].S2Th13,
      OscProbConstraintData.T2K2018.S2Th13_dcp[90].dcp,
      "constraint_line constraint_outer T2KConstraint",
      `<div>Expt: ${OscProbConstraintData.T2K2018.Expt}</div><div>Year: ${
          OscProbConstraintData.T2K2018.Year}</div><div>Ref: ${
          OscProbConstraintData.T2K2018.Ref}</div>`);

  ConstraintData.AddConstraint(
      "NOvA2018_68", "S2Th23", "Dm2_Atm",
      OscProbConstraintData.NOvA2018.S2Th23_Dm2_Atm[68].S2Th23,
      OscProbConstraintData.NOvA2018.S2Th23_Dm2_Atm[68].Dm2_Atm,
      "constraint_line constraint_inner NOvAConstraint",
      `<div>Expt: ${OscProbConstraintData.NOvA2018.Expt}</div><div>Year: ${
          OscProbConstraintData.NOvA2018.Year}</div><div>Ref: ${
          OscProbConstraintData.NOvA2018.Ref}</div>`);
  ConstraintData.AddConstraint(
      "NOvA2018_90", "S2Th23", "Dm2_Atm",
      OscProbConstraintData.NOvA2018.S2Th23_Dm2_Atm[90].S2Th23,
      OscProbConstraintData.NOvA2018.S2Th23_Dm2_Atm[90].Dm2_Atm,
      "constraint_line constraint_outer NOvAConstraint",
      `<div>Expt: ${OscProbConstraintData.NOvA2018.Expt}</div><div>Year: ${
          OscProbConstraintData.NOvA2018.Year}</div><div>Ref: ${
          OscProbConstraintData.NOvA2018.Ref}</div>`);

  ConstraintData.AddConstraint(
      "NOvA2018_68", "dcp", "S2Th23",
      OscProbConstraintData.NOvA2018.dcp_S2Th23[68].dcp,
      OscProbConstraintData.NOvA2018.dcp_S2Th23[68].S2Th23,
      "constraint_line constraint_inner NOvAConstraint",
      `<div>Expt: ${OscProbConstraintData.NOvA2018.Expt}</div><div>Year: ${
          OscProbConstraintData.NOvA2018.Year}</div><div>Ref: ${
          OscProbConstraintData.NOvA2018.Ref}</div>`);
  ConstraintData.AddConstraint(
      "NOvA2018_95", "dcp", "S2Th23",
      OscProbConstraintData.NOvA2018.dcp_S2Th23[95].dcp,
      OscProbConstraintData.NOvA2018.dcp_S2Th23[95].S2Th23,
      "constraint_line constraint_outer NOvAConstraint",
      `<div>Expt: ${OscProbConstraintData.NOvA2018.Expt}</div><div>Year: ${
          OscProbConstraintData.NOvA2018.Year}</div><div>Ref: ${
          OscProbConstraintData.NOvA2018.Ref}</div>`);

  ConstraintData.AddConstraint(
      "NuFIT4_68", "S2Th23", "Dm2_Atm",
      OscProbConstraintData.NuFIT4.S2Th23_Dm2_Atm[68].S2Th23,
      OscProbConstraintData.NuFIT4.S2Th23_Dm2_Atm[68].Dm2_Atm,
      "constraint_line constraint_inner NuFIT4Constraint",
      `<div>Expt: ${OscProbConstraintData.NuFIT4.Expt}</div><div>Year: ${
          OscProbConstraintData.NuFIT4.Year}</div><div>Ref: ${
          OscProbConstraintData.NuFIT4.Ref}</div>`);
  ConstraintData.AddConstraint(
      "NuFIT4_90", "S2Th23", "Dm2_Atm",
      OscProbConstraintData.NuFIT4.S2Th23_Dm2_Atm[90].S2Th23,
      OscProbConstraintData.NuFIT4.S2Th23_Dm2_Atm[90].Dm2_Atm,
      "constraint_line constraint_outer NuFIT4Constraint",
      `<div>Expt: ${OscProbConstraintData.NuFIT4.Expt}</div><div>Year: ${
          OscProbConstraintData.NuFIT4.Year}</div><div>Ref: ${
          OscProbConstraintData.NuFIT4.Ref}</div>`);

  ConstraintData.AddConstraint(
      "NuFIT4_68", "S2Th13", "dcp",
      OscProbConstraintData.NuFIT4.S2Th13_dcp[68].S2Th13,
      OscProbConstraintData.NuFIT4.S2Th13_dcp[68].dcp,
      "constraint_line constraint_inner NuFIT4Constraint",
      `<div>Expt: ${OscProbConstraintData.NuFIT4.Expt}</div><div>Year: ${
          OscProbConstraintData.NuFIT4.Year}</div><div>Ref: ${
          OscProbConstraintData.NuFIT4.Ref}</div>`);
  ConstraintData.AddConstraint(
      "NuFIT4_90", "S2Th13", "dcp",
      OscProbConstraintData.NuFIT4.S2Th13_dcp[90].S2Th13,
      OscProbConstraintData.NuFIT4.S2Th13_dcp[90].dcp,
      "constraint_line constraint_outer NuFIT4Constraint",
      `<div>Expt: ${OscProbConstraintData.NuFIT4.Expt}</div><div>Year: ${
          OscProbConstraintData.NuFIT4.Year}</div><div>Ref: ${
          OscProbConstraintData.NuFIT4.Ref}</div>`);

  ConstraintData.AddConstraint(
      "KamLand_68", "S2Th12", "Dm2_Sol",
      OscProbConstraintData.KamLand.S2Th12_Dm2_Sol[68].S2Th12,
      OscProbConstraintData.KamLand.S2Th12_Dm2_Sol[68].Dm2_Sol,
      "constraint_line constraint_inner KamLandConstraint",
      `<div>Expt: ${OscProbConstraintData.KamLand.Expt}</div><div>Year: ${
          OscProbConstraintData.KamLand.Year}</div><div>Ref: ${
          OscProbConstraintData.KamLand.Ref}</div>`);
  ConstraintData.AddConstraint(
      "KamLand_90", "S2Th12", "Dm2_Sol",
      OscProbConstraintData.KamLand.S2Th12_Dm2_Sol[90].S2Th12,
      OscProbConstraintData.KamLand.S2Th12_Dm2_Sol[90].Dm2_Sol,
      "constraint_line constraint_outer KamLandConstraint",
      `<div>Expt: ${OscProbConstraintData.KamLand.Expt}</div><div>Year: ${
          OscProbConstraintData.KamLand.Year}</div><div>Ref: ${
          OscProbConstraintData.KamLand.Ref}</div>`);

  ConstraintData.AddConstraint(
      "SolarGlobal_68", "S2Th12", "Dm2_Sol",
      OscProbConstraintData.SolarGlobal.S2Th12_Dm2_Sol[68].S2Th12,
      OscProbConstraintData.SolarGlobal.S2Th12_Dm2_Sol[68].Dm2_Sol,
      "constraint_line constraint_inner SolarGlobalConstraint",
      `<div>Expt: ${OscProbConstraintData.SolarGlobal.Expt}</div><div>Year: ${
          OscProbConstraintData.SolarGlobal.Year}</div><div>Ref: ${
          OscProbConstraintData.SolarGlobal.Ref}</div>`);
  ConstraintData.AddConstraint(
      "SolarGlobal_90", "S2Th12", "Dm2_Sol",
      OscProbConstraintData.SolarGlobal.S2Th12_Dm2_Sol[90].S2Th12,
      OscProbConstraintData.SolarGlobal.S2Th12_Dm2_Sol[90].Dm2_Sol,
      "constraint_line constraint_outer SolarGlobalConstraint",
      `<div>Expt: ${OscProbConstraintData.SolarGlobal.Expt}</div><div>Year: ${
          OscProbConstraintData.SolarGlobal.Year}</div><div>Ref: ${
          OscProbConstraintData.SolarGlobal.Ref}</div>`);

  ConstraintData.AddConstraint(
      "DB2018_68", "S2Th13", "dcp",
      OscProbConstraintData.DayaBay2016.S2Th13_dcp["one_sigma"].S2Th13,
      OscProbConstraintData.DayaBay2016.S2Th13_dcp["one_sigma"].dcp,
      "constraint_line constraint_inner DBConstraint",
      `<div>Expt: ${OscProbConstraintData.DayaBay2016.Expt}</div><div>Year: ${
          OscProbConstraintData.DayaBay2016.Year}</div><div>Ref: ${
          OscProbConstraintData.DayaBay2016.Ref}</div>`);

  return ConstraintData.GetConstraintData();
}

var constraint_plots = [];

function InitializeConstraintWidgets(el, onchanged_callback) {

  let constraint_data = GetConstraintData();

  let ax_Dm2_Atm_NH = new ConstraintAxes(
      "Dm2_Atm", "\\(\\Delta{}\\textrm{m}_{32}^{2} 10^{-3} eV\\)", 2.2E-3,
      2.7E-3, [ 3 ], 1E3);

  let ax_Dm2_Atm_IH = new ConstraintAxes(
      "Dm2_Atm", "\\(\\Delta{}\\textrm{m}_{32}^{2} 10^{-3} eV\\)", -2.7E-3,
      -2.2E-3, [ 3 ], 1E3);

  let ax_S2Th23 = new ConstraintAxes("S2Th23", GetParamLatexName("S2Th23"),
                                     0.375, 0.65, [ 2 ]);

  let ax_dcp_mpi_pi =
      new ConstraintAxes("dcp", "\\(\\delta_{\\rm {\\small cp}} /\\pi\\)",
                         -Math.PI, Math.PI, [ 2 ], 1.0 / Math.PI, "dcp_mpi_pi");

  let ax_dcp_0_2pi =
      new ConstraintAxes("dcp", "\\(\\delta_{\\rm {\\small cp}} /\\pi\\)", 0,
                         2 * Math.PI, [ 2 ], 1.0 / Math.PI, "dcp_0_2pi");

  let ax_S2Th13 = new ConstraintAxes("S2Th13", GetParamLatexName("S2Th13"),
                                     10E-3, 50E-3, [ 2 ]);

  let ax_Dm2_Sol = new ConstraintAxes(
      "Dm2_Sol", "\\(\\Delta{}\\textrm{m}_{21}^{2} 10^{-5} eV\\)", 2E-5, 10E-5,
      [ 3 ], 1E5);

  let ax_S2Th12 = new ConstraintAxes("S2Th12", GetParamLatexName("S2Th12"), 0.2,
                                     0.4, [ 2 ]);

  constraint_plots.push(new ConstraintWidget(constraint_data["S2Th23_Dm2_Atm"],
                                             ax_S2Th23, ax_Dm2_Atm_NH));
  constraint_plots.push(new ConstraintWidget(constraint_data["S2Th23_Dm2_Atm"],
                                             ax_S2Th23, ax_Dm2_Atm_IH));
  constraint_plots.push(new ConstraintWidget(constraint_data["S2Th13_dcp"],
                                             ax_S2Th13, ax_dcp_mpi_pi));
  constraint_plots.push(new ConstraintWidget(constraint_data["dcp_S2Th23"],
                                             ax_dcp_0_2pi, ax_S2Th23));
  constraint_plots.push(new ConstraintWidget(constraint_data["S2Th12_Dm2_Sol"],
                                             ax_S2Th12, ax_Dm2_Sol));

  for (let plot_i = 0; plot_i < constraint_plots.length; ++plot_i) {
    constraint_plots[plot_i].Initialize(
        el, function(idx, pp) { onchanged_callback(idx, pp); });
  }
}

function ClearConstrainWidgetPoints() {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].ClearOscParams();
  }
}

function ClearConstrainWidgetPoint(idx) {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].ClearOscParam(idx);
  }
}

function SetConstraintWidgetPoints(index, osc_params) {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].SetOscParams(index, osc_params);
  }
}

function ConstraintWidgetSetIndex(index) {
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    constraint_plots[plot_j].SetIndex(index);
  }
}

function IncrementConstrainWidgetNPoints() {
  let NI = 0;
  for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
    NI = constraint_plots[plot_j].IncrementIndex();
  }
  return NI;
}

function GetAllChosenParameters() { return constraint_plots[0].GetAllSeries(); }