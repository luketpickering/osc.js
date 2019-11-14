"use strict";

class hist1D {
  constructor(x_bins, bincontent) {
    if (x_bins.length != (bincontent.length + 1)) {
      console.log(`Failed to build new histogram as x_bins.length: ${x_bins.length} != bincontent.length+1: ${(bincontent.length + 1)}`);
      return;
    }

    this.x_bins = Array.from(x_bins);
    this.bincontent = Array.from(bincontent);

    this.xmin = this.x_bins[0];
    this.xmax = this.x_bins[this.x_bins.length - 1];

    this.ymin = 0;
    this.ymax = 0;

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {
      if (this.bincontent[bi_it] > this.ymax) {
        this.ymax = this.bincontent[bi_it];
      }
    }
  }

  Scale(sf) {
    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {
      this.bincontent[bi_it] = this.bincontent[bi_it] * sf;
    }
    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {
      if (this.bincontent[bi_it] > this.ymax) {
        this.ymax = this.bincontent[bi_it];
      }
    }
  }

  Copy() {
    return new hist1D(this.x_bins, this.bincontent);
  }

  Add(Other) {
    if (this.bincontent != other.bincontent.length) {
      return;
    }

    for (let bi_it = 0; bi_it < this.bincontent.length; ++bi_it) {
      this.bincontent[bi_it] += other.bincontent[bi_it];
    }
  }

  static FindBin(x_bins, E) {
    if (E < x_bins[0]) {
      return -1;
    }
    if (E >= x_bins[x_bins.length - 1]) {
      return x_bins.length;
    }

    for (let bi_it = 0; bi_it < x_bins.length; ++bi_it) {
      if (E < x_bins[bi_it]) {
        return (bi_it - 1);
      }
    }
  }

  FindBin(E) {
    return hist1D.FindBin(this.x_bins, E);
  }
};

function GetPointList(hist) {
  let points = [];

  points.push([hist.x_bins[0], 0]);

  for (let bi_it = 0; bi_it < (hist.x_bins.length - 1); ++bi_it) {
    points.push([hist.x_bins[bi_it], hist.bincontent[bi_it]]);
    points.push([hist.x_bins[bi_it + 1], hist.bincontent[bi_it]]);
  }

  points.push([hist.x_bins[hist.x_bins.length - 1], 0]);

  return points;
}

class hist2D {
  constructor(x_bins, y_bins, bincontent) {
    if (y_bins.length != (bincontent.length + 1)) {
      console.log(`Failed to build new histogram as y_bins.length: ${y_bins.length} != bincontent.length+1: ${(bincontent.length + 1)}`);
      return;
    }
    if (x_bins.length != (bincontent[0].length + 1)) {
      console.log(`Failed to build new histogram as x_bins.length: ${x_bins.length} != bincontent[0].length+1: ${(bincontent[0].length + 1)}`);
      return;
    }

    this.x_bins = Array.from(x_bins);
    this.y_bins = Array.from(y_bins);
    this.bincontent = bincontent;
  }
  Scale(sf) {
    for (let xbi_it = 0; xbi_it < this.bincontent.length; ++xbi_it) {
      for (let ubi_it = 0; ubi_it < this.bincontent[xbi_it].length; ++ubi_it) {
        this.bincontent[xbi_it][ubi_it] = this.bincontent[xbi_it][ubi_it] * sf;
      }
    }
  }

  static FindBin(bin_edges, val) {
    if (val < bin_edges[0]) {
      return -1;
    }
    if (val >= bin_edges[bin_edges.length - 1]) {
      return bin_edges.length;
    }

    for (let bi_it = 0; bi_it < bin_edges.length; ++bi_it) {
      if (val < bin_edges[bi_it]) {
        return (bi_it - 1);
      }
    }
  }

};
