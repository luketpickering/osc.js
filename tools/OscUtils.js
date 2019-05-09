"use strict";

function myfmod(a, b) {
  return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
};

/// Helper class for wrapping up the Prob3.js BargerPropagator into a slightly more easy-to-use interface (set experimental/osc parameters once, identify neutrinos with pdg numbers rather than Prob3++ enum, ...)
class OscHelper {
  constructor() {
    this.bp = new BargerPropagator();
    this.nufrom = 0;
  }

  static GetProb3NuTypeFromPDG(pdg) {
    if (pdg === 12) {
      return 1;
    } else if (pdg === 14) {
      return 2;
    } else if (pdg === 16) {
      return 3;
    } else if (pdg === -12) {
      return -1;
    } else if (pdg === -14) {
      return -2;
    } else if (pdg === -16) {
      return -3;
    } else {
      console.log(`Invalid neutrino pdg: ${pdg}`);
      return 0;
    }
  }

  SetOscillation(nu_pdg_from, baseline_km, osc_params, density_g_cm3 = 3.3) {
    this.nufrom = OscHelper.GetProb3NuTypeFromPDG(nu_pdg_from);
    if (this.nufrom === 0) {
      return;
    }
    this.bp.SetMNS(osc_params.S2Th12, osc_params.S2Th13, osc_params.S2Th23,
      osc_params.Dm2_21, osc_params.Dm2_Atm, osc_params.dcp, 1,
      true, this.nufrom);

    this.baseline_km = baseline_km;
    this.density_g_cm3 = density_g_cm3;
  }

  GetProb(Energy_GeV, nu_pdg_to) {
    let nuto = OscHelper.GetProb3NuTypeFromPDG(nu_pdg_to);
    if ((this.nufrom === 0) || (nuto === 0) ||
      !((nuto < 0) == (this.nufrom < 0))) {
      return 0;
    }
    this.bp.SetEnergy(Energy_GeV);
    this.bp.propagateLinear(this.nufrom, this.baseline_km, this.density_g_cm3);
    return this.bp.GetProb(this.nufrom, nuto);
  }
};

///Helper class for wrapping blob of oscillation parameters
class OscParams {
  constructor() {
    this.S2Th12 = 0.297;
    this.S2Th13 = 0.0214;
    this.S2Th23 = 0.534;

    this.Dm2_21 = 7.37E-5;
    this.Dm2_Atm = 2.539E-3;

    this.dcp = 0;
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

  Set(name, value) {
    if (name === "Dm2_Atm") {
      this.Dm2_Atm = value;
    } else if (name === "S2Th23") {
      this.S2Th23 = value;
    } else if (name === "S2Th13") {
      this.S2Th13 = value;
    } else if (name === "dcp") {
      this.dcp = myfmod(value, 2 * Math.PI);
      if (this.dcp < -Math.PI) {
        this.dcp = (this.dcp + 2 * Math.PI);
      }
      if (this.dcp > Math.PI) {
        this.dcp = (this.dcp - 2 * Math.PI);
      }
    } else if (name === "dcp_mpi_pi") {
      this.dcp = value;
    } else if (name === "dcp_0_2pi") {
      this.dcp = value;
      if (this.dcp > Math.PI) {
        this.dcp = (this.dcp - 2 * Math.PI);
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
    } else if (name === "dcp_mpi_pi") {
      return this.dcp;
    } else if (name === "dcp_0_2pi") {
      let rtn = this.dcp;
      if (rtn < 0) {
        rtn = (2 * Math.PI + rtn);
      }
      return rtn;
    }
  }

};


function GetNuLatexName(nu_pdg) {
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

function GetParamLatexName(name) {
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


function GetOscToolTipHTML(pdg_from, pdg_to, baseline, params) {
  return `<div>From: ${GetNuLatexName(pdg_from)}</div>
          <div>To: ${GetNuLatexName(pdg_to)}</div>
          <div>Baseline: ${baseline} km</div>
          <div>${GetParamLatexName("S2Th12")}: ${params.S2Th12.toPrecision(3)}</div>
          <div>${GetParamLatexName("S2Th13")}: ${params.S2Th13.toExponential(3)}</div>
          <div>${GetParamLatexName("S2Th23")}: ${params.S2Th23.toPrecision(3)}</div>
          <div>${GetParamLatexName("Dm2_21")}: ${params.Dm2_21.toExponential(3)} eV</div>
          <div>${GetParamLatexName("Dm2_Atm")}: ${params.Dm2_Atm.toExponential(3)} eV</div>
          <div>${GetParamLatexName("dcp")}: ${params.dcp.toPrecision(3)}</div>`;
}

function OscillateHist1D(nu_pdg_from, nu_pdg_to, baseline_km, oscParams, hist) {
  let osc_help = new OscHelper();
  osc_help.SetOscillation(nu_pdg_from, baseline_km, oscParams);

  let osc_hist = hist.Copy();

  for (let bi_it = 0; bi_it < osc_hist.bincontent.length; ++bi_it) {

    let bin_E_low = osc_hist.x_bins[bi_it];
    let bin_E_up = osc_hist.x_bins[bi_it + 1];
    let E_step = (bin_E_up - bin_E_low) / 10.0;

    let prob_sum = 0;

    for (let e_it = 0; e_it < 10; ++e_it) {
      prob_sum +=
        osc_help.GetProb(bin_E_low + (e_it + 0.5) * E_step, nu_pdg_to);
    }
    prob_sum /= 10.0;

    osc_hist.bincontent[bi_it] *= prob_sum;
  }

  return osc_hist;
}
