# 🏏 Cricket Auction 2025

A modern, interactive cricket auction application where IPL teams bid on cricket players to build their dream team! Everything fits on one screen - no scrolling needed during active bidding.

## Features

- **Single Screen Layout** - All teams and bidding visible at once, no scrolling required
- **6 IPL Teams** - Each team starts with 10,000 points
- **20+ Cricket Players** - Bid on real cricket players with skill ratings
- **3 Rating Levels** - Beginner, Intermediate, and Advanced players
- **Color-Coded Ratings** - Visual distinction for player skill levels
- **Dynamic Bidding** - Each bid increases by 100 points
- **Real-time Updates** - See points deducted and players assigned instantly
- **Data Persistence** - All auction data is automatically saved and restored on page refresh
- **Reset Functionality** - Easy reset button to start a fresh auction
- **Compact Design** - Beautiful, space-efficient UI
- **Responsive** - Adapts to different screen sizes

## Rating System

Players are categorized into three skill levels with corresponding base prices:

- **Beginner** - 300 points (Purple badge)
- **Intermediate** - 500 points (Teal badge)
- **Advanced** - 800 points (Gold badge)

## How to Play

1. **Start Auction** - Click "Start Auction" button to begin bidding on the current player
2. **Place Bids** - Teams can click their "Bid +100" button to place increasing bids
3. **SOLD** - Once bidding is complete, click "SOLD" to assign the player to the highest bidder
4. **UNSOLD** - If no bids are placed, you can skip the player with "UNSOLD" (disappears after first bid)
5. **Continue** - The app automatically moves to the next player
6. **Reset** - Click the "🔄 Reset" button in the header to start a fresh auction

### Data Persistence

- All auction data is **automatically saved** to your browser's localStorage
- If you **refresh the page**, all data will be restored (teams, players, bids, current player, etc.)
- Data persists until you click the **Reset button** or clear your browser data
- Perfect for long auction sessions where you need to take breaks

## Data Structure

The player data is maintained in a separate file (`cricketData.js`) with the following structure:

### Player Object
```javascript
{
  id: 1,
  name: 'Virat Kohli',
  initialBid: 800,      // Starting bid in points
  rating: 'Advanced'    // Skill level: 'Beginner', 'Intermediate', or 'Advanced'
}
```

### Team Object
```javascript
{
  id: 1,
  name: 'Mumbai Indians',
  points: 10000,     // Budget in points
  color: '#004BA0',  // Team color (used for headers and borders)
  players: []        // Acquired players
}
```

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with flexbox/grid layout

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Rules

- Each team starts with **10,000 points**
- Players have different initial bids based on their rating:
  - Beginner: 300 points
  - Intermediate: 500 points
  - Advanced: 800 points
- Each bid increases by **100 points**
- Teams can only bid if they have enough points
- **Same team cannot bid consecutively** - must wait for another team to outbid
- Once a player is sold, points are deducted from the winning team
- The player is added to the team's roster with their rating and type displayed
- **UNSOLD option disappears** once bidding starts - player must be sold to someone

## Customization

### Adding/Modifying Players

Edit the `src/cricketData.js` file:

```javascript
export const cricketPlayers = [
  { id: 1, name: 'Player Name', initialBid: 500, rating: 'Intermediate' },
  // Add more players...
];
```

Rating options:
- `'Beginner'` - 300 points recommended
- `'Intermediate'` - 500 points recommended
- `'Advanced'` - 800 points recommended

### Modifying Teams

Edit the teams array in `src/cricketData.js`:

```javascript
export const teams = [
  { id: 1, name: 'Team Name', points: 10000, color: '#HEXCOLOR', players: [] },
  // Add more teams...
];
```

**Note:** The layout is optimized for 6 teams in a 3x2 grid. Adding more teams may require CSS adjustments.

### Changing Bid Increment

In `src/App.jsx`, find the `placeBid` function and modify:

```javascript
const newBidAmount = currentBid + 100; // Change 100 to your desired increment
```

### Adjusting Starting Points

In `src/cricketData.js`, modify the `points` value for each team:

```javascript
points: 10000  // Change to your desired starting budget
```

## Sample Data Included

- **20 Cricket Players**:
  - 7 Advanced players (800 pts base)
  - 7 Intermediate players (500 pts base)
  - 6 Beginner players (300 pts base)
- **6 IPL Teams**: Mumbai Indians, Chennai Super Kings, Royal Challengers Bangalore, Kolkata Knight Riders, Delhi Capitals, Rajasthan Royals
- Each team with authentic franchise colors

## Layout

- **Left Panel**: Current player being auctioned with rating and bidding controls
- **Right Panel**: 3x2 grid of teams showing budget and squad
- **Top Bar**: Header with auction title and message banner
- **No Scrolling**: Everything visible on one screen (teams area scrolls only if needed)

## Color Scheme

- **Advanced** - Gold/Orange gradient badges
- **Intermediate** - Teal/Green gradient badges
- **Beginner** - Purple/Blue gradient badges
- Team colors match actual IPL franchises

## License

MIT
