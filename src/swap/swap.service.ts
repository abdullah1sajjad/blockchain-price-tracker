import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwapService {
  private feePercentage = 0.03;

  async calculateSwapRate(ethAmount: number) {
    // Get the current ETH to BTC exchange rate (use a real API here)
    const response = await axios.get(
      'https://api.somecryptoapi.com/eth-to-btc',
    );
    const ethToBtcRate = response.data.rate;

    const btcAmount = ethAmount * ethToBtcRate;
    const feeInEth = ethAmount * this.feePercentage;
    const feeInDollars = feeInEth * ethToBtcRate; // Convert fee to USD using the ETH-BTC rate

    return {
      btcAmount,
      fee: {
        eth: feeInEth,
        usd: feeInDollars,
      },
    };
  }
}
