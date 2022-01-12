import { SubstrateEvent } from "@subql/types";
import { StakingReward, SumReward } from "../types";
import { Balance } from "@polkadot/types/interfaces";


/**
 * Staking reward handler for blocks after ~6,500,000
 * 
 * @param event Event to inspect
 */
export async function handleStakingRewarded(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, newReward] } } = event;

    // Create staking reward entry
    const entity = new StakingReward(`${event.block.block.header.number}-${event.idx.toString()}`);

    // Populate data
    entity.accountId = account.toString();
    entity.balance = (newReward as Balance).toBigInt();
    entity.date = event.block.timestamp;
    entity.blockHeight = event.block.block.header.number.toNumber();

    // Save entry
    await entity.save();
}


/**
 * Staking reward handler for blocks before ~6,500,000
 * 
 * @param event Event to inspect
 */
export async function handleStakingReward(event: SubstrateEvent): Promise<void> {
    await handleStakingRewarded(event);
}


/**
 * Helper method to create a SumReward entry
 * 
 * @param accountId Wallet address
 * @returns New SumReward object
 */
function createSumReward(accountId: string): SumReward {
    const entity = new SumReward(accountId);
    entity.totalReward = BigInt(0);
    return entity;
}


/**
 * Handler for aggregation of staking rewards after block ~6,500,000
 *  
 * @param event Event to inspect
 */
export async function handleSumRewarded(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, newReward] } } = event;

    // Get or create SumReward entry
    let entity = await SumReward.get(account.toString());
    if (entity === undefined) {
        entity = createSumReward(account.toString());
    }

    // Aggregate data
    entity.totalReward = entity.totalReward + (newReward as Balance).toBigInt();
    entity.blockheight = event.block.block.header.number.toNumber();

    // Save entry
    await entity.save();
}


/**
 * Handler for aggregation of staking rewards before block ~6,500,000
 * 
 * @param event Event to inspect
 */
export async function handleSumReward(event: SubstrateEvent): Promise<void> {
    await handleSumRewarded(event);
}