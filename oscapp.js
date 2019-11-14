"use strict";

class oscapp {

  constructor() {

    this.oschelp = new OscHelper();
    this.OscParams = new OscParams();

    this.Widgets = {};
    this.Widgets.OscProbPlot_mu_El = document.getElementById("OscProbPlot_mu");
    this.Widgets.OscProbPlot_e_El = document.getElementById("OscProbPlot_e");
    this.Widgets.OscProbPlot_tau_El = document.getElementById("OscProbPlot_tau");
    this.Widgets.ConstraintControls =
      document.getElementById("ConstraintControls");

    this.Widgets.PRISM = document.getElementById("PRISMItPlot");

    this.Controls = {};
    this.Controls.OscProbPlotAddBtn = document.getElementById("add_btn");
    this.Controls.OscProbPlotClearBtn = document.getElementById("clear_btn");

    this.Controls.neutrino_selector =
      document.getElementById("neutrino_selector");
    this.Controls.baseline_input = document.getElementById("baseline_input");

    this.Controls.mu_vis_btn = document.getElementById("mu_vis_btn");
    this.Controls.e_vis_btn = document.getElementById("e_vis_btn");
    this.Controls.tau_vis_btn = document.getElementById("tau_vis_btn");

    this.Controls.regfac_input = document.getElementById("regfac_input");
    this.Controls.emin_input = document.getElementById("emin_input");
    this.Controls.emax_input = document.getElementById("emax_input");
    this.Controls.maxoffaxis_input =
      document.getElementById("maxoffaxis_input");

    this.Expt = {};
    this.Expt.IsMatter = 1;
    this.Expt.pdg_from = 14;
    this.Expt.pdg_to = 14;
    this.Expt.baseline_km = 1300;

    this.PRISM = {};
    this.PRISM.regfac = 5E-9;
    this.PRISM.emin_prism = 0.5;
    this.PRISM.emax_prism = 3.5;
    this.PRISM.maxoffaxis = 33;

    this.color_class_wheel = [
      "ColorWheel1", "ColorWheel2", "ColorWheel3", "ColorWheel4", "ColorWheel5"
    ];
    this.wheel_idx = 0;
  }

  AddCurve(plot, Expt, params, curve_state = 0) {

    this.oschelp.SetOscillation(Expt.pdg_from, Expt.baseline_km, params);

    let osc_curve = {
      meta: {
        id: 0,
        name: "osc_curve"
      },
      data: [],
      line_class: this.color_class_wheel[this.wheel_idx]
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

    if (curve_state === 2) {
      plot.AddHover(osc_curve);
    } else if (curve_state === 1) {
      let tool_tip_html = GetOscToolTipHTML(Expt.pdg_from, Expt.pdg_to,
        Expt.baseline_km, params);
      plot.ShowNext(osc_curve, tool_tip_html);
    } else {
      let tool_tip_html = GetOscToolTipHTML(Expt.pdg_from, Expt.pdg_to,
        Expt.baseline_km, params);
      plot.AddCurve(osc_curve, tool_tip_html);
    }
  }

  OscProbInit() {

    this.HookupExptControls();
    this.InitializeConstraintControls();
    this.HookupOscParamControls();
    this.HookupPRISMControls();

    this.Widgets.OscProbPlot_mu = new OscProbPlot();
    this.Widgets.OscProbPlot_mu.DrawAxes(this.Widgets.OscProbPlot_mu_El, 0.1,
      5, 0, 1, "\\(P(\\nu_{\\mu}\\rightarrow\\nu_{\\mu})\\)");

    this.Widgets.OscProbPlot_e = new OscProbPlot();
    this.Widgets.OscProbPlot_e.DrawAxes(this.Widgets.OscProbPlot_e_El, 0.1, 5,
      0, 0.5, "\\(P(\\nu_{\\mu}\\rightarrow\\nu_{e})\\)");

    this.Widgets.OscProbPlot_tau = new OscProbPlot();
    this.Widgets.OscProbPlot_tau.DrawAxes(this.Widgets.OscProbPlot_tau_El, 0.1, 5, 0, 1, "\\(P(\\nu_{\\mu}\\rightarrow\\nu_{\\tau})\\)");

    this.Controls.mu_vis_btn.addEventListener("click", () => {
      if (this.Widgets.OscProbPlot_mu_El.style.display === "none") {
        this.Widgets.OscProbPlot_mu_El.style.display = "";
        this.Controls.mu_vis_btn.innerHTML = "Hide muon disappearance probability"
      } else {
        this.Widgets.OscProbPlot_mu_El.style.display = "none";
        this.Controls.mu_vis_btn.innerHTML = "Show muon disappearance probability"

      }
    });
    this.Controls.e_vis_btn.addEventListener("click", () => {
      if (this.Widgets.OscProbPlot_e_El.style.display === "none") {
        this.Widgets.OscProbPlot_e_El.style.display = "";
        this.Controls.e_vis_btn.innerHTML = "Hide electron appearance probability"
      } else {
        this.Widgets.OscProbPlot_e_El.style.display = "none";
        this.Controls.e_vis_btn.innerHTML = "Show electron appearance probability"

      }
    });
    this.Controls.tau_vis_btn.addEventListener("click", () => {
      if (this.Widgets.OscProbPlot_tau_El.style.display === "none") {
        this.Widgets.OscProbPlot_tau_El.style.display = "";
        this.Controls.tau_vis_btn.innerHTML = "Hide tau appearance probability"
      } else {
        this.Widgets.OscProbPlot_tau_El.style.display = "none";
        this.Controls.tau_vis_btn.innerHTML = "Show tau appearance probability"

      }
    });

  }

  NotifyExptChange() {
    this.NotifyOscParamChange();
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

  NotifyOscParamChange() {
    let expt = this.Expt;

    expt.pdg_to = 14 * expt.IsMatter;
    this.AddCurve(this.Widgets.OscProbPlot_mu, expt, this.OscParams, 1);
    expt.pdg_to = 12 * expt.IsMatter;
    this.AddCurve(this.Widgets.OscProbPlot_e, expt, this.OscParams, 1);
    expt.pdg_to = 16 * expt.IsMatter;
    this.AddCurve(this.Widgets.OscProbPlot_tau, expt, this.OscParams, 1);

    this.UpdatePRISM();
  }

  InitializeConstraintControls() { // On click
    InitializeConstraintWidgets(
      this.Widgets.ConstraintControls,
      (chg_par) => {
        this.OscParams.Set(chg_par.xax_name, chg_par.xax_point);
        this.OscParams.Set(chg_par.yax_name, chg_par.yax_point);

        this.NotifyOscParamChange();
        let op_cpy = this.OscParams.Copy();
        op_cpy.point_class = this.color_class_wheel[this.wheel_idx];

        return op_cpy;
      },
      (chg_par) => { // On drag
        let op_cpy = this.OscParams.Copy();
        op_cpy.Set(chg_par.xax_name, chg_par.xax_point);
        op_cpy.Set(chg_par.yax_name, chg_par.yax_point);

        let expt = this.Expt;

        expt.pdg_to = 14 * expt.IsMatter;
        this.AddCurve(this.Widgets.OscProbPlot_mu, expt, op_cpy, 2);
        expt.pdg_to = 12 * expt.IsMatter;
        this.AddCurve(this.Widgets.OscProbPlot_e, expt, op_cpy, 2);
        expt.pdg_to = 16 * expt.IsMatter;
        this.AddCurve(this.Widgets.OscProbPlot_tau, expt, op_cpy, 2);
      },
      () => { // Off drag
        this.Widgets.OscProbPlot_e.RemoveHover();
        this.Widgets.OscProbPlot_mu.RemoveHover();
      });
  }

  HookupOscParamControls() {

    this.Controls.OscProbPlotAddBtn.addEventListener("click", () => {
      let expt = this.Expt;

      expt.pdg_to = 14 * expt.IsMatter;
      this.AddCurve(this.Widgets.OscProbPlot_mu, expt, this.OscParams);
      expt.pdg_to = 12 * expt.IsMatter;
      this.AddCurve(this.Widgets.OscProbPlot_e, expt, this.OscParams);
      expt.pdg_to = 16 * expt.IsMatter;
      this.AddCurve(this.Widgets.OscProbPlot_tau, expt, this.OscParams);

      this.wheel_idx = (this.wheel_idx + 1) % this.color_class_wheel.length;
      SetConstrainWidgetPoints();
    });
    this.Controls.OscProbPlotClearBtn.addEventListener("click", () => {
      this.Widgets.OscProbPlot_e.ClearAll();
      this.Widgets.OscProbPlot_mu.ClearAll();
      this.Widgets.OscProbPlot_tau.ClearAll();
      this.wheel_idx = 0;
      ClearConstrainWidgetPoints();
    });
  }

  UpdatePRISM() {
    let OscFluxHist = OscillateHist1D(14, 14,
      1300, this.OscParams, this.PRISM.FD_numode_numu_flux);
    console.log(this.color_class_wheel[this.wheel_idx]);
    OscFluxHist.line_class = ["osc_line", this.color_class_wheel[this.wheel_idx]].join(" ");

    if (this.PRISM.PRISMItPlot.Hists.length > 1) {
      this.PRISM.PRISMItPlot.ClearHist();
      this.PRISM.PRISMItPlot.ClearHist();
    }

    this.PRISM.PRISMItPlot.AddHist(OscFluxHist);

    let flux_match_res = this.PRISM.fm.flux_match(OscFluxHist, this.PRISM.regfac,
      this.PRISM.emin_prism,
      this.PRISM.emax_prism,
      this.PRISM.maxoffaxis);

    flux_match_res.bf.line_class = "red_line";
    this.PRISM.PRISMItPlot.AddHist(flux_match_res.bf);

    flux_match_res.coeffs.line_class = "red_line";

    this.PRISM.coeffplot.ClearHist();
    this.PRISM.coeffplot.AddHist(flux_match_res.coeffs);

  }

  HookupPRISMControls() {


    this.Widgets.PRISMRow_el = document.getElementById("PRISMRow");
    this.Controls.prism_vis_btn = document.getElementById("prism_vis_btn");

    this.Controls.prism_vis_btn.addEventListener("click", () => {
      if (this.Widgets.PRISMRow_el.style.display === "none") {
        this.Widgets.PRISMRow_el.style.display = "";
        this.Controls.prism_vis_btn.innerHTML = "Hide PRISM"
      } else {
        this.Widgets.PRISMRow_el.style.display = "none";
        this.Controls.prism_vis_btn.innerHTML = "Show PRISM"

      }
    });

    this.Controls.regfac_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.regfac_input.value);
      this.PRISM.regfac = chosen;
      this.UpdatePRISM();
    });
    this.Controls.emin_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.emin_input.value);
      if (chosen > this.PRISM.emax_prism) {
        chosen = this.PRISM.emax_prism;
      } else if (chosen < 0) {
        chosen = 0;
      }
      this.Controls.emin_input.value = chosen;
      this.PRISM.emin_prism = chosen;
      this.UpdatePRISM();
    });
    this.Controls.emax_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.emax_input.value);
      if (chosen > 5) {
        chosen = 5;
      } else if (chosen < 0) {
        chosen = 0;
      }
      this.Controls.emax_input.value = chosen;
      this.PRISM.emax_prism = chosen;
      this.UpdatePRISM();
    });
    this.Controls.maxoffaxis_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.maxoffaxis_input.value);
      if (chosen > 33) {
        chosen = 33;
      } else if (chosen < 0) {
        chosen = 0;
      }
      this.Controls.maxoffaxis_input.value = chosen;
      this.PRISM.maxoffaxis = chosen;
      this.UpdatePRISM();
    });

    this.PRISM.PRISMItPlot_el = document.getElementById("PRISMItPlot");

    this.PRISM.FD_numode_numu_flux = new hist1D(DUNE_flux.FD.numode.numu.bins_e,
      DUNE_flux.FD.numode.numu.binc);
    this.PRISM.FD_numode_numu_flux.line_class = "grey_line";

    this.PRISM.ND_numuode_numu_flux = new
      hist2D(DUNE_flux.ND.numode.numu.bins_e,
        DUNE_flux.ND.numode.numu.bins_OA, DUNE_flux.ND.numode.numu.binc);

    this.PRISM.fm = new flux_matcher(this.PRISM.ND_numuode_numu_flux);

    this.PRISM.PRISMItPlot = new histPlot(this.PRISM.PRISMItPlot_el, [new axisDescriptor("\\(\\it{E}_{\\nu} (\\textrm{GeV})\\)", [0, 5]), new axisDescriptor("\\(\\Phi_{\\nu}^{\\textrm{FD}} \\times 10^{15} (\\textrm{cm}^{-2} \\textrm{/GeV/POT})\\)", [0, this.PRISM.FD_numode_numu_flux.ymax * 1.2])], [1, 1E15]);

    this.PRISM.PRISMItPlot.AddHist(this.PRISM.FD_numode_numu_flux);

    this.PRISM.coeffplot_el = document.getElementById("PRISMItPlot");

    this.PRISM.coeffplot = new histPlot(this.PRISM.coeffplot_el, [new axisDescriptor("\\(\\textrm{Off axis position (m)}\\)", [-0.5, 33.5]), new axisDescriptor("\\(\\textrm{Sample weight} \\times 10^{7}\\)", [-3E-7, 3E-7])], [1, 1E7]);

  }
};
