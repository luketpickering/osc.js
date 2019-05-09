"use strict";

class oscapp {

  constructor() {

    this.oschelp = new OscHelper();
    this.OscParams = new OscParams();

    this.Widgets = {};
    this.Widgets.OscProbPlotEl = document.getElementById("OscProbPlot");
    this.Widgets.ConstraintControls = document.getElementById("ConstraintControls");

    this.Controls = {};
    this.Controls.OscProbPlotAddBtn = document.getElementById("add_btn");
    this.Controls.OscProbPlotClearBtn = document.getElementById("clear_btn");

    this.Controls.neutrino_selector = document.querySelector("#neutrino_selector");
    this.Controls.from_pdg_selector = document.querySelector("#from_pdg_selector");
    this.Controls.to_pdg_selector = document.querySelector("#to_pdg_selector");
    this.Controls.baseline_input = document.querySelector("#baseline_input");


    this.Controls.regfac_input = document.querySelector("#regfac_input");
    this.Controls.emin_input = document.querySelector("#emin_input");
    this.Controls.emax_input = document.querySelector("#emax_input");
    this.Controls.maxoffaxis_input = document.querySelector("#maxoffaxis_input");

    this.Expt = {};
    this.Expt.pdg_from = 14;
    this.Expt.pdg_to = 14;
    this.Expt.baseline_km = 1300;

    this.PRISM = {};
    this.PRISM.regfac = 1E-9;
    this.PRISM.emin_prism = 0;
    this.PRISM.emax_prism = 5;
    this.PRISM.maxoffaxis = 40;

    this.color_class_wheel = ["ColorWheel1","ColorWheel2","ColorWheel3","ColorWheel4","ColorWheel5"];
    this.wheel_idx = 0;

  }

  AddCurve(plot, params, curve_state = 0) {

    this.oschelp.SetOscillation(this.Expt.pdg_from, this.Expt.baseline_km, params);

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
      p[1] = this.oschelp.GetProb(p[0], this.Expt.pdg_to);
      if (!isNaN(p[1])) {
        osc_curve.data.push(p);
      }
    }

    if (curve_state === 2) {
      plot.AddHover(osc_curve);
    } else if (curve_state === 1) {
      let tool_tip_html = GetOscToolTipHTML(this.Expt.pdg_from, this.Expt.pdg_to, this.Expt.baseline_km, params);
      plot.ShowNext(osc_curve, tool_tip_html);
    } else {
      let tool_tip_html = GetOscToolTipHTML(this.Expt.pdg_from, this.Expt.pdg_to, this.Expt.baseline_km, params);
      plot.AddCurve(osc_curve, tool_tip_html);
    }

  }

  OscProbInit() {

    this.HookupExptControls();
    this.InitializeConstraintControls();
    this.HookupOscParamControls();

    this.Widgets.OscProbPlot = new OscProbPlot();
    this.Widgets.OscProbPlot.DrawAxes(this.Widgets.OscProbPlotEl, 0.1, 5);

    // AddCurve(op_plot, op, 1);
    //
    // let fluxhistplot_el = document.getElementById("FluxHistPlot");
    // let FD_numode_numu_flux = new flux_hist(DUNE_flux.FD.numode.numu.bins_e, DUNE_flux.FD.numode.numu.binc);
    //
    // let ND_numuode_numu_flux = new OffAxis_flux_hist(DUNE_flux.ND.numode.numu.bins_e, DUNE_flux.ND.numode.numu.bins_OA, DUNE_flux.ND.numode.numu.binc);
    //
    // let fp = new flux_plot();
    // let FD_numode_numu_flux_osc = FD_numode_numu_flux.Copy();
    // FD_numode_numu_flux_osc.line_class = "blue_line";
    // FD_numode_numu_flux.line_class = "red_line";
    // fp.DrawAxes(fluxhistplot_el, FD_numode_numu_flux, 1E15);
    // fp.Draw(FD_numode_numu_flux);
    // FD_numode_numu_flux_osc.Oscillate(pdg_from, pdg_to, baseline_km, op);
    // fp.Draw(FD_numode_numu_flux_osc);
    // let bfbinc = ND_numuode_numu_flux.flux_match(FD_numode_numu_flux_osc, regfac, emin_prism, emax_prism, maxoffaxis);
    // let bfflux = bfbinc.bf;
    // bfflux.line_class = "orange_line";
    // console.log(bfflux);
    // fp.Draw(bfflux);
    //
    // let lincombplot_el = document.getElementById("LinCombPlot");
    //
    // let lcp = new off_axis_lincomb_plot();
    // let lincomb = bfbinc.coeffs;
    // lincomb.line_class = "orange_line";
    // lcp.DrawAxes(lincombplot_el, lincomb, 1E5, 1);
    // lcp.Draw(lincomb);
    //
    // document.getElementById("oscflux_btn").onclick =
    //   function() {
    //     FD_numode_numu_flux_osc = FD_numode_numu_flux.Copy();
    //     FD_numode_numu_flux_osc.line_class = "blue_line";
    //     FD_numode_numu_flux_osc.Oscillate(pdg_from, pdg_to, baseline_km, op);
    //     fp.Clear(2);
    //     fp.Draw(FD_numode_numu_flux_osc);
    //     console.log("Min/Max: ", emin_prism, emax_prism);
    //     let bfbinc = ND_numuode_numu_flux.flux_match(FD_numode_numu_flux_osc, regfac, emin_prism, emax_prism, maxoffaxis);
    //     let bfflux = bfbinc.bf;
    //     bfflux.line_class = "orange_line";
    //     fp.Draw(bfflux);
    //
    //     lcp.Clear(1);
    //     let lincomb = bfbinc.coeffs;
    //     lincomb.line_class = "orange_line";
    //     lcp.Draw(lincomb);
    //   };
    //
  }

  NotifyExptChange() {
    console.log("this.Expt:");
    console.log(this.Expt);
  }

  HookupExptControls() {

    this.Controls.neutrino_selector.querySelectorAll("p").forEach((el) => {
      el.addEventListener("click", () => {
        let chosen = el.innerHTML;
        el.parentNode.parentNode.querySelector("button").innerHTML = chosen;

        let nutype = el.dataset.nutype;
        if (nutype === "nu") {
          this.Expt.pdg_from = Math.abs(this.Expt.pdg_from);
          this.Expt.pdg_to = Math.abs(this.Expt.pdg_to);
        } else if (nutype === "nubar") {
          this.Expt.pdg_from = -Math.abs(this.Expt.pdg_from);
          this.Expt.pdg_to = -Math.abs(this.Expt.pdg_to);
        }
        this.NotifyExptChange();
      });
    });

    this.Controls.from_pdg_selector.querySelectorAll("p").forEach((el) => {
      el.addEventListener("click", () => {
        el.parentNode.parentNode.querySelector("button").innerHTML = el.innerHTML;
        this.Expt.pdg_from = parseInt(el.dataset.nupdg);
        this.NotifyExptChange();
      });
    });

    this.Controls.to_pdg_selector.querySelectorAll("p").forEach((el) => {
      el.addEventListener("click", () => {
        el.parentNode.parentNode.querySelector("button").innerHTML = el.innerHTML;
        this.Expt.pdg_to = parseInt(el.dataset.nupdg);
        this.NotifyExptChange();
      });
    });

    this.Controls.baseline_input.addEventListener("change", () => {
      this.Expt.baseline_km = parseFloat(this.Controls.baseline_input.value);
      this.NotifyExptChange();
    });

  }

  NotifyOscParamChange() {
    this.AddCurve(this.Widgets.OscProbPlot, this.OscParams, 1);
  }

  InitializeConstraintControls() { // On click
    InitializeConstraintWidgets(this.Widgets.ConstraintControls, (chg_par) => {
      this.OscParams.Set(chg_par.xax_name, chg_par.xax_point);
      this.OscParams.Set(chg_par.yax_name, chg_par.yax_point);

      this.NotifyOscParamChange();
      let op_cpy = this.OscParams.Copy();
      op_cpy.point_class = this.color_class_wheel[this.wheel_idx];

      return op_cpy;
    }, (chg_par) => { // On drag
      let op_cpy = this.OscParams.Copy();
      op_cpy.Set(chg_par.xax_name, chg_par.xax_point);
      op_cpy.Set(chg_par.yax_name, chg_par.yax_point);

      this.AddCurve(this.Widgets.OscProbPlot, op_cpy, 2);
    }, () => { // Off drag
      this.Widgets.OscProbPlot.RemoveHover();
    });
  }

  HookupOscParamControls() {

    this.Controls.OscProbPlotAddBtn.addEventListener("click",
      () => {
        this.AddCurve(this.Widgets.OscProbPlot, this.OscParams, 0);
        this.wheel_idx = (this.wheel_idx+1)%this.color_class_wheel.length;
        SetConstrainWidgetPoints();
      });
    this.Controls.OscProbPlotClearBtn.addEventListener("click",
      () => {
        this.Widgets.OscProbPlot.ClearAll();
        this.wheel_idx = 0;
        ClearConstrainWidgetPoints();
      });
  }


  HookupPRISMControls() {
    this.Controls.regfac_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.regfac_input.value);
      regfac = chosen;
    });
    this.Controls.emin_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.emin_input.value);
      emin_prism = chosen;
    });
    this.Controls.emax_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.emax_input.value);
      emax_prism = chosen;
    });
    this.Controls.maxoffaxis_input.addEventListener("change", () => {
      let chosen = parseFloat(this.Controls.maxoffaxis_input.value);
      maxoffaxis = chosen;
    });

  }


};
