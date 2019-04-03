function GetNuName(nu_pdg) {
  switch (nu_pdg) {
  case -12: {
    return "\\(\\bar{\\nu_{e}}\\)";
  }
  case -14: {
    return "\\(\\bar{\\nu_{\\mu}}\\)";
  }
  case -16: {
    return "\\(\\bar{\\nu_{\\tau}}\\)";
  }
  case 12: {
    return "\\(\\nu_{e}\\)";
  }
  case 14: {
    return "\\(\\nu_{\\mu}\\)";
  }
  case 16: {
    return "\\(\\nu_{\\tau}\\)";
  }
  }
}

class OscParams {
  constructor() {
    this.S2Th12 = 0.297;
    this.S2Th13 = 0.0214;
    this.S2Th23 = 0.534;

    this.Dm2_21 = 7.37E-5;
    this.Dm2_Atm = 2.539E-3;

    this.dcp = 0;

    this.tbl_el = undefined;
  }

  Copy() {
    let rtn = new OscParams();
    rtn.S2Th12 = this.S2Th12;
    rtn.S2Th13 = this.S2Th13;
    rtn.S2Th23 = this.S2Th23;
    rtn.Dm2_21 = this.Dm2_21;
    rtn.Dm2_Atm = this.Dm2_Atm;
    rtn.dcp = this.dcp;
    return rtn;
  }

  static GetLatexName(name) {
    if (name === "Dm2_Atm") {
      return '\\(\\Delta{}\\textrm{m}_{32}^{2}\\)';
    } else if (name === "Dm2_21") {
      return '\\(\\Delta{}\\textrm{m}_{21}^{2}\\)';
    } else if (name === "S2Th12") {
      return '\\(\\sin^{2}(\\theta_{12})\\)';
    } else if (name === "S2Th13") {
      return '\\(\\sin^{2}(\\theta_{13})\\)';
    } else if (name === "S2Th23") {
      return '\\(\\sin^{2}(\\theta_{23})\\)';
    } else if (name === "dcp") {
      return '\\(\\delta_{\\rm {\\small cp}}\\)';
    }
    return false;
  }

  Set(name, value) {
    if (name === "Dm2_Atm") {
      this.Dm2_Atm = value;
      if (this.tbl_el != undefined) {
        this.Dm2_Atm_tblval.text((value).toExponential(3));
      }
    } else if (name === "S2Th23") {
      this.S2Th23 = value;
      if (this.tbl_el != undefined) {
        this.S2Th23_tblval.text((value).toPrecision(3));
      }
    } else if (name === "S2Th13") {
      this.S2Th13 = value;
      if (this.tbl_el != undefined) {
        this.S2Th13_tblval.text((value).toExponential(3));
      }
    } else if (name === "dcp") {
      this.dcp = value;
      if (this.tbl_el != undefined) {
        this.dcp_tblval.text((value).toPrecision(3));
      }
    }
  }
  Get(name) {
    if (name === "Dm2_Atm") {
      return this.Dm2_Atm;
    } else if (name === "S2Th23") {
      return this.S2Th23;
    } else if (name === "S2Th13") {
      return this.S2Th13;
    } else if (name === "dcp") {
      return this.dcp;
    }
  }

  GenToolTipHTML(pdg_from, pdg_to, baseline) {
    return [
      `<div>From: ${GetNuName(pdg_from)}</div>`,
      `<div>To: ${GetNuName(pdg_to)}</div>`,
      `<div>Baseline: ${baseline} km</div>`,
      `<div>${OscParams.GetLatexName("S2Th12")}: ${
          this.S2Th12.toPrecision(3)}</div>`,
      `<div>${OscParams.GetLatexName("S2Th13")}: ${
          this.S2Th13.toExponential(3)}</div>`,
      `<div>${OscParams.GetLatexName("S2Th23")}: ${
          this.S2Th23.toPrecision(3)}</div>`,
      `<div>${OscParams.GetLatexName("Dm2_21")}: ${
          this.Dm2_21.toExponential(3)} eV</div>`,
      `<div>${OscParams.GetLatexName("Dm2_Atm")}: ${
          this.Dm2_Atm.toExponential(3)} eV</div>`,
      `<div>${OscParams.GetLatexName("dcp")}: ${this.dcp.toPrecision(3)}</div>`,
    ].join("");
  }

  InitializeTable(el) {
    let tbl_body = d3.select(el).select("tbody");

    this.S2Th12_row = tbl_body.append("tr");
    this.S2Th12_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("S2Th12"));
    this.S2Th12_tblval = this.S2Th12_row.append("tr")
                             .attr("scope", "row")
                             .text(this.S2Th12.toPrecision(3));

    this.S2Th13_row = tbl_body.append("tr");
    this.S2Th13_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("S2Th13"));
    this.S2Th13_tblval = this.S2Th13_row.append("tr")
                             .attr("scope", "row")
                             .text(this.S2Th13.toExponential(3));

    this.S2Th23_row = tbl_body.append("tr");
    this.S2Th23_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("S2Th23"));
    this.S2Th23_tblval = this.S2Th23_row.append("tr")
                             .attr("scope", "row")
                             .text(this.S2Th23.toPrecision(3));

    this.Dm2_Atm_row = tbl_body.append("tr");
    this.Dm2_Atm_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("Dm2_Atm"));
    this.Dm2_Atm_tblval = this.Dm2_Atm_row.append("tr")
                              .attr("scope", "row")
                              .text(this.Dm2_Atm.toExponential(3));

    this.Dm2_21_row = tbl_body.append("tr");
    this.Dm2_21_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("Dm2_21"));
    this.Dm2_21_tblval = this.Dm2_21_row.append("tr")
                             .attr("scope", "row")
                             .text(this.Dm2_21.toExponential(3));

    this.dcp_row = tbl_body.append("tr");
    this.dcp_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("dcp"));
    this.dcp_tblval = this.dcp_row.append("tr")
                          .attr("scope", "row")
                          .text(this.dcp.toPrecision(3));

    this.tbl_el = tbl_body.node();
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.tbl_el]);
  }
};

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
    } else if (axname === "S2Th23") {
      return true;
    } else if (axname === "S2Th13") {
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

class PlotPoint {
  constructor(xax_namef, xax_pointf, yax_namef, yax_pointf) {
    this.xax_name = xax_namef;
    this.xax_point = xax_pointf;
    this.yax_name = yax_namef;
    this.yax_point = yax_pointf;
  }
};

class ConstraintAxes {
  constructor(namef, titlef, minf, maxf, tickArgsf = [ 7 ]) {
    this.name = namef;
    this.title = titlef;
    this.min = minf;
    this.max = maxf;
    this.tickArgs = tickArgsf;
  }
};

class ConstraintPlot {

  constructor(ConstraintDataf, xAxisf, yAxisf) {
    this.ConstraintData = ConstraintDataf;
    this.xAxis = xAxisf;
    this.yAxis = yAxisf;
  };

  SetNewOscParams(oscParams) {
    // Remove old current point markers
    this.svg.selectAll(".cpoint").remove();

    let x = oscParams.Get(this.xAxis.name);
    let y = oscParams.Get(this.yAxis.name);

    this.svg.append("circle")
        .attr("class", "cpoint")
        .attr("cx", this.xScale(x))
        .attr("cy", this.yScale(y))
        .attr("r", 3);
  }

  Initialize(ele, onchanged_callback, on_hover_callback, off_hover_callback) {

    let width = 200;
    let height = 150;
    let margin = {top : 20, right : 20, bottom : 75, left : 90};
    let tot_width = width + margin.left + margin.right;
    let tot_height = height + margin.top + margin.bottom;

    this.xScale = d3.scaleLinear()
                      .domain([ this.xAxis.min, this.xAxis.max ]) // input
                      .range([ 0, width ]);                       // output
    let xScale = this.xScale;
    this.yScale = d3.scaleLinear()
                      .domain([ this.yAxis.min, this.yAxis.max ]) // input
                      .range([ height, 0 ]);                      // output
    let yScale = this.yScale;
    this.lineGen = d3.line()
                       .x(function(d) { return xScale(d[0]); })
                       .y(function(d) { return yScale(d[1]); })
                       .curve(d3.curveNatural);

    this.svg = d3.select(ele)
                   .append("svg")
                   .attr("width", tot_width)
                   .attr("height", tot_height)
                   .append("g")
                   .attr("transform",
                         "translate(" + margin.left + "," + margin.top + ")");

    // x axis object
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.xScale).tickArguments(this.xAxis.tickArgs));

    // x axis title
    this.svg.append("text")
        .attr("class", "label")
        .attr("x", width * 0.9)
        .attr("y", tot_height * 0.9)
        .style("text-anchor", "middle")
        .text(this.xAxis.title);

    // y axis object
    this.svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(this.yScale).tickArguments(this.yAxis.tickArgs));

    // y axis title
    this.svg.append("text")
        .attr("class", "label")
        .attr("y", width * -0.14)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text(this.yAxis.title);

    let xAxis_name = this.xAxis.name;
    let yAxis_name = this.yAxis.name;

    function clickHandler() {
      // Get x/y in axes coords
      let coords = d3.mouse(this);
      let xaxcoords = xScale.invert(coords[0]);
      let yaxcoords = yScale.invert(coords[1]);

      let params = new PlotPoint(xAxis_name, xaxcoords, yAxis_name, yaxcoords);

      onchanged_callback(params);
    };

    function hoverHandler() {
      // Get x/y in axes coords
      let coords = d3.mouse(this);
      let xaxcoords = xScale.invert(coords[0]);
      let yaxcoords = yScale.invert(coords[1]);

      let params = new PlotPoint(xAxis_name, xaxcoords, yAxis_name, yaxcoords);

      on_hover_callback(params);
    };

    this.svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("click", clickHandler);
    // Disable hover for now.
    // .on("mousemove", hoverHandler)
    // .on("touchmove", hoverHandler)
    // .on("mouseout", function() { off_hover_callback(); });

    let tooltip = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

    for (let ci = 0; ci < this.ConstraintData.length; ++ci) {
      for (let pi = 0; pi < this.ConstraintData[ci].data.length; ++pi) {
        let tool_tip_html = this.ConstraintData[ci].meta.tool_tip_html;
        let path = this.svg.append("path")
                       .attr("d",
                             this.lineGen(
                                 this.ConstraintData[ci]
                                     .data[pi])) // 11. Calls the line generator
                       .attr("class", this.ConstraintData[ci].meta.lineclass)
                       .on("click", clickHandler);
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
  };

  // Callback for setting new values
};

function GetConstraintData() {
  let ConstraintData = new OscProbConstraints();
  ConstraintData.AddConstraint(
      "T2K2018_68", "S2Th23", "Dm2_Atm", T2K2018_S2Th23_Dm2_Atm_68.S2Th23,
      T2K2018_S2Th23_Dm2_Atm_68.Dm2_Atm,
      "constraint_line constraint_inner T2KConstraint",
      "<div>Expt: T2K</div><div>Year: 2018</div><div>Ref: PRL 121 171802</div>");
  ConstraintData.AddConstraint(
      "T2K2018_90", "S2Th23", "Dm2_Atm", T2K2018_S2Th23_Dm2_Atm_90.S2Th23,
      T2K2018_S2Th23_Dm2_Atm_90.Dm2_Atm,
      "constraint_line constraint_outer T2KConstraint",
      "<div>Expt: T2K</div><div>Year: 2018</div><div>Ref: PRL 121 171802</div>");

  ConstraintData.AddConstraint(
      "T2K2018_68", "S2Th13", "dcp", T2K2018_S2Th13_dcp_68.S2Th13,
      T2K2018_S2Th13_dcp_68.dcp,
      "constraint_line constraint_inner T2KConstraint",
      "<div>Expt: T2K</div><div>Year: 2018</div><div>Ref: PRL 121 171802</div>");
  ConstraintData.AddConstraint(
      "T2K2018_90", "S2Th13", "dcp", T2K2018_S2Th13_dcp_90.S2Th13,
      T2K2018_S2Th13_dcp_90.dcp,
      "constraint_line constraint_outer T2KConstraint",
      "<div>Expt: T2K</div><div>Year: 2018</div><div>Ref: PRL 121 171802</div>");

  return ConstraintData.GetConstraintData();
}

function InitializeConstraintPlots(el, onchanged_callback, on_hover_callback,
                                   off_hover_callback) {

  let constraint_data = GetConstraintData();

  let constraint_plots = [];

  let ax_Dm2_Atm = new ConstraintAxes(
      "Dm2_Atm", OscParams.GetLatexName("Dm2_Atm"), 2.2E-3, 2.7E-3, [ 7, "e" ]);

  let ax_S2Th23 = new ConstraintAxes("S2Th23", OscParams.GetLatexName("S2Th23"),
                                     0.4, 0.6, [ 7 ]);

  let ax_dcp = new ConstraintAxes("dcp", OscParams.GetLatexName("dcp"),
                                  -Math.PI, Math.PI, [ 7 ]);

  let ax_S2Th13 = new ConstraintAxes("S2Th13", OscParams.GetLatexName("S2Th23"),
                                     10E-3, 50E-3, [ 7 ]);

  constraint_plots.push(new ConstraintPlot(constraint_data["S2Th23_Dm2_Atm"],
                                           ax_S2Th23, ax_Dm2_Atm));
  constraint_plots.push(
      new ConstraintPlot(constraint_data["S2Th13_dcp"], ax_S2Th13, ax_dcp));

  for (let plot_i = 0; plot_i < constraint_plots.length; ++plot_i) {
    constraint_plots[plot_i].Initialize(el, function(pp) {
      let op = onchanged_callback(pp);
      for (let plot_j = 0; plot_j < constraint_plots.length; ++plot_j) {
        constraint_plots[plot_j].SetNewOscParams(op);
      }
    }, on_hover_callback, off_hover_callback);
  }
}
