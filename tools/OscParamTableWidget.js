"use strict";

class OscParamTable {
  constructor() {
    this.rows = [];
    this.osc_params = [];
  }

  Initialize(el, onchanged_callback, onremoved_callback, onsetindex_callback) {

    this.table = d3.select(el).append("table").classed("table", true);
    let headerr = this.table.append("thead").append("tr");

    headerr.append("th")
        .attr("scope", "col")
        .append("button")
        .attr("type", "button")
        .attr("class", "btn btn-outline-primary btn-sm")
        .attr("style", "visibility:hidden;")
        .text("Remove");
    headerr.append("th")
        .attr("scope", "col")
        .append("button")
        .attr("type", "button")
        .attr("class", "btn btn-outline-primary btn-sm")
        .attr("style", "visibility:hidden;")
        .text("Edit");
    headerr.append("th")
        .attr("scope", "col")
        .text(GetParamLatexName("Dm2_Atm_pere3"));
    headerr.append("th")
        .attr("scope", "col")
        .text(GetParamLatexName("Dm2_Sol_pere5"));
    headerr.append("th").attr("scope", "col").text(GetParamLatexName("S2Th23"));
    headerr.append("th").attr("scope", "col").text(GetParamLatexName("S2Th13"));
    headerr.append("th").attr("scope", "col").text(GetParamLatexName("S2Th12"));
    headerr.append("th")
        .attr("scope", "col")
        .text(GetParamLatexName("dcp_perpi"));

    MathJax.Hub.Queue([ "Typeset", MathJax.Hub, headerr.node() ]);

    this.table_body = this.table.append("tbody");
    this.onchanged_callback = onchanged_callback;
    this.onremoved_callback = onremoved_callback;
    this.onsetindex_callback = onsetindex_callback;
  }

  SetOscParamRow(i, osc_params) {

    if (this.rows.length <= i) {
      this.rows.length = i + 1;
      this.osc_params.length = i + 1;
    }

    if (this.rows[i] === undefined) {
      this.rows[i] = this.table_body.append("tr");
    } else {
      this.rows[i].selectAll("td").remove();
    }

    this.osc_params[i] = osc_params;

    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .append("button")
        .attr("type", "button")
        .attr("class", "btn btn-outline-primary btn-sm")
        .text("Remove")
        .on("click", () => {
          this.ClearRow(i);
          this.onremoved_callback(i);
        });
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .append("button")
        .attr("type", "button")
        .attr("class", "btn btn-outline-primary btn-sm")
        .text("Edit")
        .on("click", () => { this.onsetindex_callback(i); });
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .classed("oscpar", true)
        .classed(`ColorWheel-${i + 1}`, true)
        .attr("contenteditable", "true")
        .attr("data-oscpar", "Dm2_Atm_pere3")
        .attr("data-index", i)
        .text(osc_params.GetPrecision("Dm2_Atm_pere3", 3));
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .classed("oscpar", true)
        .classed(`ColorWheel-${i + 1}`, true)
        .attr("contenteditable", "true")
        .attr("data-oscpar", "Dm2_Sol_pere5")
        .attr("data-index", i)
        .text(osc_params.GetPrecision("Dm2_Sol_pere5", 3));
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .classed("oscpar", true)
        .classed(`ColorWheel-${i + 1}`, true)
        .attr("contenteditable", "true")
        .attr("data-oscpar", "S2Th23")
        .attr("data-index", i)
        .text(osc_params.GetPrecision("S2Th23", 3));
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .classed("oscpar", true)
        .classed(`ColorWheel-${i + 1}`, true)
        .attr("contenteditable", "true")
        .attr("data-oscpar", "S2Th13")
        .attr("data-index", i)
        .text(osc_params.GetPrecision("S2Th13", 3));
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .classed("oscpar", true)
        .classed(`ColorWheel-${i + 1}`, true)
        .attr("contenteditable", "true")
        .attr("data-oscpar", "S2Th12")
        .attr("data-index", i)
        .text(osc_params.GetPrecision("S2Th12", 3));
    this.rows[i]
        .append("td")
        .attr("scope", "col")
        .classed("oscpar", true)
        .classed(`ColorWheel-${i + 1}`, true)
        .attr("contenteditable", "true")
        .attr("data-oscpar", "dcp_perpi")
        .attr("data-index", i)
        .text(osc_params.GetPrecision("dcp_perpi", 3));

    let widget = this;
    this.rows[i].selectAll("td.oscpar").on("input", function() {
      let el = d3.select(this);
      let oscpar = this.getAttribute("data-oscpar");
      let index = parseInt(this.getAttribute("data-index"));

      let cdivs = el.selectAll("div");

      let val = 0;

      if (cdivs.length) {
        val = cdivs[0].text();
      } else {
        val = parseFloat(el.text());
      }
      if (!isNaN(val)) {
        widget.osc_params[index].Set(oscpar, val);
        widget.onchanged_callback(index, widget.osc_params[index]);
      }
    });
  }

  Clear() {
    this.table_body.selectAll("tr").remove();
    this.rows = [];
    this.osc_params = [];
  }

  AddNewRow() {
    this.rows.length = this.rows.length + 1;
    this.osc_params.length = i + 1;
  }
  ClearRow(i) {
    if (this.rows.length > i) {
      if (this.rows[i] != undefined) {
        this.rows[i].remove();
      }
      this.osc_params[i] = undefined;
    }
  }
};

var op_table = undefined;

function InitializeOscParamTable(el, onchanged_callback, onremoved_callback,
                                 onsetindex_callback) {
  op_table = new OscParamTable();

  op_table.Initialize(el, onchanged_callback, onremoved_callback,
                      onsetindex_callback);
}

function SetOscParamRow(index, pp) { op_table.SetOscParamRow(index, pp); }
function ClearOscParamRow(index) { op_table.ClearRow(index); }
function ClearOscParamRows() { op_table.Clear(); }