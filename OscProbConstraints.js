class OPCons {
  constructor(namef, xpointsf, ypointsf) {
    this.name = namef;
    this.x = xpointsf;
    this.y = ypointsf;
    this.type = "line";
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
    this.Constraints[xaxf][yaxf].push(new OPCons(namef, xpointsf, ypointsf));
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
      return '$\Delta{}\textrm{m}_{32}^{2}$';
    } else if (axname === "ssth23") {
      return '$sin^{2}(\theta_{23})$';
    } else if (axname === "ssth12") {
      return '$sin^{2}(\theta_{12})$';
    } else if (axname === "dcp") {
      return '$\delta_{\textsc{cp}}$';
    }
    return false;
  }

  GetConstraintData() {
    let data = [];
    Object.keys(this.Constraints).forEach(function(key_x) {
      Object.keys(this.Constraints[key_x]).forEach(function(key_y) {
        data.push({
          data : this.Constraints[key_x][key_y],
          layout : {
            xaxis : {
              title : OscProbConstraints.GetAxisLabel(key_x),
              fixedrange : true
            },
            yaxis : {
              title : OscProbConstraints.GetAxisLabel(key_y),
              fixedrange : true
            }
          }
        });
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
  Initialize(ele, callback) {
    let new_node = document.createElement("div");
    let mouseover_helper = document.createElement("p");
    mouseover_helper.id = "mouseover_helper";
    new_node.id = "nuconst_ssth23_dm32";

    ele.appendChild(new_node);
    ele.appendChild(mouseover_helper);

    new_node = document.getElementById("nuconst_ssth23_dm32");
    mouseover_helper = document.getElementById("mouseover_helper");

    Plotly.newPlot(new_node, this.ConstraintData.GetConstraintData()[0]);

    var xaxis = new_node._fullLayout.xaxis;
    var yaxis = new_node._fullLayout.yaxis;
    var l = new_node._fullLayout.margin.l;
    var t = new_node._fullLayout.margin.t;

    new_node.addEventListener('click', function(evt) {
      console.log(this);
      let bla = this.querySelector('svg');
      console.log(bla);
      console.log(Plotly.d3.mouse(bla));
      // hacky solution because plotly will only give you the
      // nearest point.
      var xInDataCoord = xaxis.p2c(evt.x - l);
      var yInDataCoord = yaxis.p2c(evt.y - t);

      var xInDataCoord_raw = xaxis.p2c(evt.x);
      var yInDataCoord_raw = yaxis.p2c(evt.y);

      mouseover_helper.innerHTML =
          [ evt.x, evt.y, l, t, xInDataCoord, yInDataCoord ].join(", ");
    });
  };

  // Callback for setting new values
};
