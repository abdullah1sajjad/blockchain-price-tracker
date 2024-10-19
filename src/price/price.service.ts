import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Price } from './price.entity';
import Moralis from 'moralis';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PriceService {
  private readonly ethereumChain = '0x1';
  private readonly polygonChain = '0x89';

  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    private readonly configService: ConfigService,
  ) {
    // this.configService.get<string>('MORALIS_API_KEY')
    Moralis.start({
      apiKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImMyYzViNmUzLTUyZjAtNDdkOC04ZmEyLTJiYzQ0NmVkNWE4NiIsIm9yZ0lkIjoiNDEyMjkwIiwidXNlcklkIjoiNDIzNjkzIiwidHlwZUlkIjoiOTUwYzVmZWEtY2RlYy00NTk0LWIyOTktMjg2YWNlZjIwZTRjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjkyNTgzMzIsImV4cCI6NDg4NTAxODMzMn0.OiyLEOjhmSmmA_QIVY-ycxqTYThmPClCAkc76PB5hZQ',
    });
  }

  async getLast24HoursPrices(chain: string): Promise<Price[]> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return await this.priceRepository.find({
      where: {
        chain,
        timestamp: MoreThan(oneDayAgo),
      },
      order: {
        timestamp: 'ASC',
      },
    });
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

  @Cron('*/5 * * * *')
  async handleCron() {
    await this.getPrice('ethereum');
    await this.getPrice('polygon');
  }
}
