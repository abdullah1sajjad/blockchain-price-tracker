import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  price: number;

  @Column()
  tokenName: string;

  @Column()
  tokenSymbol: string;

  @Column()
  tokenAddress: string;

  @Column()
  exchangeName: string;

  @Column({ type: 'decimal', precision: 20, scale: 10, nullable: true })
  pairTotalLiquidityUsd: number;

  @Column({ type: 'decimal', precision: 20, scale: 10, nullable: true })
  percentChange24hr: number;

  @Column({ nullable: true })
  priceLastChangedAtBlock: string;

  @Column()
  timestamp: Date;
}
