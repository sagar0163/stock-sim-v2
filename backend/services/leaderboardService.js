const User = require('../models/User');

async function updateLeaderboard() {
  try {
    const pipeline = [
      {
        $unwind: {
          path: "$portfolio",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "stocks",
          localField: "portfolio.symbol",
          foreignField: "symbol",
          as: "stockInfo"
        }
      },
      {
        $unwind: {
          path: "$stockInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          balance: { $first: "$balance" },
          createdAt: { $first: "$createdAt" },
          portfolioValue: {
            $sum: {
              $cond: [
                { $not: ["$portfolio.symbol"] },
                0,
                { $multiply: [
                    "$portfolio.quantity", 
                    { $ifNull: ["$stockInfo.price", "$portfolio.avgPrice"] }
                  ] 
                }
              ]
            }
          },
          invested: {
            $sum: {
              $cond: [
                { $not: ["$portfolio.symbol"] },
                0,
                { $multiply: ["$portfolio.quantity", "$portfolio.avgPrice"] }
              ]
            }
          },
          holdings: {
            $sum: {
              $cond: [
                { $not: ["$portfolio.symbol"] },
                0,
                1
              ]
            }
          }
        }
      },
      {
        $addFields: {
          totalValue: { $add: ["$portfolioValue", "$balance"] }
        }
      },
      {
        $setWindowFields: {
          sortBy: { totalValue: -1 },
          output: {
            rank: { $documentNumber: {} }
          }
        }
      },
      {
        $project: {
          _id: 1,
          userId: "$_id",
          username: 1,
          balance: 1,
          portfolioValue: { $round: ["$totalValue", 2] },
          invested: { $round: ["$invested", 2] },
          pnl: { $round: [{ $subtract: ["$totalValue", 100000] }, 2] },
          pnlPercent: { 
            $round: [
              { $multiply: [{ $divide: [{ $subtract: ["$totalValue", 100000] }, 100000] }, 100] }, 
              2
            ] 
          },
          holdings: 1,
          memberSince: "$createdAt",
          rank: 1,
          lastUpdated: "$$NOW"
        }
      },
      {
        $merge: {
          into: "leaderboards",
          on: "_id",
          whenMatched: "replace",
          whenNotMatched: "insert"
        }
      }
    ];

    await User.aggregate(pipeline);
    console.log(`Leaderboard updated successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

function startLeaderboardCron() {
  // Update every 5 minutes
  setInterval(updateLeaderboard, 5 * 60 * 1000);
  // Also run immediately on startup
  setTimeout(updateLeaderboard, 5000);
}

module.exports = {
  updateLeaderboard,
  startLeaderboardCron
};
