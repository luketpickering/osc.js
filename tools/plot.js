"use strict";

function RenderLatexLabel(text_d3, svg_d3, xwidth, ywidth, xoffset, yoffset,
  xscale = 1, yscale = 1, rotate = 0) {

  text_d3.attr("style", "visibility: hidden;");

  MathJax.Hub.setRenderer("SVG");
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, text_d3.node()]);
  MathJax.Hub.Queue([function() {
    let jax_svg = text_d3.select('span>svg');

    svg_d3.append("foreignObject")
      .attr("y", yoffset)
      .attr("x", xoffset)
      .attr("transform", `rotate(${rotate}) scale(${xscale},${yscale})`)
      .attr("width", xwidth)
      .attr("height", ywidth)
      .append(() => {
        return jax_svg.node();
      });
    text_d3.remove();
  }]);
}

class axisDescriptor {

  constructor(label, range, tickArguments = 4, cssclasses = ["label",]) {
    this.label = label;
    this.min = range[0];
    this.max = range[1];
    this.cssclasses = cssclasses;
    this.tickArguments = tickArguments;
  }

  setRenderProperties(xwidth, ywidth, xoffset, yoffset, xscale = 1, yscale = 1, rotate = 0) {
    this.xwidth = xwidth;
    this.ywidth = ywidth;
    this.xoffset = xoffset;
    this.yoffset = yoffset;
    this.xscale = xscale;
    this.yscale = yscale;
    this.rotate = rotate;
  }

  isLatexLabel() {
    return this.label.indexOf("\\(") != -1;
  }

  renderToSVG(svg) {
    if (this.isLatexLabel()) {
      RenderLatexLabel(
        svg.append("text").text(this.label),
        svg, this.xwidth, this.ywidth, this.xoffset, this.yoffset, this.xscale, this.yscale, this.rotate);
    } else {
      svg.append("text")
        .attr("transform", `rotate(${this.rotate}) scale(${this.xscale},${this.yscale})`)
        .attr("y", 0 - this.xoffset)
        .attr("x", 0 - this.yoffset)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(this.label);
    }
  }
};

class plotAxes {

  constructor() {}

  DrawAxes(el, axis_descriptors, axis_scales = [1, 1]) {
    this.width = 450;
    this.height = 350;
    this.margin = {
      top: 20,
      right: 20,
      bottom: 75,
      left: 95
    };
    this.tot_width = this.width + this.margin.left + this.margin.right;
    this.tot_height = this.height + this.margin.top + this.margin.bottom;

    let x_axis = axis_descriptors[0];
    let xScaleFactor = axis_scales[0];

    let y_axis = axis_descriptors[1];
    let yScaleFactor = axis_scales[1];

    let xScale =
      d3.scaleLinear()
      .domain([
        x_axis.min * xScaleFactor, x_axis.max * xScaleFactor
      ]) // input
      .range([0, this.width]); // output
    this.xScale = xScale;

    let yScale =
      d3.scaleLinear()
      .domain([
        y_axis.min * yScaleFactor, y_axis.max * yScaleFactor
      ]) // input
      .range([this.height, 0]); // output
    this.yScale = yScale;

    this.lineGen = d3.line()
      .x(function(d) {
        return xScale(d[0] * xScaleFactor);
      })
      .y(function(d) {
        return yScale(d[1] * yScaleFactor);
      });

    if (this.svg != undefined) {
      this.svg.remove();
    }

    this.svg = d3.select(el)
      .append("svg")
      .attr("width", this.tot_width)
      .attr("height", this.tot_height)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," +
        this.margin.top + ")");

    this.svg.append("g")
      .attr("class", `x_axis ${x_axis.cssclasses.join(" ")}`)
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(xScale).tickArguments([x_axis.tickArguments]));

    RenderLatexLabel(
      this.svg.append("text").text(x_axis.label),
      this.svg, "25ex", "10ex", this.width * 0.7, this.height * 1.1, 1, 1);


    this.svg.append("g")
      .attr("class", `y_axis ${y_axis.cssclasses.join(" ")}`)
      .call(d3.axisLeft(yScale).tickArguments([y_axis.tickArguments]));

    RenderLatexLabel(
      this.svg.append("text").text(
        y_axis.label),
      this.svg, "30ex", "10ex", -275, -65, 1, 1, -90);
  }


};

class histPlot extends plotAxes {

  constructor(el, axis_descriptors, axis_scales = [1, 1]) {
    super();
    this.HistPaths = [];
    this.Hists = [];

    this.yaxPadFraction = 1.2;
    this.yaxSymAboutZero = false;

    this.domElement = el;
    this.axis_descriptors = axis_descriptors;
    this.axis_scales = axis_scales;

    this.DrawAxes(this.domElement, this.axis_descriptors, this.axis_scales);
  }

  SetAutoYAxisProps(padfrac, SymAboutZero = false) {
    this.yaxPadFraction = padfrac;
    this.yaxSymAboutZero = SymAboutZero;
  }

  ForceRedraw() {
    this.DrawAxes(this.domElement, this.axis_descriptors, this.axis_scales);
    this.HistPaths = [];
    for (let i = 0; i < this.Hists.length; ++i) {
      this.DrawHist(i);
    }
  }

  AddHist(hist) {

    let histCopy = hist.Copy();

    if (hist.line_class == undefined) {
      histCopy.line_class = "line";
    } else {
      histCopy.line_class = hist.line_class;
    }

    this.Hists.push(histCopy);

    let needRedraw = false;

    let newHistYMaxPad = histCopy.ymax * this.yaxPadFraction;
    if (newHistYMaxPad > this.axis_descriptors[1].max) {
      this.axis_descriptors[1].max = newHistYMaxPad;
      needRedraw = true;
    }

    let newHistYMinPad = histCopy.ymin;
    if (newHistYMinPad < this.axis_descriptors[1].min) {
      if (newHistYMinPad < 0) {
        newHistYMinPad = newHistYMinPad * this.yaxPadFraction;
      }
      this.axis_descriptors[1].min = newHistYMinPad;
      needRedraw = true;
    }

    if (needRedraw) {
      this.ForceRedraw();
    } else {
      this.DrawHist(this.Hists.length-1);
    }

  }

  DrawHist(n) {
    if (n < 0) {
      return;
    }

    if (n > this.HistPaths.length) {
      return;
    }

    // console.log(this.Hists[n].GetPointList());

    this.HistPaths.push(this.svg.append("path")
      .attr("d", this.lineGen(GetPointList(this.Hists[n])))
      .attr("class", this.Hists[n].line_class));
  }

  ClearHist(n = 1) {
    if (n < 0) {
      return;
    }
    if (n > this.HistPaths.length) {
      n = this.HistPaths.length;
    }
    for (let i = this.HistPaths.length - n; i < this.HistPaths.length; ++i) {
      this.HistPaths[i].remove();
      this.HistPaths.splice(i,1);
      this.Hists.splice(i,1);
    }
  }

};
