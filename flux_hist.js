class flux_hist {
  constructor(e_bins, bincontent) {
    if (e_bins.length != (bincontent.length + 1)) {
      console.log(`Failed to build new histogram as e_bins.length: ${
          e_bins.length} != bincontent.length+1: ${(bincontent.length + 1)}`);
      return;
    }

    this.e_bins = Array.from(e_bins);
    this.bincontent = Array.from(bincontent);

    this.xmin = this.e_bins[0];
    this.xmax = this.e_bins[this.e_bins.length - 1];

    this.ymin = 0;
    this.ymax = 0;

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {

      if (this.bincontent[bi_it] > this.ymax) {
        this.ymax = this.bincontent[bi_it];
      }
    }
  }

  Copy() { return new flux_hist(this.e_bins, this.bincontent); }

  Oscillate(nu_pdg_from, nu_pdg_to, baseline_km, oscParams) {
    oschelp = new OscHelper();

    oschelp.SetOscillation(nu_pdg_from, baseline_km, oscParams);

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {

      let bin_E_low = this.e_bins[bi_it];
      let bin_E_up = this.e_bins[bi_it + 1];
      let E_step = (bin_E_up - bin_E_low) / 10.0;

      let prob_sum = 0;

      for (let e_it = 0; e_it < 10; ++e_it) {
        prob_sum +=
            oschelp.GetProb(bin_E_low + (e_it + 0.5) * E_step, nu_pdg_to);
      }
      prob_sum /= 10.0;

      this.bincontent[bi_it] *= prob_sum;
    }
  }

  Add(Other) {
    if (this.bincontent != other.bincontent.length) {
      return;
    }

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {
      this.bincontent[bi_it] += other.bincontent[bi_it];
    }
  }

  GetPointList() {
    let points = [];

    points.push([ this.e_bins[0], 0 ]);

    for (let bi_it = 0; bi_it < (this.e_bins.length - 1); ++bi_it) {
      points.push([ this.e_bins[bi_it], this.bincontent[bi_it] ]);
      points.push([ this.e_bins[bi_it + 1], this.bincontent[bi_it] ]);
    }

    points.push([ this.e_bins[this.e_bins.length - 1], 0 ]);

    return points;
  }
};

class OffAxis_flux_hist {
  constructor(e_bins, oa_bins, bincontent) {
    if (oa_bins.length != (bincontent.length + 1)) {
      console.log(`Failed to build new histogram as oa_bins.length: ${
          oa_bins.length} != bincontent.length+1: ${(bincontent.length + 1)}`);
      return;
    }
    if (e_bins.length != (bincontent[0].length + 1)) {
      console.log(`Failed to build new histogram as e_bins.length: ${
          e_bins.length} != bincontent[0].length+1: ${
          (bincontent[0].length + 1)}`);
      return;
    }

    this.e_bins = Array.from(e_bins);
    this.oa_bins = Array.from(oa_bins);
    this.mat = lalolib.transpose(lalolib.array2mat(bincontent));
  }

  flux_match(target) {

    if (target.bincontent.length != this.mat.m) {
      console.log(`Cannot perform flux match. ND EBin count = ${
          this.mat.m}, FD EBin count = ${target.bincontent.length}`);
      return;
    }

    let bigfac = 1E15;
    let regfac = 1E-9;
    let targetvec = lalolib.array2vec(target.bincontent);
    let bigmat = lalolib.entrywisemul(this.mat, bigfac);
    targetvec = lalolib.entrywisemul(targetvec, bigfac);
    let RHS = lalolib.mul(lalolib.transpose(bigmat), targetvec);

    // make the penalty matrix
    // there is probably a better way to do this
    // e.g., off-diag  
    let A = lalolib.eye(bigmat.n);
    for ( let i = 0; i < A.m; i++ ) {
    	for ( let j = 0; j < A.n; j++ ) {
    	    if ( i == j - 1 ) {
    		A[i, j] = -1;
    	    }
    	}
    }
      
    A = lalolib.entrywisemul(A, bigfac*regfac);
    let LHS = lalolib.add(lalolib.xtx(bigmat), lalolib.xtx(A));
    let result = lalolib.solve(LHS, RHS);
    return { bf: lalolib.mul(this.mat, result), coeffs: result };
  }
};

class flux_plot {

  constructor() { this.Hists = []; }

  DrawAxes(el, axes_ranges, yScaleFactor = 1, xScaleFactor = 1) {
    this.width = 450;
    this.height = 350;
    this.margin = {top : 20, right : 20, bottom : 75, left : 95};
    this.tot_width = this.width + this.margin.left + this.margin.right;
    this.tot_height = this.height + this.margin.top + this.margin.bottom;

    let xScale =
        d3.scaleLinear()
            .domain([
              axes_ranges.xmin * xScaleFactor, axes_ranges.xmax * xScaleFactor
            ])                         // input
            .range([ 0, this.width ]); // output
    this.xScale = xScale;

    let yScale =
        d3.scaleLinear()
            .domain([
              axes_ranges.ymin * yScaleFactor, axes_ranges.ymax * yScaleFactor
            ])                          // input
            .range([ this.height, 0 ]); // output
    this.yScale = yScale;

    this.lineGen = d3.line()
                       .x(function(d) { return xScale(d[0] * xScaleFactor); })
                       .y(function(d) { return yScale(d[1] * yScaleFactor); });

    this.svg = d3.select(el)
                   .append("svg")
                   .attr("width", this.tot_width)
                   .attr("height", this.tot_height)
                   .append("g")
                   .attr("transform", "translate(" + this.margin.left + "," +
                                          this.margin.top + ")");

    this.svg.append("g")
        .attr("class", "x_axis biglabel")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(xScale).tickArguments([ 5 ]));

    RenderLatexLabel(
        this.svg.append("text").text("\\(E_{\\nu} \\textrm{(GeV)}\\)"),
        this.svg, "25ex", "10ex", this.width * 0.75, this.height * 1.1, 1, 1);

    this.svg.append("g")
        .attr("class", "y_axis biglabel")
        .call(d3.axisLeft(yScale).tickArguments([ 3 ]));

    RenderLatexLabel(
        this.svg.append("text").text(
            "\\(\\Phi \\times{}10^{15} \\textrm{cm}^{-2}/\\textrm{POT}\\)"),
        this.svg, "25ex", "10ex", -225, -65, 1, 1, -90);
  }

  Draw(flux_h) {
    let lineclass = flux_h.line_class;
    if (lineclass == undefined) {
      lineclass = "line";
    }

    this.Hists.push(this.svg.append("path")
                        .attr("d", this.lineGen(flux_h.GetPointList()))
                        .attr("class", lineclass));
  }
  Clear(n = 1) {
    if (n <= 0) {
      return;
    }
    if (n > this.Hists.length) {
      n = this.Hists.length;
    }
    for (let i = this.Hists.length - n; i < this.Hists.length; ++i) {
      this.Hists[i].remove();
    }
  }
};

class off_axis_lincomb_plot {

  constructor() { this.Hists = []; }

  DrawAxes(el, axes_ranges, yScaleFactor = 1, xScaleFactor = 1) {
    this.width = 300;
    this.height = 250;
    this.margin = {top : 20, right : 20, bottom : 75, left : 95};
    this.tot_width = this.width + this.margin.left + this.margin.right;
    this.tot_height = this.height + this.margin.top + this.margin.bottom;

    let xScale =
        d3.scaleLinear()
            .domain([
              axes_ranges.xmin * xScaleFactor, axes_ranges.xmax * xScaleFactor
            ])                         // input
            .range([ 0, this.width ]); // output
    this.xScale = xScale;

    let yScale =
        d3.scaleLinear()
            .domain([
              -axes_ranges.ymax * yScaleFactor, axes_ranges.ymax * yScaleFactor
            ])                          // input
            .range([ this.height, 0 ]); // output
    this.yScale = yScale;

    this.lineGen = d3.line()
                       .x(function(d) { return xScale(d[0] * xScaleFactor); })
                       .y(function(d) { return yScale(d[1] * yScaleFactor); });

    this.svg = d3.select(el)
                   .append("svg")
                   .attr("width", this.tot_width)
                   .attr("height", this.tot_height)
                   .append("g")
                   .attr("transform", "translate(" + this.margin.left + "," +
                                          this.margin.top + ")");

    this.svg.append("g")
        .attr("class", "x_axis biglabel")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(xScale).tickArguments([ 5 ]));

    RenderLatexLabel(
        this.svg.append("text").text("\\(\\textrm{Off axis position (m)}\\)"),
        this.svg, "25ex", "10ex", this.width * 0.3, this.height * 1.15, 1, 1);

    this.svg.append("g")
        .attr("class", "y_axis biglabel")
        .call(d3.axisLeft(yScale).tickArguments([ 3 ]));

    RenderLatexLabel(
        this.svg.append("text").text("\\(\\textrm{Sample weight}\\)"), this.svg,
        "25ex", "10ex", -160, -80, 1, 1, -90);
  }

  Draw(flux_h) {
    let lineclass = flux_h.line_class;
    if (lineclass == undefined) {
      lineclass = "line";
    }

    this.Hists.push(this.svg.append("path")
                        .attr("d", this.lineGen(flux_h.GetPointList()))
                        .attr("class", lineclass));
  }
  Clear(n = 1) {
    if (n <= 0) {
      return;
    }
    if (n > this.Hists.length) {
      n = this.Hists.length;
    }
    for (let i = this.Hists.length - n; i < this.Hists.length; ++i) {
      this.Hists[i].remove();
    }
  }
};
