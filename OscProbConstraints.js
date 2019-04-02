class OscParams {
  constructor() {
    this.S2Th12 = 0.297;
    this.S2Th13 = 0.0214;
    this.S2Th23 = 0.534;

    this.Dm2_21 = 7.37E-5;
    this.Dm2_Atm = 2.539E-3;

    this.dcp = 0;
  }

  static GetLatexName(name) {
    if (name === "Dm2_Atm") {
      return '$\\Delta{}\\textrm{m}_{32}^{2}$';
    } else if (name === "Dm2_21") {
      return '$\\Delta{}\\textrm{m}_{21}^{2}$';
    } else if (name === "S2Th12") {
      return '$sin^{2}(\\theta_{12})$';
    } else if (name === "S2Th13") {
      return '$sin^{2}(\\theta_{13})$';
    } else if (name === "S2Th23") {
      return '$sin^{2}(\\theta_{23})$';
    } else if (name === "dcp") {
      return '$\\delta_{\\textsc{cp}}$';
    }
    return false;
  }

  Set(name, value) {
    if (name === "dm32") {
      this.Dm2_Atm = value;
      this.Dm2_Atm_tblval.text((value).toPrecision(3));
    } else if (name === "ssth23") {
      this.S2Th23 = value;
      this.S2Th23_tblval.text((value).toPrecision(3));
    } else if (name === "ssth12") {
      this.S2Th12 = value;
      this.S2Th12_tblval.text((value).toPrecision(3));
    } else if (name === "dcp") {
      this.dcp = value;
      this.dcp_tblval.text((value).toPrecision(3));
    }
  }

  InitializeTable(el) {
    let tbl_body = d3.select(el).select("tbody");

    this.S2Th12_row = tbl_body.append("tr");
    this.S2Th12_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("S2Th12"));
    this.S2Th12_tblval =
        this.S2Th12_row.append("tr").attr("scope", "row").text(this.S2Th12);

    this.S2Th13_row = tbl_body.append("tr");
    this.S2Th13_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("S2Th13"));
    this.S2Th13_tblval =
        this.S2Th13_row.append("tr").attr("scope", "row").text(this.S2Th13);

    this.S2Th23_row = tbl_body.append("tr");
    this.S2Th23_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("S2Th23"));
    this.S2Th23_tblval =
        this.S2Th23_row.append("tr").attr("scope", "row").text(this.S2Th23);

    this.Dm2_Atm_row = tbl_body.append("tr");
    this.Dm2_Atm_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("Dm2_Atm"));
    this.Dm2_Atm_tblval =
        this.Dm2_Atm_row.append("tr").attr("scope", "row").text(this.Dm2_Atm);

    this.Dm2_21_row = tbl_body.append("tr");
    this.Dm2_21_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("Dm2_21"));
    this.Dm2_21_tblval =
        this.Dm2_21_row.append("tr").attr("scope", "row").text(this.Dm2_21);

    this.dcp_row = tbl_body.append("tr");
    this.dcp_row.append("th")
        .attr("scope", "row")
        .text(OscParams.GetLatexName("dcp"));
    this.dcp_tblval =
        this.dcp_row.append("tr").attr("scope", "row").text(this.dcp);
  }
};

class OPContour {
  constructor(namef, xpointsf, ypointsf) {
    this.name = namef;
    this.x = xpointsf;
    this.y = ypointsf;
  }

  GetPointList() {
    let data = [];
    for (let it = 0; it < this.x.length; it++) {
      data.push([ this.x[it], this.y[it] ]);
    }
    return data;
  }
};

class OscProbConstraints {
  constructor() { this.Constraints = {}; }

  AddConstraint(namef, xaxf, yaxf, xpointsf, ypointsf) {
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
    this.Constraints[xaxf][yaxf].push(new OPContour(namef, xpointsf, ypointsf));
  }

  static IsValidAxis(axname) {
    if (axname === "dm32") {
      return true;
    } else if (axname === "ssth23") {
      return true;
    } else if (axname === "ssth12") {
      return true;
    } else if (axname === "dcp") {
      return true;
    }
    return false;
  }

  static GetAxisLabel(axname) {
    if (axname === "dm32") {
      return '$\\Delta{}\\textrm{m}_{32}^{2}$';
    } else if (axname === "ssth23") {
      return '$sin^{2}(\\theta_{23})$';
    } else if (axname === "ssth12") {
      return '$sin^{2}(\\theta_{12})$';
    } else if (axname === "dcp") {
      return '$\\delta_{\\textsc{cp}}$';
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
            meta : {id : cit, name : constraints[cit].name},
            data : constraints[cit].GetPointList()
          });
        }
      }, this);
    }, this);
    return data;
  }
};

const T2K2018_dm32_ssth23_68 = {
  dm32 : [
    0.0024969, 0.0025203, 0.0025364, 0.0025481, 0.0025554, 0.0025612,
    0.0025626, 0.0025596, 0.0025478, 0.0025287, 0.0025038, 0.0024789,
    0.0024628, 0.0024510, 0.0024247, 0.0024027, 0.0023808, 0.0023662,
    0.0023501, 0.0023487, 0.0023517, 0.0023606, 0.0023767, 0.0023958,
    0.0024193, 0.0024457, 0.0024735, 0.0024969
  ],
  ssth23 : [
    0.47673, 0.48347, 0.49204, 0.50245, 0.51224, 0.52327, 0.53796,
    0.55020, 0.56000, 0.56735, 0.57102, 0.57224, 0.57163, 0.57102,
    0.56735, 0.56245, 0.55510, 0.54714, 0.53245, 0.52143, 0.50980,
    0.49878, 0.49020, 0.48347, 0.47735, 0.47490, 0.47490, 0.47673
  ]
};

const T2K2018_dm32_ssth23_90 = {
  dm32 : [
    0.0025760, 0.0025833, 0.0025906, 0.0025950, 0.0026008, 0.0026037,
    0.0026080, 0.0026079, 0.0026035, 0.0025976, 0.0025858, 0.0025712,
    0.0025521, 0.0025257, 0.0025008, 0.0024700, 0.0024422, 0.0024188,
    0.0023880, 0.0023748, 0.0023514, 0.0023339, 0.0023222, 0.0023105,
    0.0023047, 0.0023019, 0.0023078, 0.0023210, 0.0023328, 0.0023489,
    0.0023636, 0.0023739, 0.0023900, 0.0024032, 0.0024223, 0.0024457,
    0.0024707, 0.0024941, 0.0025190, 0.0025468, 0.0025629, 0.0025760
  ],
  ssth23 : [
    0.47857, 0.48469, 0.49327, 0.50061, 0.51041, 0.52143, 0.53673,
    0.55204, 0.56000, 0.56612, 0.57286, 0.57837, 0.58327, 0.58571,
    0.58694, 0.58694, 0.58449, 0.58204, 0.57653, 0.57347, 0.56612,
    0.55816, 0.55143, 0.54163, 0.52878, 0.51837, 0.50245, 0.49020,
    0.48408, 0.47612, 0.47061, 0.46816, 0.46449, 0.46143, 0.45898,
    0.45776, 0.45714, 0.45714, 0.46020, 0.46510, 0.47122, 0.47857
  ]
};

class ConstraintElements {

  constructor() {
    this.ConstraintData = new OscProbConstraints();
    this.ConstraintData.AddConstraint("T2K2018_68", "ssth23", "dm32",
                                      T2K2018_dm32_ssth23_68.ssth23,
                                      T2K2018_dm32_ssth23_68.dm32);
    this.ConstraintData.AddConstraint("T2K2018_90", "ssth23", "dm32",
                                      T2K2018_dm32_ssth23_90.ssth23,
                                      T2K2018_dm32_ssth23_90.dm32);
  };

  // Give it a div and it makes one plot per constraint.
  Initialize(ele, onchanged_callback) {

    let constraint_axes = {
      "ssth23_dm32" : {xmin : 0.4, xmax : 0.65, ymin : 2.2E-3, ymax : 2.7E-3},
    };

    Object.keys(constraint_axes).forEach(function(axname) {
      let axprops = constraint_axes[axname];
      let width = 400;
      let height = 300;
      let margin = {top : 20, right : 20, bottom : 75, left : 90};
      let tot_width = width + margin.left + margin.right;
      let tot_height = height + margin.top + margin.bottom;

      let xScale = d3.scaleLinear()
                       .domain([ axprops.xmin, axprops.xmax ]) // input
                       .range([ 0, width ]);                   // output

      let yScale = d3.scaleLinear()
                       .domain([ axprops.ymin, axprops.ymax ]) // input
                       .range([ height, 0 ]);                  // output

      let line = d3.line()
                     .x(function(d) { return xScale(d[0]); })
                     .y(function(d) { return yScale(d[1]); })
                     .curve(d3.curveNatural);

      let svg = d3.select(ele)
                    .append("svg")
                    .attr("width", tot_width)
                    .attr("height", tot_height)
                    .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

      let xaxis = svg.append("g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + height + ")")
                      .call(d3.axisBottom(xScale).tickArguments([ 5 ]));

      let xtitle_pretty = OscProbConstraints.GetAxisLabel(axname.split("_")[0]);

      let xtitle = svg.append("text")
                       .attr("class", "label")
                       .attr("x", width * 0.9)
                       .attr("y", tot_height * 0.9)
                       .style("text-anchor", "middle")
                       .text(xtitle_pretty);

      svg.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(yScale).tickArguments([ 5, "e" ]));

      let ytitle_pretty = OscProbConstraints.GetAxisLabel(axname.split("_")[1]);

      let ytitle = svg.append("text")
                       .attr("class", "label")
                       .attr("y", width * -0.14)
                       .attr("transform", "rotate(-90)")
                       .style("text-anchor", "middle")
                       .text(ytitle_pretty);

      let axcdata = this.ConstraintData.GetConstraintData()[axname];

      for (let i = 0; i < axcdata.length; ++i) {
        svg.append("path")
            .attr("d",
                  line(axcdata[i].data)) // 11. Calls the line generator
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
      }

      svg.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("click", function() {
            // Remove old current point markers
            svg.selectAll(".cpoint").remove();

            // Get x/y in axes coords
            let coords = d3.mouse(this);
            let xaxcoords = xScale.invert(coords[0]);
            let yaxcoords = yScale.invert(coords[1]);

            let params = {};
            params[axname.split("_")[0]] = xaxcoords;
            params[axname.split("_")[1]] = yaxcoords;

            svg.append("circle")
                .attr("class", "cpoint")
                .attr("cx", xScale(xaxcoords))
                .attr("cy", yScale(yaxcoords))
                .attr("r", 3);

            onchanged_callback(params);
          });
    }, this);
  };

  // Callback for setting new values
};
