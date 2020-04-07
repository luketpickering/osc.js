"use strict";

const kUNKNOWN = 0;
const kPLOTS = 1;
const kTABLE = 2;

class oscapp {

  constructor() {

    this.oschelp = new OscHelper();

    this.Widgets = {};
    this.Widgets.OscProbPlot_mu_El = document.getElementById("OscProbPlot_mu");
    this.Widgets.ConstraintControls =
        document.getElementById("ConstraintControls");
    this.Widgets.OscParamTable = document.getElementById("OscParamTable");

    this.Controls = {};
    this.Controls.OscProbPlotAddBtn = document.getElementById("add_btn");
    this.Controls.OscProbPlotClearBtn = document.getElementById("clear_btn");

    this.Controls.neutrino_selector =
        document.getElementById("neutrino_selector");
    this.Controls.baseline_input = document.getElementById("baseline_input");

    this.Expt = {};
    this.Expt.IsMatter = 1;
    this.Expt.pdg_from = 14;
    this.Expt.pdg_to = 14;
    this.Expt.baseline_km = 1300;
  }

  AddCurve(plot, Expt, params, index) {
    
    this.oschelp.SetOscillation(Expt.pdg_from, Expt.baseline_km, params);

    let osc_curve = {
      meta : {id : index, name : "osc_curve"},
      data : [],
    };

    let EMin = 0;
    let EMax = 5;
    let ESteps = 1000;

    let EStep = (EMax - EMin) / ESteps;

    for (let i = 0; i < ESteps; ++i) {
      let p = [];
      p[0] = EMin + i * EStep;
      p[1] = this.oschelp.GetProb(p[0], Expt.pdg_to);
      if (!isNaN(p[1])) {
        osc_curve.data.push(p);
      }
    }

    plot.SetCurve(index, osc_curve);
  }

  OscProbInit() {

    this.HookupExptControls();
    this.InitializeConstraintControls();
    this.HookupOscParamControls();

    this.Widgets.OscProbPlot_mu = new OscProbPlot();
    this.Widgets.OscProbPlot_mu.DrawAxes(
        this.Widgets.OscProbPlot_mu_El, 0.1, 5, 0, 1,
        "\\(P(\\nu_{\\mu}\\rightarrow\\nu_{\\mu})\\)");

    this.NotifyOscParamChange(0, new OscParams(), kUNKNOWN);
  }

  NotifyExptChange() {
    this.Widgets.OscProbPlot_mu.ClearAll();

    for (let [key, value] of Object.entries(GetAllChosenParameters())) {
      let idx = parseInt(key);
      this.AddCurve(this.Widgets.OscProbPlot_mu, this.Expt, value, idx);
    }
  }

  HookupExptControls() {

    this.Controls.neutrino_selector.querySelectorAll("p").forEach((el) => {
      el.addEventListener("click", () => {
        let chosen = el.innerHTML;
        el.parentNode.parentNode.querySelector("button").innerHTML = chosen;

        let nutype = el.dataset.nutype;
        if (nutype === "nu") {
          this.Expt.IsMatter = 1;
          this.Expt.pdg_from = Math.abs(this.Expt.pdg_from);
          this.Expt.pdg_to = Math.abs(this.Expt.pdg_to);
        } else if (nutype === "nubar") {
          this.Expt.IsMatter = -1;
          this.Expt.pdg_from = -Math.abs(this.Expt.pdg_from);
          this.Expt.pdg_to = -Math.abs(this.Expt.pdg_to);
        }
        this.NotifyExptChange();
      });
    });

    this.Controls.baseline_input.addEventListener("change", () => {
      this.Expt.baseline_km = parseFloat(this.Controls.baseline_input.value);
      this.NotifyExptChange();
    });
  }

  NotifyOscParamChange(idx, osc_params, notifier) {
    let expt = this.Expt;

    expt.pdg_to = 14 * expt.IsMatter;
    this.AddCurve(this.Widgets.OscProbPlot_mu, expt, osc_params, idx);

    SetConstraintWidgetPoints(idx, osc_params);
    if (notifier != kTABLE) { // Don't update table row as you are changing it
      SetOscParamRow(idx, osc_params);
    }
  }

  RemoveOscParamIndex(idx) {
    ClearConstrainWidgetPoint(idx);
    ClearOscParamRow(idx);
    this.Widgets.OscProbPlot_mu.RemoveCurve(idx);
  }

  InitializeConstraintControls() { // On click
    InitializeConstraintWidgets(
        this.Widgets.ConstraintControls,
        (idx, chg_par) => { this.NotifyOscParamChange(idx, chg_par, kPLOTS); });

    InitializeOscParamTable(
        this.Widgets.OscParamTable,
        (idx, chg_par) => { this.NotifyOscParamChange(idx, chg_par, kTABLE); },
        (idx) => {this.RemoveOscParamIndex(idx)},
        (idx) => {ConstraintWidgetSetIndex(idx)});
  }

  HookupOscParamControls() {

    this.Controls.OscProbPlotAddBtn.addEventListener("click", () => {
      let NI = IncrementConstrainWidgetNPoints();
      this.NotifyOscParamChange(NI, new OscParams());
    });

    this.Controls.OscProbPlotClearBtn.addEventListener("click", () => {
      this.Widgets.OscProbPlot_mu.ClearAll();
      ClearConstrainWidgetPoints();
      ClearOscParamRows();
    });
  }
};
