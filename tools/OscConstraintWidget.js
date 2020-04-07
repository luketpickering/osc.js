"use strict";

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
  GetParameterRange() {
    let range = [ this.min / this.exp_scale, this.max / this.exp_scale ];
    return range;
  }
  GetScaledRange() { return [ this.min, this.max ]; }
};

class ConstraintWidget {

  constructor(xAxisf, yAxisf) {
    this.xAxis = xAxisf;
    this.yAxis = yAxisf;

    this.osc_param_list = [];
    this.svg_points = [];
    this.current_index = 0;

    this.constraint_series = {};
  };

  SetShowHierarchy(i) {
    if(this.osc_param_list.length <= i){
      return;
    }

    if (this.osc_param_list[i].Get("Dm2_Atm") < 0) {
      this.plot_area_svg.selectAll("path.normal_hierarchy")
          .classed("other_hierarchy", true);
      this.plot_area_svg.selectAll("path.inverted_hierarchy")
          .classed("other_hierarchy", false);
    } else {
      this.plot_area_svg.selectAll("path.inverted_hierarchy")
          .classed("other_hierarchy", true);
      this.plot_area_svg.selectAll("path.normal_hierarchy")
          .classed("other_hierarchy", false);
    }
  }

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

    let hie_class = "normal_hierarchy";
    if (oscParams.Get("Dm2_Atm") < 0) {
      hie_class = "inverted_hierarchy";
    }

    this.SetShowHierarchy(i);

    if ((x_scaled >= this.xAxis.min) && (x_scaled <= this.xAxis.max) &&
        (y_scaled >= this.yAxis.min) && (y_scaled <= this.yAxis.max)) {
      this.svg_points[i] =
          this.plot_area_svg.append("circle")
              .attr("class", `cpoint ColorWheel-${i + 1} ${hie_class}`)
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
    this.plot_area_svg.selectAll(".cpoint").remove();
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
    this.SetShowHierarchy(idx);
  }

  AddConstraint(constraint_data) {

    let plot = this;
    let tt_paths = [];

    for (let pi = 0; pi < constraint_data.data.length; ++pi) {
      let path =
          this.plot_area_svg.append("path")
              .attr("d",
                    this.lineGen(constraint_data.data[pi])) // 11. Calls the
              // line generator
              .classed(constraint_data.meta.lineclass, true)
              .classed(constraint_data.meta.hierarchyclass, true);

      path.on("mouseup", function() { plot.HandleClick(this); });

      if (constraint_data.meta.tool_tip_html != undefined) {
        let tooltip = d3.select("body")
                          .append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0)
                          .html(constraint_data.meta.tool_tip_html);
        tt_paths.push([ path, tooltip ]);
      }
    }

    if (this.constraint_series[constraint_data.meta.expt] === undefined) {

      let legendlen = 0;
      let nseries = 0;
      for (let [k, obj] of Object.entries(this.constraint_series)) {
        legendlen += Math.round(obj.node().getBoundingClientRect().width) + 1;
        nseries++;
      }

      let xoffset = 30 + (nseries * 10) + legendlen;
      let yoffset = 15;

      this.constraint_series[constraint_data.meta.expt] =
          this.svg.append("g").attr("transform",
                                    `translate(${xoffset}, ${yoffset})`);

      this.constraint_series[constraint_data.meta.expt]
          .append("line")
          .attr("x1", 0)
          .attr("x2", 20)
          .attr("y1", 5)
          .attr("y2", 5)
          .classed(constraint_data.meta.lineclass, true);
      this.constraint_series[constraint_data.meta.expt]
          .append("a")
          .attr("target", "_blank")
          .attr("href", constraint_data.meta.doi)
          .append("text")
          .attr("x", 22)
          .attr("y", 10)
          .classed("legend", true)
          .text(constraint_data.meta.expt);
    }

    MathJax.Hub.Queue([ () => {
      for (let pi = 0; pi < tt_paths.length; ++pi) {
        let path = tt_paths[pi][0];
        let tooltip = tt_paths[pi][1];

        path.on("mouseover", function() {
              tooltip.transition().duration(200).style("opacity", .9);
              tooltip.style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
            }).on("mouseout", function() {
          tooltip.transition().duration(500).style("opacity", 0);
        });
      }
    } ]);
  }

  Initialize(ele, onchanged_callback) {

    let width = 200;
    let height = 150;
    let margin = {top : 40, right : 20, bottom : 60, left : 90};
    let tot_width = width + margin.left + margin.right;
    let tot_height = height + margin.top + margin.bottom;

    this.xScale = d3.scaleLinear()
                      .domain([ this.xAxis.min, this.xAxis.max ]) // input
                      .range([ 0, width ]);                       // output
    this.yScale = d3.scaleLinear()
                      .domain([ this.yAxis.min, this.yAxis.max ]) // input
                      .range([ height, 0 ]);                      // output

    this.lineGen =
        d3.line()
            .x((d) => { return this.xScale(d[0] * this.xAxis.exp_scale); })
            .y((d) => { return this.yScale(d[1] * this.yAxis.exp_scale); });
    // .curve(d3.curveNatural);

    let divele = d3.select(ele).append("div").classed(
        "col-lg-4 col-md-6 col-auto mx-auto", true);

    // everything is a child of the group that includes the offset
    this.svg = divele.append("svg")
                   .attr("width", tot_width)
                   .attr("height", tot_height)
                   .classed("border rounded", true);

    this.plot_area_svg = this.svg.append("g").attr(
        "transform", "translate(" + margin.left + "," + margin.top + ")");

    // x axis object
    this.plot_area_svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.xScale).tickArguments(this.xAxis.tickArgs));

    // x axis title
    RenderLatexLabel(this.plot_area_svg.append("text").text(this.xAxis.title),
                     this.plot_area_svg, "25ex", "10ex", width * 0.6,
                     height * 1.2, 1, 1);

    // y axis object
    this.plot_area_svg.append("g")
        .attr("class", "y_axis")
        .call(d3.axisLeft(this.yScale).tickArguments(this.yAxis.tickArgs));

    // y axis title
    RenderLatexLabel(this.plot_area_svg.append("text").text(this.yAxis.title),
                     this.plot_area_svg, "25ex", "10ex", -120, -80, 1, 1, -90);

    let plot = this;

    this.plot_area_svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseup", function() { plot.HandleClick(this); });

    this.onchanged_callback = onchanged_callback;
  };

  HandleClick(click_target) {
    // Get x/y in axes coords
    let coords = d3.mouse(click_target);
    let xaxcoords = this.xScale.invert(coords[0]) / this.xAxis.exp_scale;
    let yaxcoords = this.yScale.invert(coords[1]) / this.yAxis.exp_scale;

    let oscpars = this.GetOscParams(this.current_index).Copy();

    oscpars.Set(this.xAxis.name, xaxcoords);
    oscpars.Set(this.yAxis.name, yaxcoords);

    this.onchanged_callback(this.current_index, oscpars);
  };
};

function GetConstraintData() {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  // get around caching
  xobj.open('GET', `data/osc_constraint_contours.js? ${(new Date()).getTime()}`,
            true);
  xobj.onerror = function() {
    console.log(
        `ERROR: When attempting to read data/osc_constraint_contours.js, got ${
            this.statusText}`);
  };
  xobj.onload = () => {
    let OscProbConstraintData = JSON.parse(xobj.responseText);

    for (let [pub, constraint] of Object.entries(
             JSON.parse(xobj.responseText))) {
      if ((constraint.Contours === undefined) ||
          (constraint.Contours.length === 0)) {
        continue;
      }

      for (let c_it = 0; c_it < constraint.Contours.length; ++c_it) {
        let cname = constraint.Contours[c_it];
        let contour = constraint[cname];

        let naxes = contour.Axes.length;

        let axis_a = contour.Axes[0];
        if (!IsValidOscParamName(axis_a)) {
          console.log(
              `WARN: ${axis_a} is not a valid oscillation parameter name.`);
          continue;
        }
        let axis_b = contour.Axes[1];
        if (!IsValidOscParamName(axis_b)) {
          console.log(
              `WARN: ${axis_b} is not a valid oscillation parameter name.`);
          continue;
        }

        // console.log(`Expt: ${constraint.Expt}, Constraint ${cname} X: ${
        //     axis_a} Y: ${axis_b}`);

        for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
          let axis_plot_x = constraint_plots[plot_j].xAxis.name;
          let axis_plot_y = constraint_plots[plot_j].yAxis.name;

          // console.log(`-- Plot ${plot_j} X: ${axis_plot_x} Y:
          // ${axis_plot_y}`);

          let contour_xparam = undefined;
          let contour_yparam = undefined;
          let plot_xrange = constraint_plots[plot_j].xAxis.GetParameterRange();
          let plot_yrange = constraint_plots[plot_j].yAxis.GetParameterRange();

          if ((axis_a === axis_plot_x) && (axis_b === axis_plot_y)) {
            contour_xparam = contour.Axes[0];
            contour_yparam = contour.Axes[1];
          } else if ((axis_a === axis_plot_y) && (axis_b === axis_plot_x)) {
            contour_xparam = contour.Axes[1];
            contour_yparam = contour.Axes[0];
          } else { // Not relevant for this plot, try the next one
            continue;
          }

          // console.log(`-- -- drawing series for X: ${contour_xparam} Y: ${
          //     contour_yparam}`);

          for (let s_it = 0; s_it < contour.Series.length; ++s_it) {
            let sname = contour.Series[s_it];
            let series = contour[sname];
            let hierarchy = series.Hierarchy;

            if (series[contour_xparam].length !=
                series[contour_yparam].length) {
              console.log(`WARN: (Expt: ${constraint.Expt}, Constraint ${
                  cname}) xparam(${contour_xparam}) series(${sname}) has ${
                  series[contour_xparam].length} subseries, and yparam(${
                  contour_yparam}) has ${series[contour_yparam].length}.`);
              continue;
            }

            let path_data = [];
            let npoints = 0;
            let npoints_sel = 0;
            for (let ss_it = 0; ss_it < series[contour_xparam].length;
                 ++ss_it) {

              let xsubseries = series[contour_xparam][ss_it];
              let ysubseries = series[contour_yparam][ss_it];
              if (xsubseries.length != ysubseries.length) {
                console.log(`WARN: (Expt: ${constraint.Expt}, Constraint ${
                    cname}, sub-series: ${ss_it}) xparam(${
                    contour_xparam}) series(${sname}) has ${
                    xsubseries.length} path points, and yparam(${
                    contour_yparam}) has ${ysubseries.length}.`);
                continue;
              }
              let subpath = [];
              for (let p_it = 0; p_it < xsubseries.length; ++p_it) {
                npoints++;
                if ((xsubseries[p_it] < plot_xrange[0]) ||
                    (xsubseries[p_it] > plot_xrange[1]) ||
                    (ysubseries[p_it] < plot_yrange[0]) ||
                    (ysubseries[p_it] >
                     plot_yrange[1])) { // Don't include OOR points
                  continue;
                }
                npoints_sel++;
                subpath.push([ xsubseries[p_it], ysubseries[p_it] ]);
              }
              if (subpath.length > 0) {
                path_data.push(subpath);
              }
            }
            // console.log(`-- -- Using ${npoints_sel}/${npoints}`);
            if (path_data.length > 0) {
              constraint_plots[plot_j].AddConstraint({
                meta : {
                  tool_tip_html : `<div>Expt: ${
                      constraint.Expt}</div><div>Year: ${
                      constraint.Year}</div><div>Ref: ${constraint.Ref}</div>`,
                  lineclass : `${pub} ${contour.Series[s_it]} constraint_line`,
                  expt : constraint.Expt,
                  doi : constraint.doi,
                  hierarchyclass : (hierarchy === "IH") ? "inverted_hierarchy"
                                                        : "normal_hierarchy"
                },
                data : path_data
              });
            }
          }
        }
      }
    }
  };

  xobj.send(null);
}

var constraint_plots = [];

function InitializeConstraintWidgets(el, onchanged_callback) {

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

  constraint_plots.push(new ConstraintWidget(ax_S2Th23, ax_Dm2_Atm_NH));
  constraint_plots.push(new ConstraintWidget(ax_S2Th23, ax_Dm2_Atm_IH));
  constraint_plots.push(new ConstraintWidget(ax_S2Th13, ax_dcp_mpi_pi));
  constraint_plots.push(new ConstraintWidget(ax_dcp_0_2pi, ax_S2Th23));
  constraint_plots.push(new ConstraintWidget(ax_S2Th12, ax_Dm2_Sol));

  for (let plot_i = 0; plot_i < constraint_plots.length; ++plot_i) {
    constraint_plots[plot_i].Initialize(
        el, function(idx, pp) { onchanged_callback(idx, pp); });
  }

  GetConstraintData();
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