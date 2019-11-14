"use strict";

class flux_matcher {

  constructor(NDFlux) {
    this.mat = lalolib.transpose(lalolib.array2mat(NDFlux.bincontent));
    this.e_bins = Array.from(NDFlux.x_bins);
    this.oa_bins = Array.from(NDFlux.y_bins);
  }


  flux_match(target, regfac = 1E-9, emin = 0, emax = 5, oamax = 33) {

    if (target.bincontent.length != this.mat.m) {
      console.log(`Cannot perform flux match. ND EBin count = ${this.mat.m}, FD EBin count = ${target.bincontent.length}`);
      return;
    }

    let lowbin = target.FindBin(emin);
    let upbin = target.FindBin(emax);

    let bigfac = 1E15;
    let targetvec = lalolib.array2vec(target.bincontent);
    let bigmat = lalolib.entrywisemul(this.mat, bigfac);
    targetvec = lalolib.entrywisemul(targetvec, bigfac);

    let emin_bin = 0;
    let emax_bin = target.bincontent.length;
    if (upbin < target.bincontent.length) {
      emax_bin = upbin + 1;
    }
    if (lowbin > 0) {
      emin_bin = lowbin;
    }

    let upbin_oa = bigmat.n;
    let oamax_bin = hist1D.FindBin(this.oa_bins, oamax);
    if (oamax_bin < (this.oa_bins.length - 1)) {
      upbin_oa = oamax_bin + 1;
    }

    console.log("ERange: ", emin, emax, "Bin range: ", lowbin, upbin, "max oa bin: ", oamax_bin, upbin_oa);

    // console.log("Before slice: ", bigmat, targetvec);

    bigmat = lalolib.get(bigmat, lalolib.range(emin_bin, emax_bin),
      lalolib.range(0, upbin_oa));
    targetvec = lalolib.get(targetvec, lalolib.range(emin_bin, emax_bin));

    // console.log("After slice: ", bigmat, targetvec);

    let RHS = lalolib.mul(lalolib.transpose(bigmat), targetvec);

    // make the penalty matrix
    // there is probably a better way to do this
    // e.g., off-diag
    let A = lalolib.eye(bigmat.n);
    for (let i = 0; i < A.m; i++) {
      for (let j = 0; j < A.n; j++) {
        if (i == j - 1) {
          A[i, j] = -1;
        }
      }
    }

    A = lalolib.entrywisemul(A, bigfac * regfac);
    let LHS = lalolib.add(lalolib.xtx(bigmat), lalolib.xtx(A));
    let result = lalolib.solve(LHS, RHS);
    let smallmat = lalolib.entrywisemul(bigmat, 1.0 / bigfac);

    let bf = new hist1D(target.x_bins.slice(emin_bin, emax_bin + 1),
      lalolib.mul(smallmat, result));
    let coeffs = new hist1D(this.oa_bins.slice(0, upbin_oa + 1),
      result);
    return {
      bf: bf,
      coeffs: coeffs
    };
  }

};
