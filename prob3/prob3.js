"use strict";

// prob3.js Is a javascript port of the c++ neutrino oscillation probabiltiy
// calculator, prob3++. Found here:
// http://webhome.phy.duke.edu/~raw22/public/Prob3++/
// Not all functionality or interfaces are yet implemented, but the
// propagateLinear interface seems to work.

const kReal = 0;
const kImaginary = 1;

const kElec = 0;
const kMuon = 1;
const kTau = 2;

const data_type = 0;
const nue_type = 1;
const numu_type = 2;
const nutau_type = 3;
const sterile_type = 4;
const unknown_type = 5;

const standard_type = 0;
const barger_type = 1;

class mosc {
  constructor() {

    this.matrixtype = standard_type;
    this.matterFlavor = nue_type;
    this.putMix = [];

    for (let i = 0; i < 3; ++i) {
      this.putMix[i] = [];
      for (let j = 0; j < 3; ++j) {
        this.putMix[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          this.putMix[i][j][k] = 0;
        }
      }
    }
    this.tworttwoGf = 1.52588e-4;
  }

  /***********************************************************************
    setmass

    Initialize the mass matrices. Values are in eV^2. Pass in the
    differences between the 1st and 2nd eigenvalues and the 2nd and 3rd
    eigenvalues.
  ***********************************************************************/
  setmass(dms21, dms23, dmVacVac) {
    let delta = 5.0e-9;
    let mVac = [];

    mVac[0] = 0.0;
    mVac[1] = dms21;
    mVac[2] = dms21 + dms23;

    /* Break any degeneracies */
    if (dms21 == 0.0) {
      mVac[0] -= delta;
    }
    if (dms23 == 0.0) {
      mVac[2] += delta;
    }

    dmVacVac[0][0] = 0;
    dmVacVac[1][1] = 0;
    dmVacVac[2][2] = 0;
    dmVacVac[0][1] = mVac[0] - mVac[1];
    dmVacVac[1][0] = -dmVacVac[0][1];
    dmVacVac[0][2] = mVac[0] - mVac[2];
    dmVacVac[2][0] = -dmVacVac[0][2];
    dmVacVac[1][2] = mVac[1] - mVac[2];
    dmVacVac[2][1] = -dmVacVac[1][2];
  }

  /***********************************************************************
  setmix

  Initialize the mixing matrix given three mixing angles. CP violation
  is ignored (elements are real). This is the standard form given in the
  Particle Data booklet
***********************************************************************/
  setmix(th12, th13, th23, d, Mix) {

    let s12, s23, s13, c12, c23, c13, sd, cd;

    s12 = Math.sin(th12);
    s23 = Math.sin(th23);
    s13 = Math.sin(th13);
    c12 = Math.cos(th12);
    c23 = Math.cos(th23);
    c13 = Math.cos(th13);
    sd = Math.sin(d);
    cd = Math.cos(d);

    Mix[0][0][kReal] = c12 * c13;
    Mix[0][0][kImaginary] = 0.0;
    Mix[0][1][kReal] = s12 * c13;
    Mix[0][1][kImaginary] = 0.0;
    Mix[0][2][kReal] = s13 * cd;
    Mix[0][2][kImaginary] = -s13 * sd;
    Mix[1][0][kReal] = -s12 * c23 - c12 * s23 * s13 * cd;
    Mix[1][0][kImaginary] = -c12 * s23 * s13 * sd;
    Mix[1][1][kReal] = c12 * c23 - s12 * s23 * s13 * cd;
    Mix[1][1][kImaginary] = -s12 * s23 * s13 * sd;
    Mix[1][2][kReal] = s23 * c13;
    Mix[1][2][kImaginary] = 0.0;
    Mix[2][0][kReal] = s12 * s23 - c12 * c23 * s13 * cd;
    Mix[2][0][kImaginary] = -c12 * c23 * s13 * sd;
    Mix[2][1][kReal] = -c12 * s23 - s12 * c23 * s13 * cd;
    Mix[2][1][kImaginary] = -s12 * c23 * s13 * sd;
    Mix[2][2][kReal] = c23 * c13;
    Mix[2][2][kImaginary] = 0.0;
  }

  /***********************************************************************
    putmix

    Let the user set any kind mixing matrix they want
  ***********************************************************************/
  putmix(Mix) {
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        for (let k = 0; k < 2; ++k) {
          this.putMix[i][j][k] = Mix[i][j][k];
        }
      }
    }
  }

  /***********************************************************************
  Set the mixing matrix used by Barger et. al. This form is not
  "standard" advocated by the Particle Data group but is needed if you
  want to reproduce the plots in the Barger et al. paper
***********************************************************************/
  setmix_barger(th1, th2, th3, d, Mix) {
    let s1, s2, s3, c1, c2, c3, sd, cd;
    s1 = Math.sin(th1);
    s2 = Math.sin(th2);
    s3 = Math.sin(th3);
    c1 = Math.cos(th1);
    c2 = Math.cos(th2);
    c3 = Math.cos(th3);
    sd = Math.sin(d);
    cd = Math.cos(d);
    Mix[0][0][kReal] = c1;
    Mix[0][0][kImaginary] = 0.0;
    Mix[0][1][kReal] = s1 * c3;
    Mix[0][1][kImaginary] = 0.0;
    Mix[0][2][kReal] = s1 * s3;
    Mix[0][2][kImaginary] = 0.0;
    Mix[1][0][kReal] = -s1 * c2;
    Mix[1][0][kImaginary] = 0.0;
    Mix[1][1][kReal] = c1 * c2 * c3 + s2 * s3 * cd;
    Mix[1][1][kImaginary] = s2 * s3 * sd;
    Mix[1][2][kReal] = c1 * c2 * s3 - s2 * c3 * cd;
    Mix[1][2][kImaginary] = -s2 * c3 * sd;
    Mix[2][0][kReal] = -s1 * s2;
    Mix[2][0][kImaginary] = 0.0;
    Mix[2][1][kReal] = c1 * s2 * c3 - c2 * s3 * cd;
    Mix[2][1][kImaginary] = -c2 * s3 * sd;
    Mix[2][2][kReal] = c1 * s2 * s3 + c2 * c3 * cd;
    Mix[2][2][kImaginary] = c2 * c3 * sd;
  }

  /***********************************************************************
    getM

    Compute the matter-mass vector M, dM = M_i-M_j and
    and dMimj. type<0 means anti-neutrinos type>0 means "real" neutrinos
  ***********************************************************************/
  getM(Enu, rho, Mix, dmVacVac, antitype, dmMatMat, dmMatVac) {
    let alpha, beta, gamma, fac = 0.0, arg, tmp;
    let alphaV, betaV, gammaV, argV, tmpV;
    let theta0, theta1, theta2;
    let theta0V, theta1V, theta2V;
    let mMatU = [];
    let mMatV = [];
    let mMat = [];

    /* Equations (22) fro Barger et.al.*/

    /* Reverse the sign of the potential depending on neutrino type */
    if (this.matterFlavor == nue_type) {
      /* If we're doing matter effects for electron neutrinos */
      if (antitype < 0) {
        fac = this.tworttwoGf * Enu * rho; /* Anti-neutrinos */
      } else {
        fac = -this.tworttwoGf * Enu * rho; /* Real-neutrinos */
      }
    } else if (this.matterFlavor == sterile_type) {
      /* If we're doing matter effects for sterile neutrinos */
      if (antitype < 0) {
        fac = -0.5 * this.tworttwoGf * Enu * rho; /* Anti-neutrinos */
      } else {
        fac = 0.5 * this.tworttwoGf * Enu * rho; /* Real-neutrinos */
      }
    }

    /* The strategy to sort out the three roots is to compute the vacuum
     * mass the same way as the "matter" masses are computed then to sort
     * the results according to the input vacuum masses
     */
    alpha = fac + dmVacVac[0][1] + dmVacVac[0][2];
    alphaV = dmVacVac[0][1] + dmVacVac[0][2];

    beta = dmVacVac[0][1] * dmVacVac[0][2] +
           fac * (dmVacVac[0][1] *
                      (1.0 - Mix[kElec][1][kReal] * Mix[kElec][1][kReal] -
                       Mix[kElec][1][kImaginary] * Mix[kElec][1][kImaginary]) +
                  dmVacVac[0][2] *
                      (1.0 - Mix[kElec][2][kReal] * Mix[kElec][2][kReal] -
                       Mix[kElec][2][kImaginary] * Mix[kElec][2][kImaginary]));
    betaV = dmVacVac[0][1] * dmVacVac[0][2];
    gamma = fac * dmVacVac[0][1] * dmVacVac[0][2] *
            (Mix[kElec][0][kReal] * Mix[kElec][0][kReal] +
             Mix[kElec][0][kImaginary] * Mix[kElec][0][kImaginary]);
    gammaV = 0.0;

    /* Compute the argument of the arc-cosine */
    tmp = alpha * alpha - 3.0 * beta;
    tmpV = alphaV * alphaV - 3.0 * betaV;

    /* Equation (21) */
    arg = (2.0 * alpha * alpha * alpha - 9.0 * alpha * beta + 27.0 * gamma) /
          (2.0 * Math.sqrt(tmp * tmp * tmp));
    if (Math.abs(arg) > 1.0) {
      arg = arg / Math.abs(arg);
    }
    argV = (2.0 * alphaV * alphaV * alphaV - 9.0 * alphaV * betaV +
            27.0 * gammaV) /
           (2.0 * Math.sqrt(tmpV * tmpV * tmpV));
    if (Math.abs(argV) > 1.0) {
      argV = argV / Math.abs(argV);
    }

    /* These are the three roots the paper refers to */
    theta0 = Math.acos(arg) / 3.0;
    theta1 = theta0 - (2.0 * Math.PI / 3.0);
    theta2 = theta0 + (2.0 * Math.PI / 3.0);

    theta0V = Math.acos(argV) / 3.0;
    theta1V = theta0V - (2.0 * Math.PI / 3.0);
    theta2V = theta0V + (2.0 * Math.PI / 3.0);

    mMatU[0] = mMatU[1] = mMatU[2] = -(2.0 / 3.0) * Math.sqrt(tmp);
    mMatU[0] *= Math.cos(theta0);
    mMatU[1] *= Math.cos(theta1);
    mMatU[2] *= Math.cos(theta2);
    tmp = dmVacVac[0][0] - alpha / 3.0;
    mMatU[0] += tmp;
    mMatU[1] += tmp;
    mMatU[2] += tmp;

    mMatV[0] = mMatV[1] = mMatV[2] = -(2.0 / 3.0) * Math.sqrt(tmpV);
    mMatV[0] *= Math.cos(theta0V);
    mMatV[1] *= Math.cos(theta1V);
    mMatV[2] *= Math.cos(theta2V);
    tmpV = dmVacVac[0][0] - alphaV / 3.0;
    mMatV[0] += tmpV;
    mMatV[1] += tmpV;
    mMatV[2] += tmpV;

    /* Sort according to which reproduce the vaccum eigenstates */
    for (let i = 0; i < 3; i++) {
      tmpV = Math.abs(dmVacVac[i][0] - mMatV[0]);
      let k = 0;
      for (let j = 1; j < 3; j++) {
        tmp = Math.abs(dmVacVac[i][0] - mMatV[j]);
        if (tmp < tmpV) {
          k = j;
          tmpV = tmp;
        }
      }
      mMat[i] = mMatU[k];
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        dmMatMat[i][j] = mMat[i] - mMat[j];
        dmMatVac[i][j] = mMat[i] - dmVacVac[j][0];
      }
    }

    // console.log("dmMatMat: ", dmMatMat);
    // console.log("dmMatVac: ", dmMatVac);
  }

  get_product(L, E, rho, Mix, dmMatVac, dmMatMat, antitype, product) {
    let n, m, i, j, k;
    let fac = 0.0;

    let twoEHmM = [];
    for (let i = 0; i < 3; i++) {
      twoEHmM[i] = [];
      for (let j = 0; j < 3; j++) {
        twoEHmM[i][j] = [];
        for (let k = 0; k < 3; k++) {
          twoEHmM[i][j][k] = [];
          for (let l = 0; l < 2; l++) {
            twoEHmM[i][j][k][l] = 0;
          }
        }
      }
    }
    /* (1/2)*(1/(h_bar*c)) in units of GeV/(eV^2-km) */

    /* Reverse the sign of the potential depending on neutrino type */
    if (this.matterFlavor == nue_type) {
      /* If we're doing matter effects for electron neutrinos */
      if (antitype < 0) {
        fac = this.tworttwoGf * E * rho; /* Anti-neutrinos */
      } else {
        fac = -this.tworttwoGf * E * rho; /* Real-neutrinos */
      }
    } else if (this.matterFlavor == sterile_type) {
      /* If we're doing matter effects for sterile neutrinos */
      if (antitype < 0) {
        fac = -0.5 * this.tworttwoGf * E * rho; /* Anti-neutrinos */
      } else {
        fac = 0.5 * this.tworttwoGf * E * rho; /* Real-neutrinos */
      }
    }

    /* Calculate the matrix 2EH-M_j */
    for (let n = 0; n < 3; n++) {
      for (let m = 0; m < 3; m++) {
        twoEHmM[n][m][0][kReal] =
            -fac * (Mix[0][n][kReal] * Mix[0][m][kReal] +
                    Mix[0][n][kImaginary] * Mix[0][m][kImaginary]);
        twoEHmM[n][m][0][kImaginary] =
            -fac * (Mix[0][n][kReal] * Mix[0][m][kImaginary] -
                    Mix[0][n][kImaginary] * Mix[0][m][kReal]);
        twoEHmM[n][m][1][kReal] = twoEHmM[n][m][2][kReal] =
            twoEHmM[n][m][0][kReal];
        twoEHmM[n][m][1][kImaginary] = twoEHmM[n][m][2][kImaginary] =
            twoEHmM[n][m][0][kImaginary];

        if (n == m) {
          for (let j = 0; j < 3; j++) {
            twoEHmM[n][m][j][kReal] -= dmMatVac[j][n];
          }
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 2; k++) {
          for (let l = 0; l < 2; l++) {
            product[i][j][k][l] = 0;
          }
        }
      }
    }

    /* Calculate the product in eq.(10) of twoEHmM for j!=k */
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          product[i][j][0][kReal] +=
              twoEHmM[i][k][1][kReal] * twoEHmM[k][j][2][kReal] -
              twoEHmM[i][k][1][kImaginary] * twoEHmM[k][j][2][kImaginary];
          product[i][j][0][kImaginary] +=
              twoEHmM[i][k][1][kReal] * twoEHmM[k][j][2][kImaginary] +
              twoEHmM[i][k][1][kImaginary] * twoEHmM[k][j][2][kReal];

          product[i][j][1][kReal] +=
              twoEHmM[i][k][2][kReal] * twoEHmM[k][j][0][kReal] -
              twoEHmM[i][k][2][kImaginary] * twoEHmM[k][j][0][kImaginary];
          product[i][j][1][kImaginary] +=
              twoEHmM[i][k][2][kReal] * twoEHmM[k][j][0][kImaginary] +
              twoEHmM[i][k][2][kImaginary] * twoEHmM[k][j][0][kReal];

          product[i][j][2][kReal] +=
              twoEHmM[i][k][0][kReal] * twoEHmM[k][j][1][kReal] -
              twoEHmM[i][k][0][kImaginary] * twoEHmM[k][j][1][kImaginary];
          product[i][j][2][kImaginary] +=
              twoEHmM[i][k][0][kReal] * twoEHmM[k][j][1][kImaginary] +
              twoEHmM[i][k][0][kImaginary] * twoEHmM[k][j][1][kReal];
        }
        product[i][j][0][kReal] /= (dmMatMat[0][1] * dmMatMat[0][2]);
        product[i][j][0][kImaginary] /= (dmMatMat[0][1] * dmMatMat[0][2]);
        product[i][j][1][kReal] /= (dmMatMat[1][2] * dmMatMat[1][0]);
        product[i][j][1][kImaginary] /= (dmMatMat[1][2] * dmMatMat[1][0]);
        product[i][j][2][kReal] /= (dmMatMat[2][0] * dmMatMat[2][1]);
        product[i][j][2][kImaginary] /= (dmMatMat[2][0] * dmMatMat[2][1]);
      }
    }
  }

  /***********************************************************************
  getA

  Calculate the transition amplitude matrix A (equation 10)
***********************************************************************/
  getA(L, E, rho, Mix, dmMatVac, dmMatMat, antitype, A, phase_offset) {
    let n, m, i, j, k;
    let fac = 0.0, arg, c, s;

    let X = [];
    let product = [];
    for (let i = 0; i < 3; i++) {
      X[i] = [];
      product[i] = [];
      for (let j = 0; j < 3; j++) {
        X[i][j] = [];
        product[i][j] = [];
        for (let k = 0; k < 3; k++) {
          X[i][j][k] = 0;
          product[i][j][k] = [];
          for (let l = 0; l < 2; l++) {
            product[i][j][k][l] = 0;
          }
        }
      }
    }

    /* (1/2)*(1/(h_bar*c)) in units of GeV/(eV^2-km) */
    let LoEfac = 2.534;

    if (phase_offset == 0.0) {
      this.get_product(L, E, rho, Mix, dmMatVac, dmMatMat, antitype, product);
    }

    /* Make the sum with the exponential factor */
    for (let k = 0; k < 3; k++) {
      arg = -LoEfac * dmMatVac[k][0] * L / E;
      if (k == 2)
        arg += phase_offset;
      c = Math.cos(arg);
      s = Math.sin(arg);
      for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
          X[i][j][kReal] +=
              c * product[i][j][k][kReal] - s * product[i][j][k][kImaginary];
          X[i][j][kImaginary] +=
              c * product[i][j][k][kImaginary] + s * product[i][j][k][kReal];
        }
      }
    }

    /* Compute the product with the mixing matrices */
    for (let n = 0; n < 3; n++) {
      for (let m = 0; m < 3; m++) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            A[n][m][kReal] +=
                Mix[n][i][kReal] * X[i][j][kReal] * Mix[m][j][kReal] +
                Mix[n][i][kReal] * X[i][j][kImaginary] * Mix[m][j][kImaginary] +
                Mix[n][i][kImaginary] * X[i][j][kReal] * Mix[m][j][kImaginary] -
                Mix[n][i][kImaginary] * X[i][j][kImaginary] * Mix[m][j][kReal];
            A[n][m][kImaginary] +=
                Mix[n][i][kImaginary] * X[i][j][kImaginary] *
                    Mix[m][j][kImaginary] +
                Mix[n][i][kImaginary] * X[i][j][kReal] * Mix[m][j][kReal] +
                Mix[n][i][kReal] * X[i][j][kImaginary] * Mix[m][j][kReal] -
                Mix[n][i][kReal] * X[i][j][kReal] * Mix[m][j][kImaginary];
          }
        }
      }
    }
  }

  /***********************************************************************
  setMatterFlavor

  Allow the user to set the flavor used in matter effects (nue or
  nusterile)
***********************************************************************/
  setMatterFlavor(flavor) {
    if (flavor == nue_type) {
      this.matterFlavor = nue_type;
    } else if (flavor == sterile_type) {
      this.matterFlavor = sterile_type;
    }
  }

  /***********************************************************************
  trans2p

  Convert a transition matrix A to transition probabilities
***********************************************************************/
  trans2p(A, P) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        P[i][j] = A[i][j][kReal] * A[i][j][kReal] +
                  A[i][j][kImaginary] * A[i][j][kImaginary];
      }
    }
  }

  /*********************************************************************
  propagate_vac

  Compute the transition matrix after traveling a distance L through the
  vaccum
**********************************************************************/
  propagate_vac(Ain, L, E, Mix, dmVacVac, Aout) {
    let a, b, i, j, k;
    let LoverE = 2.534 * L / E;
    let q;

    let X = [];
    let A = [];
    for (let i = 0; i < 3; ++i) {
      X[i] = [];
      A[i] = [];
      for (let j = 0; j < 3; ++j) {
        X[i][j] = [];
        A[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          X[i][j][k] = 0;
          A[i][j][k] = 0;
          Aout[i][j][k] = 0;
        }
      }
    }

    /* Make the X matrix (eq. 11 simplified since we're in vaccuum) */
    for (let i = 0; i < 3; i++) {
      q = -LoverE * dmVacVac[i][0];
      X[i][i][kReal] = Math.cos(q);
      X[i][i][kImaginary] = Math.sin(q);
    }

    /* Use this to compute A (eq. 10) */
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            A[a][b][kReal] +=
                Mix[a][i][kReal] * X[i][j][kReal] * Mix[b][j][kReal] +
                Mix[a][i][kReal] * X[i][j][kImaginary] * Mix[b][j][kImaginary] +
                Mix[a][i][kImaginary] * X[i][j][kReal] * Mix[b][j][kImaginary] -
                Mix[a][i][kImaginary] * X[i][j][kImaginary] * Mix[b][j][kReal];
            A[a][b][kImaginary] +=
                Mix[a][i][kImaginary] * X[i][j][kImaginary] *
                    Mix[b][j][kImaginary] +
                Mix[a][i][kImaginary] * X[i][j][kReal] * Mix[b][j][kReal] +
                Mix[a][i][kReal] * X[i][j][kImaginary] * Mix[b][j][kReal] -
                Mix[a][i][kReal] * X[i][j][kReal] * Mix[b][j][kImaginary];
          }
        }
      }
    }

    /* Compute product with input transition matrix */
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          Aout[i][j][kReal] += Ain[i][k][kReal] * A[k][j][kReal] -
                               Ain[i][k][kImaginary] * A[k][j][kImaginary];
          Aout[i][j][kImaginary] += Ain[i][k][kImaginary] * A[k][j][kReal] +
                                    Ain[i][k][kReal] * A[k][j][kImaginary];
        }
      }
    }
  }

  propagate_mat(Ain, nelec, L, E, Mix, dmVacVac, antitype, Aend) {
    let i, j, k;
    let make_average = 0;

    let dmMatVac = [];
    let dmMatMat = [];
    let A = [];
    for (let i = 0; i < 3; ++i) {
      dmMatVac[i] = [];
      dmMatMat[i] = [];
      A[i] = [];
      for (let j = 0; j < 3; ++j) {
        dmMatVac[i][j] = 0;
        dmMatMat[i][j] = 0;
        A[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          A[i][j][k] = 0;
          Aend[i][j][k] = 0;
        }
      }
    }

    /* Get the transition matrix for the step across this slab of matter */
    this.getM(E, rho, Mix, dmVacVac, antitype, dmMatMat, dmMatVac);
    this.getA(L, E, rho, Mix, dmMatVac, dmMatMat, antitype, A, make_average);

    /* Compute the product with the input transition matrix */
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          Aend[i][j][kReal] += Ain[i][k][kReal] * A[k][j][kReal] -
                               Ain[i][k][kImaginary] * A[k][j][kImaginary];
          Aend[i][j][kImaginary] += Ain[i][k][kImaginary] * A[k][j][kReal] +
                                    Ain[i][k][kReal] * A[k][j][kImaginary];
        }
      }
    }
  }

  setmix_sin(s12, s23, s13, dcp, Mix) {
    let c12, c23, c13, sd, cd;

    if (s12 > 1.0) {
      s12 = 1.0;
    }
    if (s23 > 1.0) {
      s23 = 1.0;
    }
    if (s13 > 1.0) {
      s13 = 1.0;
    }
    if (cd > 1.0) {
      cd = 1.0;
    }

    sd = Math.sin(dcp);
    cd = Math.cos(dcp);

    c12 = Math.sqrt(1.0 - s12 * s12);
    c23 = Math.sqrt(1.0 - s23 * s23);
    c13 = Math.sqrt(1.0 - s13 * s13);

    if (this.matrixtype == standard_type) {
      Mix[0][0][kReal] = c12 * c13;
      Mix[0][0][kImaginary] = 0.0;
      Mix[0][1][kReal] = s12 * c13;
      Mix[0][1][kImaginary] = 0.0;
      Mix[0][2][kReal] = s13 * cd;
      Mix[0][2][kImaginary] = -s13 * sd;
      Mix[1][0][kReal] = -s12 * c23 - c12 * s23 * s13 * cd;
      Mix[1][0][kImaginary] = -c12 * s23 * s13 * sd;
      Mix[1][1][kReal] = c12 * c23 - s12 * s23 * s13 * cd;
      Mix[1][1][kImaginary] = -s12 * s23 * s13 * sd;
      Mix[1][2][kReal] = s23 * c13;
      Mix[1][2][kImaginary] = 0.0;
      Mix[2][0][kReal] = s12 * s23 - c12 * c23 * s13 * cd;
      Mix[2][0][kImaginary] = -c12 * c23 * s13 * sd;
      Mix[2][1][kReal] = -c12 * s23 - s12 * c23 * s13 * cd;
      Mix[2][1][kImaginary] = -s12 * c23 * s13 * sd;
      Mix[2][2][kReal] = c23 * c13;
      Mix[2][2][kImaginary] = 0.0;
    } else {
      Mix[0][0][kReal] = c12;
      Mix[0][0][kImaginary] = 0.0;
      Mix[0][1][kReal] = s12 * c23;
      Mix[0][1][kImaginary] = 0.0;
      Mix[0][2][kReal] = s12 * s23;
      Mix[0][2][kImaginary] = 0.0;
      Mix[1][0][kReal] = -s12 * c13;
      Mix[1][0][kImaginary] = 0.0;
      Mix[1][1][kReal] = c12 * c13 * c23 + s13 * s23 * cd;
      Mix[1][1][kImaginary] = s13 * s23 * sd;
      Mix[1][2][kReal] = c12 * c13 * s23 - s13 * c23 * cd;
      Mix[1][2][kImaginary] = -s13 * c23 * sd;
      Mix[2][0][kReal] = -s12 * s13;
      Mix[2][0][kImaginary] = 0.0;
      Mix[2][1][kReal] = c12 * s13 * c23 - c13 * s23 * cd;
      Mix[2][1][kImaginary] = -c13 * s23 * sd;
      Mix[2][2][kReal] = c12 * s13 * s23 + c13 * c23 * cd;
      Mix[2][2][kImaginary] = c13 * c23 * sd;
    }
  }
}

class mosc3 {

  constructor() { this.fmosc = new mosc(); }

  reset() {
    this.dm = [];
    for (let i = 0; i < 3; ++i) {
      this.dm[i] = [];
      for (let j = 0; j < 3; ++j) {
        this.dm[i][j] = 0;
      }
    }

    this.mix = [];
    for (let i = 0; i < 3; ++i) {
      this.mix[i] = [];
      for (let j = 0; j < 3; ++j) {
        this.mix[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          this.mix[i][j][k] = 0;
        }
      }
    }

    this.Ain = [];
    for (let i = 0; i < 3; ++i) {
      this.Ain[i] = [];
      for (let j = 0; j < 3; ++j) {
        this.Ain[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          this.Ain[i][j][k] = 0;
        }
      }
    }

    this.dm21 = 0;
    this.Dm2_Atm = 0;
    this.s12 = 0;
    this.s23 = 0;
    this.s31 = 0;
    this.dcp = 0;
  }

  init_mixing_matrix(dm21f, Dm2_Atmf, s12f, s23f, s31f, dcpf) {

    this.reset();

    this.dm21 = dm21f;
    this.Dm2_Atm = Dm2_Atmf;
    this.s12 = s12f;
    this.s23 = s23f;
    this.s31 = s31f;
    this.dcp = dcpf;

    this.fmosc.setMatterFlavor(nue_type);
    this.fmosc.setmix_sin(this.s12, this.s23, this.s31, this.dcp, this.mix);
    this.fmosc.setmass(this.dm21, this.Dm2_Atm, this.dm);
    this.Ain[0][0][kReal] = 1.0;
    this.Ain[1][1][kReal] = 1.0;
    this.Ain[2][2][kReal] = 1.0;

    // console.log(this);
  }

  get_oscillation_parameters(dm21f, Dm2_Atmf, s12f, s23f, s31f, dcpf) {
    dm21f[0] = this.dm21;
    Dm2_Atmf[0] = this.Dm2_Atm;
    s12f[0] = this.s12;
    s23f[0] = this.s23;
    s31f[0] = this.s31;
    dcpf[0] = this.dcp;
  }

  /*
   *   return oscillation length of delta M^23 sector
   */
  get_wavelength_23(energy, lambda23) {
    lambda23[0] = 2.480 * (energy) / Math.abs(this.Dm2_Atm);
  }

  /*
   *   Return real part of mixing matrix
   *   (for calculating oscillation probability in vacuum)
   */
  get_mixing_matrix_real(mixtmp) {
    for (j = 0; j < 3; j++) {
      for (i = 0; i < 3; i++) {
        mixtmp[j][i] = this.mix[j][i][kReal];
      }
    }
  }

  // want to output flavor composition of
  // pure mass eigenstate, state
  convert_from_mass_eigenstate(state, flavor, pure) {

    let lstate = state - 1;
    let factor = (flavor > 0 ? -1. : 1.);
    // need the conjugate for neutrinos but not for
    // anti-neutrinos

    let mass = [];
    for (let i = 0; i < 3; i++) {
      mass[i] = [];
      mass[i][0] = (lstate == i ? 1.0 : 0.);
      mass[i][1] = (0.);
    }

    let conj = [];
    for (let i = 0; i < 3; i++) {
      conj[i] = [];
      for (let j = 0; j < 3; j++) {
        conj[i][j] = [];
        conj[i][j][kReal] = mix[i][j][kReal];
        conj[i][j][kImaginary] = factor * mix[i][j][kImaginary];
      }
    }
    mosc3.multiply_complex_matvec(conj, mass, pure);
  }

  /*
   *   Obtain transition matrix
   */
  get_transition_matrix(nutypei, Enuf, rhof, Lenf, Aout, phase_offsetf) {
    let nutype, make_average;
    let Enu, rho, Len;
    let dmMatVac = [];
    let dmMatMat = [];
    for (let i = 0; i < 3; i++) {
      dmMatVac[i] = [];
      dmMatMat[i] = [];
    }
    nutype = nutypei;
    Enu = Enuf;
    rho = rhof;
    Len = Lenf;
    let phase_offset = phase_offsetf;
    this.fmosc.getM(Enu, rho, this.mix, this.dm, nutype, dmMatMat, dmMatVac);
    this.fmosc.getA(Len, Enu, rho, this.mix, dmMatVac, dmMatMat, nutype, Aout,
                    phase_offset);
  }

  /*
   *   multiply complex 3x3 matrix
   *        C = A X B
   */
  static multiply_complex_matrix(A, B, C) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          C[i][j][kReal] += A[i][k][kReal] * B[k][j][kReal] -
                            A[i][k][kImaginary] * B[k][j][kImaginary];
          C[i][j][kImaginary] += A[i][k][kImaginary] * B[k][j][kReal] +
                                 A[i][k][kReal] * B[k][j][kImaginary];
        }
      }
    }
  }

  /*
   *   multiply complex 3x3 matrix and 3 vector
   *        W = A X V
   */
  static multiply_complex_matvec(A, V, W) {
    for (let i = 0; i < 3; i++) {
      W[i][kReal] = A[i][0][kReal] * V[0][kReal] -
                    A[i][0][kImaginary] * V[0][kImaginary] +
                    A[i][1][kReal] * V[1][kReal] -
                    A[i][1][kImaginary] * V[1][kImaginary] +
                    A[i][2][kReal] * V[2][kReal] -
                    A[i][2][kImaginary] * V[2][kImaginary];
      W[i][kImaginary] = A[i][0][kReal] * V[0][kImaginary] +
                         A[i][0][kImaginary] * V[0][kReal] +
                         A[i][1][kReal] * V[1][kImaginary] +
                         A[i][1][kImaginary] * V[1][kReal] +
                         A[i][2][kReal] * V[2][kImaginary] +
                         A[i][2][kImaginary] * V[2][kReal];
    }
  }

  /*
   *   copy complex 3x3 matrix
   *        A --> B
   */
  static copy_complex_matrix(A, B) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 2; k++) {
          B[i][j][k] = A[i][j][k];
        }
      }
    }
  }

  conjugate_mixing_matrix() {
    let a = [];
    for (let i = 0; i < 3; ++i) {
      a[i] = [];
      for (let j = 0; j < 3; ++j) {
        a[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          a[i][j][k] = 0;
        }
      }
    }

    mosc3.copy_complex_matrix(this.mix, a);

    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        this.mix[i][j][kReal] = a[i][j][kReal];
        this.mix[i][j][kImaginary] = -a[i][j][kImaginary];
      }
    }
  }
  /*
   *   clear complex 3x3 matrix
   *
   */
  static clear_complex_matrix(A) {
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        for (let k = 0; k < 2; ++k) {
          A[i][j][k] = 0;
        }
      }
    }
  }

  get_vacuum_probability(nutype, energy, path, prob) {

    let lovere;
    let s21, s32, s31, ss21, ss32, ss31;
    let ista, iend;

    // make more precise 20081003 rvw
    lovere = 1.26693281 * (path) / (energy);
    s21 = Math.sin(dm21 * lovere);
    s32 = Math.sin(Dm2_Atm * lovere);
    s31 = Math.sin((dm21 + Dm2_Atm) * lovere);
    ss21 = s21 * s21;
    ss32 = s32 * s32;
    ss31 = s31 * s31;

    /* ista = abs(*nutype) - 1 ; */
    for (let ista = 0; ista < 3; ista++) {
      for (let iend = 0; iend < 2; iend++) {
        prob[ista][iend] = mix[ista][0][kReal] * mix[iend][0][kReal] *
                           mix[ista][1][kReal] * mix[iend][1][kReal] * ss21;
        prob[ista][iend] += mix[ista][1][kReal] * mix[iend][1][kReal] *
                            mix[ista][2][kReal] * mix[iend][2][kReal] * ss32;
        prob[ista][iend] += mix[ista][2][kReal] * mix[iend][2][kReal] *
                            mix[ista][0][kReal] * mix[iend][0][kReal] * ss31;
        if (iend == ista) {
          prob[ista][iend] = 1.0 - 4.0 * prob[ista][iend];
        } else {
          prob[ista][iend] = -4.0 * prob[ista][iend];
        }
      }
      prob[ista][2] = 1.0 - prob[ista][0] - prob[ista][1];
    }
  }
}

class BargerPropagator {

  constructor() {
    this.fmosc3 = new mosc3();

    // default is neutral matter
    this.density_convert = 0.5;

    this.Probability = [];
    for (let i = 0; i < 3; i++) {
      this.Probability[i] = [];
      for (let j = 0; j < 3; j++) {
        this.Probability[i][j] = 0;
      }
    }
  }

  SetMNS(x12, x13, x23, m21, mAtm, delta, Energy_, kSquared, kNuType) {
    this.SetEnergy(Energy_);

    let sin12;
    let sin13;
    let sin23;

    let lm32 = mAtm;
    // Dominant Mixing mode assumes the user
    // simply changes the sign of the input atmospheric
    // mixing to invert the hierarchy
    //  so the input for  NH corresponds to m32
    // and the input for  IH corresponds to m31
    if (true /*kOneDominantMass*/) {
      // For the inverted Hierarchy, adjust the input
      // by the solar mixing (should be positive)
      // to feed the core libraries the correct value of m32
      if (mAtm < 0.0) {
        lm32 = mAtm - m21;
      }
    }

    // if xAB = sin( xAB )^2
    if (kSquared) {
      sin12 = Math.sqrt(x12);
      sin13 = Math.sqrt(x13);
      sin23 = Math.sqrt(x23);
    } else {
      // if xAB = sin( 2 xAB )^2
      sin12 = Math.sqrt(0.5 * (1 - Math.sqrt(1 - x12)));
      sin13 = Math.sqrt(0.5 * (1 - Math.sqrt(1 - x13)));
      sin23 = Math.sqrt(0.5 * (1 - Math.sqrt(1 - x23)));
    }

    if (kNuType < 0) {
      delta *= -1.0;
      this.kAntiMNSMatrix = true;
    } else {
      this.kAntiMNSMatrix = false;
    }

    this.fmosc3.init_mixing_matrix(m21, lm32, sin12, sin23, sin13, delta);
  }

  // Crust is 3.3 g/cm^3
  propagateLinear(NuFlavor, pathlength, Density) {

    // console.log(`propagateLinear(${NuFlavor},${pathlength},${Density})`);

    let TransitionMatrix = [];
    let TransitionProduct = [];
    let TransitionTemp = [];
    let RawInputPsi = [];
    let OutputPsi = [];
    for (let i = 0; i < 3; ++i) {
      TransitionMatrix[i] = [];
      TransitionProduct[i] = [];
      TransitionTemp[i] = [];
      RawInputPsi[i] = [];
      OutputPsi[i] = [];
      for (let j = 0; j < 3; ++j) {
        TransitionMatrix[i][j] = [];
        TransitionProduct[i][j] = [];
        TransitionTemp[i][j] = [];
        for (let k = 0; k < 2; ++k) {
          TransitionMatrix[i][j][k] = 0;
          TransitionProduct[i][j][k] = 0;
          TransitionTemp[i][j][k] = 0;
          RawInputPsi[i][k] = 0;
          OutputPsi[i][k] = 0;
        }
      }
    }

    mosc3.clear_complex_matrix(TransitionMatrix);
    mosc3.clear_complex_matrix(TransitionProduct);
    mosc3.clear_complex_matrix(TransitionTemp);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.Probability[i][j] = 0;
      }
    }

    this.fmosc3.get_transition_matrix(
        NuFlavor,
        this.Energy, // in GeV
        Density * this.density_convert,
        pathlength,       // in km
        TransitionMatrix, // Output transition matrix
        0.0);

    mosc3.copy_complex_matrix(TransitionMatrix, TransitionProduct);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        RawInputPsi[j][0] = 0.0;
        RawInputPsi[j][1] = 0.0;
      }

      RawInputPsi[i][0] = 1.0;

      mosc3.multiply_complex_matvec(TransitionProduct, RawInputPsi, OutputPsi);

      this.Probability[i][0] +=
          OutputPsi[0][0] * OutputPsi[0][0] + OutputPsi[0][1] * OutputPsi[0][1];
      this.Probability[i][1] +=
          OutputPsi[1][0] * OutputPsi[1][0] + OutputPsi[1][1] * OutputPsi[1][1];
      this.Probability[i][2] +=
          OutputPsi[2][0] * OutputPsi[2][0] + OutputPsi[2][1] * OutputPsi[2][1];

    } // end of loop on neutrino types
  }

  SetEnergy(x) { this.Energy = x; }

  GetProb(nuIn, nuOut) {
    let p = this.Probability[Math.abs(nuIn) - 1][Math.abs(nuOut) - 1];
    // console.log(`GetProb(${nuIn},${nuOut}) @ E = ${this.Energy} GeV = ${p}`);

    return p;
  }
};
