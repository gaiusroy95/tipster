/**
 * Quick sanity check for Malay odds payouts and winner-market settlement rules.
 * Run: node scripts/verify-bet-math.mjs
 */

function malayReturn(stake, odds) {
  if (odds > 0) return Math.round(stake + stake * odds)
  if (odds < 0) return Math.round(stake + stake / Math.abs(odds))
  return stake
}

function evaluateWinner(selectionIndex, homeScore, awayScore, threeWayWinner = true) {
  const isDraw = homeScore === awayScore
  if (isDraw) {
    if (threeWayWinner && selectionIndex === 1) return 'won'
    return 'void'
  }
  const homeWins = homeScore > awayScore
  if (selectionIndex === 0) return homeWins ? 'won' : 'lost'
  if (threeWayWinner && selectionIndex === 1) return 'lost'
  const awayIndex = threeWayWinner ? 2 : 1
  if (selectionIndex === awayIndex) return homeWins ? 'lost' : 'won'
  return 'lost'
}

let failed = 0

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`)
    failed++
  } else {
    console.log(`OK: ${label}`)
  }
}

console.log('--- Malay return (admin ±1.00 era) ---')
assert('stake 100k @ +1.00 → 200k', malayReturn(100_000, 1) === 200_000)
assert('stake 100k @ -1.00 → 200k', malayReturn(100_000, -1) === 200_000)

console.log('\n--- Malay return (real odds) ---')
assert('stake 25k @ +2.70 → 92.5k', malayReturn(25_000, 2.7) === 92_500)
assert('stake 25k @ -0.65 → 63,462', malayReturn(25_000, -0.65) === 63_462)

console.log('\n--- Winner settlement (3-way) ---')
assert('home win, home pick → won', evaluateWinner(0, 2, 1) === 'won')
assert('away win, away pick → won', evaluateWinner(2, 1, 2) === 'won')
assert('draw, draw pick → won', evaluateWinner(1, 1, 1) === 'won')
assert('draw, home pick → void', evaluateWinner(0, 1, 1) === 'void')
assert('home win, away pick → lost', evaluateWinner(2, 2, 0) === 'lost')

const handicapSuffix = /-(winner|malay|handicap|over_under)-(\d+)(?:-(-?[\d.]+))?$/
const hcpMatch = '0xabc-handicap-0--0.5'.match(handicapSuffix)
assert('handicap line parses -0.5', hcpMatch && hcpMatch[3] === '-0.5')

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`)
process.exit(failed === 0 ? 0 : 1)
