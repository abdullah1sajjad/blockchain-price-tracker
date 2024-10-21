import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Price } from './price.entity';
import Moralis from 'moralis';

@Injectable()
export class PriceService {
  private readonly ethereumChain = '0x1';
  private readonly polygonChain = '0x89';

  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

  async getHourlyAverages(): Promise<
    Array<{ hour: string; ethereum: number; polygon: number }>
  > {
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const ethereumPrices = await this.priceRepository.find({
      where: {
        chain: 'ethereum',
        timestamp: Between(startTime, now),
      },
      order: { timestamp: 'ASC' },
    });
    const polygonPrices = await this.priceRepository.find({
      where: {
        chain: 'polygon',
        timestamp: Between(startTime, now),
      },
      order: { timestamp: 'ASC' },
    });

    return this.calculateHourlyAverages(ethereumPrices, polygonPrices);
  }

  private calculateHourlyAverages(
    ethereumPrices: Price[],
    polygonPrices: Price[],
  ): Array<{ hour: string; ethereum: number; polygon: number }> {
    const hourlyData = [];
    const now = new Date();

    // Loop through the last 24 hours starting from the current hour
    for (let i = 0; i < 24; i++) {
      // Calculate the start and end times of the hour, ensuring UTC is used
      const end = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours() - i,
          0,
          0,
          0,
        ),
      );
      const start = new Date(end);
      start.setUTCHours(end.getUTCHours() - 1); // Previous hour start

      // Filter prices within the hour range
      const ethPricesInHour = ethereumPrices.filter(
        (price) =>
          new Date(price.timestamp).getTime() >= start.getTime() &&
          new Date(price.timestamp).getTime() < end.getTime(),
      );
      const polyPricesInHour = polygonPrices.filter(
        (price) =>
          new Date(price.timestamp).getTime() >= start.getTime() &&
          new Date(price.timestamp).getTime() < end.getTime(),
      );

      // Calculate average prices for each hour
      const ethAverage = this.calculateAverage(ethPricesInHour);
      const polyAverage = this.calculateAverage(polyPricesInHour);

      // Formatting the hour as "HH:00" in local UTC
      const adjustedHour = (start.getUTCHours() + 5) % 24;
      const hourString = adjustedHour.toString().padStart(2, '0') + ':00';

      hourlyData.push({
        hour: hourString,
        ethereum: Number(ethAverage.toFixed(8)),
        polygon: Number(polyAverage.toFixed(8)),
      });
    }

    // Return the data in descending order (from current hour to last 24 hours)
    return hourlyData;
  }

  private calculateAverage(prices: Price[]): number {
    if (prices.length === 0) return 0;

    const total = prices.reduce((acc, price) => acc + Number(price.price), 0);
    return total / prices.length;
  }

  async getPrice(chain: string): Promise<number> {
    try {
      const { address, chainId } = this.getChainDetails(chain);

      const response = await Moralis.EvmApi.token.getTokenPrice({
        chain: chainId,
        address,
        include: 'percent_change',
      });

      const priceData = response.raw;

      const price = priceData.usdPrice;
      await this.savePrice(chain, priceData);
      return price;
    } catch (error) {
      throw new HttpException(
        'Error fetching price data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private getChainDetails(chain: string): { address: string; chainId: string } {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return {
          address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
          chainId: this.ethereumChain,
        };
      case 'polygon':
        return {
          address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          chainId: this.polygonChain,
        };
      default:
        throw new HttpException('Unsupported chain', HttpStatus.BAD_REQUEST);
    }
  }

  private async savePrice(chain: string, priceData: any): Promise<void> {
    const newPrice = this.priceRepository.create({
      chain,
      price: priceData.usdPrice,
      tokenName: priceData.tokenName,
      tokenSymbol: priceData.tokenSymbol,
      tokenAddress: priceData.tokenAddress,
      exchangeName: priceData.exchangeName,
      pairTotalLiquidityUsd: parseFloat(priceData.pairTotalLiquidityUsd),
      percentChange24hr: parseFloat(priceData['24hrPercentChange']),
      priceLastChangedAtBlock: priceData.priceLastChangedAtBlock,
      timestamp: new Date(),
    });

    await this.priceRepository.save(newPrice);
  }
}
