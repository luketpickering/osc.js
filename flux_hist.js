class flux_hist {
  constructor(bins, bincontent) {
    if (bins.length != (bincontent.length + 1)) {
      console.log(`Failed to build new histogram as bins.length: ${
          bins.length} != bincontent.length+1: ${(bincontent.length + 1)}`);
      return;
    }

    this.bins = Array.from(bins);
    this.bincontent = Array.from(bincontent);

    this.xmin = this.bins[0];
    this.xmax = this.bins[this.bins.length - 1];

    this.ymin = 0;
    this.ymax = 0;

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {

      if (this.bincontent[bi_it] > this.ymax) {
        this.ymax = this.bincontent[bi_it];
      }
    }
  }

  Copy() { return new flux_hist(this.bins, this.bincontent); }

  Oscillate(nu_pdg_from, nu_pdg_to, baseline_km, oscParams) {
    oschelp = new OscHelper();

    oschelp.SetOscillation(nu_pdg_from, baseline_km, oscParams);

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {

      let bin_E_low = this.bins[bi_it];
      let bin_E_up = this.bins[bi_it + 1];
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

    points.push([ this.bins[0], 0 ]);

    for (let bi_it = 0; bi_it < (this.bins.length - 1); ++bi_it) {
      points.push([ this.bins[bi_it], this.bincontent[bi_it] ]);
      points.push([ this.bins[bi_it + 1], this.bincontent[bi_it] ]);
    }

    points.push([ this.bins[this.bins.length - 1], 0 ]);

    return points;
  }
};

class flux_plot {

  constructor() { this.Hists = []; }

  DrawAxes(el, flux_h, yScaleFactor = 1) {
    this.width = 300;
    this.height = 200;
    this.margin = {top : 20, right : 20, bottom : 75, left : 95};
    this.tot_width = this.width + this.margin.left + this.margin.right;
    this.tot_height = this.height + this.margin.top + this.margin.bottom;

    let xScale = d3.scaleLinear()
                     .domain([ flux_h.xmin, flux_h.xmax ]) // input
                     .range([ 0, this.width ]);            // output
    this.xScale = xScale;

    let yScale = d3.scaleLinear()
                     .domain([
                       flux_h.ymin * yScaleFactor, flux_h.ymax * yScaleFactor
                     ])                          // input
                     .range([ this.height, 0 ]); // output
    this.yScale = yScale;

    this.lineGen = d3.line()
                       .x(function(d) { return xScale(d[0]); })
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
        this.svg, "25ex", "10ex", this.width * 0.6, this.height * 1.15, 1, 1);

    this.svg.append("g")
        .attr("class", "y_axis biglabel")
        .call(d3.axisLeft(yScale).tickArguments([ 3 ]));

    RenderLatexLabel(this.svg.append("text").text(
                         "\\(\\Phi \\times{}10^{15} \\textrm{cm}^{-2}/\\textrm{POT}\\)"),
                     this.svg, "25ex", "10ex", -200, -65, 1, 1, -90);
  }

  Draw(el, flux_h, scale = 1) {
    if (this.svg == undefined) {
      this.DrawAxes(el, flux_h, scale);
    }

    let lineclass = flux_h.line_class;
    if (lineclass == undefined) {
      lineclass = "line";
    }

    this.Hists.push(this.svg.append("path")
                        .attr("d", this.lineGen(flux_h.GetPointList()))
                        .attr("class", lineclass));
  }
};
