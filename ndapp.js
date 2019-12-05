"use strict";

class ndapp {

  constructor() {

    this.Widgets = {};
    this.Widgets.NDCombPlot_El = document.getElementById("NDCombPlot");
    this.Widgets.ConstraintControls =
      document.getElementById("ConstraintControls");

    this.Controls = {};
    this.Controls.ND280_El = document.getElementById("ND280_input");
    this.Controls.WAGASCI_El = document.getElementById("WAGASCI_input");
    this.Controls.INGRID_El = document.getElementById("INGRID_input");

    this.ebinning = [0, 0.111111, 0.222222, 0.333333, 0.444444, 0.555556, 0.666667, 0.777778, 0.888889, 1, 1.11111, 1.22222, 1.33333, 1.44444, 1.55556, 1.66667, 1.77778, 1.88889, 2, 2.11111, 2.22222, 2.33333, 2.44444, 2.55556, 2.66667, 2.77778, 2.88889, 3, 3.11111, 3.22222, 3.33333, 3.44444, 3.55556, 3.66667, 3.77778, 3.88889, 4, 4.11111, 4.22222, 4.33333, 4.44444, 4.55556, 4.66667, 4.77778, 4.88889, 5];

    this.ND280Flux = [62331, 250248, 615333, 1.18128e+06, 1.81861e+06, 1.86869e+06, 1.42664e+06, 827517, 422623, 241665, 163120, 121161, 97147, 78615, 64391, 55346, 49211, 43076, 37606, 35057, 29522, 27751, 25408, 23698, 22977, 20517, 19658, 19880, 17788, 17849, 16626, 16418, 15611, 14884, 14699, 13962, 13388, 12746, 12416, 11738, 10945, 10710, 9968, 9238, 9022];
    this.WAGASCIFlux = [79342, 226505, 384307, 635388, 982814, 1.29075e+06, 1.29934e+06, 1.19332e+06, 907440, 619272, 365030, 281456, 235288, 160517, 160107, 123176, 134455, 99257, 82038, 53965, 90766, 43453, 39598, 49433, 43757, 35984, 29048, 17177, 34714, 16394, 15459, 29098, 26839, 36603, 14646, 16347, 16592, 19667, 10812, 20764, 23394, 14351, 21162, 5592, 14593];
    this.INGRIDFlux = [23476, 88781, 191314, 304484, 409112, 503917, 572827, 635323, 650695, 635324, 623415, 609273, 587037, 543533, 495862, 442211, 385173, 329805, 277218, 239630, 205970, 173946, 148096, 126812, 107723, 90209, 77254, 64427, 52612, 43302, 36552, 30249, 25090, 20820, 17469, 15151, 11920, 10858, 9714, 9009, 7865, 7246, 7262, 6766, 6249];

    this.coeffs = { "ND280": 1, "WAGASCI": 1, "INGRID": 1 };

    this.color_class_wheel = [
      "ColorWheel1", "ColorWheel2", "ColorWheel3", "ColorWheel4", "ColorWheel5"
    ];
    this.wheel_idx = 0;
  }

  AddCurve(plot, params, curve_state = 0) {

    let combflux = {
      meta: {
        id: 0,
        name: "combflux"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx]
    };

    let ND280F = {
      meta: {
        id: 0,
        name: "ND280F"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx + 1]
    };
    let WAGASCIF = {
      meta: {
        id: 0,
        name: "WAGASCIF"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx + 2]
    };
    let INGRIDF = {
      meta: {
        id: 0,
        name: "INGRIDF"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx + 3]
    };

    let ND280FN = {
      meta: {
        id: 0,
        name: "ND280FN"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx + 1] + " dashed_line"
    };
    let WAGASCIFN = {
      meta: {
        id: 0,
        name: "WAGASCIFN"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx + 2] + " dashed_line"
    };
    let INGRIDFN = {
      meta: {
        id: 0,
        name: "INGRIDFN"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx + 3] + " dashed_line"
    };

    let ND280W = params["ND280"];
    let WAGASCIW = params["WAGASCI"];
    let INGRIDW = params["INGRID"];

    for (let i = 0; i < this.ebinning.length - 1; ++i) {
      let p = [];
      p[0] = (this.ebinning[i] + this.ebinning[i + 1]) / 2.0;
      p[1] = (this.ND280Flux[i] * ND280W + this.WAGASCIFlux[i] * WAGASCIW + this.INGRIDFlux[i] * INGRIDW) * 1E-6;
      if (!isNaN(p[1])) {
        combflux.data.push(p);
        ND280F.data.push([p[0], this.ND280Flux[i] * ND280W * 1E-6]);
        WAGASCIF.data.push([p[0], this.WAGASCIFlux[i] * WAGASCIW * 1E-6]);
        INGRIDF.data.push([p[0], this.INGRIDFlux[i] * INGRIDW * 1E-6]);

        ND280FN.data.push([p[0], this.ND280Flux[i] * 1E-6]);
        WAGASCIFN.data.push([p[0], this.WAGASCIFlux[i] * 1E-6]);
        INGRIDFN.data.push([p[0], this.INGRIDFlux[i] * 1E-6]);
      }
    }

    if (curve_state === 2) {
      plot.AddHover(combflux);
    } else if (curve_state === 1) {
      plot.ClearAll();
      plot.AddCurve(ND280FN);
      plot.AddCurve(WAGASCIFN);
      plot.AddCurve(INGRIDFN);

      plot.ShowNext(combflux);
      plot.AddCurve(ND280F);
      plot.AddCurve(WAGASCIF);
      plot.AddCurve(INGRIDF);
    } else {
      plot.AddCurve(combflux);
    }
  }

  Init() {

    this.InitializeConstraintControls();

    this.Widgets.NDCombPlot = new OscProbPlot();
    this.Widgets.NDCombPlot.DrawAxes(this.Widgets.NDCombPlot_El, 0, 3, -3, 5, "\\(\\textrm{Combined flux}\\)");

    this.Update();

    this.Controls.ND280_El.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.ND280_El.value);
      this.coeffs["ND280"] = chosen;
      this.Update();
    });
    this.Controls.WAGASCI_El.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.WAGASCI_El.value);
      this.coeffs["WAGASCI"] = chosen;
      this.Update();
    });
    this.Controls.INGRID_El.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.INGRID_El.value);
      this.coeffs["INGRID"] = chosen;
      this.Update();
    });
  }

  Update() {
    let coeffcopy = Object.create(this.coeffs);

    coeffcopy.point_class = this.color_class_wheel[this.wheel_idx];

    AddNewConstrainWidgetPoints(coeffcopy);

    this.Controls.ND280_El.value = this.coeffs["ND280"];
    this.Controls.WAGASCI_El.value = this.coeffs["WAGASCI"];
    this.Controls.INGRID_El.value = this.coeffs["INGRID"];

    this.AddCurve(this.Widgets.NDCombPlot, this.coeffs, 1);

  }

  InitializeConstraintControls() { // On click
    InitializeNDConstraintWidgets(
      this.Widgets.ConstraintControls,
      (chg_par) => {
        this.coeffs[chg_par.x_name] = chg_par.x_value
        this.coeffs[chg_par.y_name] = chg_par.y_value

        let coeffcopy = Object.create(this.coeffs);

        coeffcopy.point_class = this.color_class_wheel[this.wheel_idx];

        this.AddCurve(this.Widgets.NDCombPlot, coeffcopy, 1);

        this.Controls.ND280_El.value = this.coeffs["ND280"];
        this.Controls.WAGASCI_El.value = this.coeffs["WAGASCI"];
        this.Controls.INGRID_El.value = this.coeffs["INGRID"];

        return coeffcopy;
      },
      (chg_par) => { // On drag

        let coeffcopy = Object.create(this.coeffs);
        coeffcopy[chg_par.x_name] = chg_par.x_value
        coeffcopy[chg_par.y_name] = chg_par.y_value

        this.AddCurve(this.Widgets.NDCombPlot, coeffcopy, 2);
      },
      () => { // Off drag
        this.Widgets.NDCombPlot.RemoveHover();
      });
  }

};
