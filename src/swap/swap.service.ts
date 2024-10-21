import { Injectable } from '@nestjs/common';

@Injectable()
export class SwapService {
  private btcRatePerEth = 0.03; // Replace with real-time rate from API
  private ethToUsdRate = 1500; // Replace with real-time rate from API

  calculateBtc(ethAmount: number): {
    btc: number;
    feeEth: number;
    feeUsd: number;
  } {
    const btc = ethAmount * this.btcRatePerEth;
    const feeEth = ethAmount * 0.03; // 0.03% fee
    const feeUsd = feeEth * this.ethToUsdRate;

    return { btc, feeEth, feeUsd };
  }
}
