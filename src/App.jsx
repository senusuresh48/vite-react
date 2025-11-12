import { useState, useEffect } from 'react'
import './App.css'
import { cricketPlayers, teams as initialTeams } from './cricketData'

// Fisher-Yates shuffle algorithm to randomize array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function App() {
  // Load saved state from localStorage or use initial values
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('auctionTeams');
    return saved ? JSON.parse(saved) : initialTeams;
  });
  
  // Shuffle players on first load or use saved order, and filter out excluded players
  const [candidates] = useState(() => {
    const saved = localStorage.getItem('shuffledPlayers');
    const savedExcluded = localStorage.getItem('excludedPlayers');
    const excluded = savedExcluded ? JSON.parse(savedExcluded) : [];
    const allPlayers = saved ? JSON.parse(saved) : shuffleArray(cricketPlayers);
    return allPlayers.filter(player => !excluded.includes(player.id));
  });
  
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(() => {
    const saved = localStorage.getItem('currentCandidateIndex');
    return saved ? JSON.parse(saved) : 0;
  });
  
  const [currentBid, setCurrentBid] = useState(() => {
    const saved = localStorage.getItem('currentBid');
    return saved ? JSON.parse(saved) : 0;
  });
  
  const [currentBidder, setCurrentBidder] = useState(() => {
    const saved = localStorage.getItem('currentBidder');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [auctionStarted, setAuctionStarted] = useState(() => {
    const saved = localStorage.getItem('auctionStarted');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [message, setMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showPlayerListModal, setShowPlayerListModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Excluded players - load from localStorage
  const [excludedPlayers, setExcludedPlayers] = useState(() => {
    const saved = localStorage.getItem('excludedPlayers');
    return saved ? JSON.parse(saved) : [];
  });

  // Save teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('auctionTeams', JSON.stringify(teams));
  }, [teams]);

  // Save currentCandidateIndex to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentCandidateIndex', JSON.stringify(currentCandidateIndex));
  }, [currentCandidateIndex]);

  // Save currentBid to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentBid', JSON.stringify(currentBid));
  }, [currentBid]);

  // Save currentBidder to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentBidder', JSON.stringify(currentBidder));
  }, [currentBidder]);

  // Save auctionStarted to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('auctionStarted', JSON.stringify(auctionStarted));
  }, [auctionStarted]);

  // Save shuffled players order to localStorage
  useEffect(() => {
    localStorage.setItem('shuffledPlayers', JSON.stringify(candidates));
  }, [candidates]);

  // Save excludedPlayers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('excludedPlayers', JSON.stringify(excludedPlayers));
  }, [excludedPlayers]);

  const currentCandidate = candidates[currentCandidateIndex];

  const startAuction = () => {
    if (currentCandidateIndex < candidates.length) {
      setAuctionStarted(true);
      setCurrentBid(currentCandidate.initialBid);
      setCurrentBidder(null);
      setMessage(`Auction started for ${currentCandidate.name}!`);
    }
  };

  const placeBid = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    
    // First bid keeps the base price, subsequent bids add 100
    const newBidAmount = currentBidder ? currentBid + 100 : currentBid;

    // Check if team already has max players (8)
    if (team.players.length >= 8) {
      setMessage(`${team.name} already has 8 players (maximum)!`);
      return;
    }

    // Check if team has 7 players and is trying to get 8th before all teams have 7
    if (team.players.length === 7) {
      const allTeamsHave7 = teams.every(t => t.players.length >= 7);
      if (!allTeamsHave7) {
        setMessage(`${team.name} cannot get 8th player until all teams have at least 7 players!`);
        return;
      }
    }

    // Prevent same team from bidding again
    if (currentBidder && currentBidder.id === teamId) {
      setMessage(`${team.name} already has the current bid!`);
      return;
    }

    if (team.points < newBidAmount) {
      setMessage(`${team.name} doesn't have enough points!`);
      return;
    }

    setCurrentBid(newBidAmount);
    setCurrentBidder(team);
    setMessage(`${team.name} bids ${newBidAmount} points!`);
  };

  const soldToCurrentBidder = () => {
    if (!currentBidder) {
      setMessage('No bids placed yet!');
      return;
    }

    // Check if team already has 8 players (max limit)
    if (currentBidder.players.length >= 8) {
      setMessage(`${currentBidder.name} already has 8 players (maximum)!`);
      return;
    }

    // Check if team has 7 players and is trying to get 8th before all teams have 7
    if (currentBidder.players.length === 7) {
      const allTeamsHave7 = teams.every(t => t.players.length >= 7);
      if (!allTeamsHave7) {
        setMessage(`${currentBidder.name} cannot get 8th player until all teams have at least 7 players!`);
        return;
      }
    }

    // Update teams: deduct points and add player
    const updatedTeams = teams.map(team => {
      if (team.id === currentBidder.id) {
        return {
          ...team,
          points: team.points - currentBid,
          players: [...team.players, { ...currentCandidate, soldFor: currentBid }]
        };
      }
      return team;
    });

    setTeams(updatedTeams);
    setMessage(`${currentCandidate.name} SOLD to ${currentBidder.name} for ${currentBid} points!`);
    
    // Move to next candidate
    setTimeout(() => {
      if (currentCandidateIndex < candidates.length - 1) {
        setCurrentCandidateIndex(currentCandidateIndex + 1);
        setAuctionStarted(false);
        setCurrentBid(0);
        setCurrentBidder(null);
        setMessage('Ready for next auction!');
      } else {
        setMessage('Auction Complete! All candidates have been sold.');
        setAuctionStarted(false);
      }
    }, 2000);
  };

  const unsold = () => {
    setMessage(`${currentCandidate.name} went UNSOLD!`);
    
    setTimeout(() => {
      if (currentCandidateIndex < candidates.length - 1) {
        setCurrentCandidateIndex(currentCandidateIndex + 1);
        setAuctionStarted(false);
        setCurrentBid(0);
        setCurrentBidder(null);
        setMessage('Ready for next auction!');
      } else {
        setMessage('Auction Complete!');
        setAuctionStarted(false);
      }
    }, 2000);
  };

  const resetAuction = () => {
    if (window.confirm('Are you sure you want to reset the auction? All progress will be lost.')) {
      // Clear localStorage
      localStorage.removeItem('auctionTeams');
      localStorage.removeItem('currentCandidateIndex');
      localStorage.removeItem('currentBid');
      localStorage.removeItem('currentBidder');
      localStorage.removeItem('auctionStarted');
      localStorage.removeItem('shuffledPlayers');
      localStorage.removeItem('excludedPlayers');
      
      // Reset state and reload page to re-shuffle players
      setTeams(initialTeams);
      setCurrentCandidateIndex(0);
      setCurrentBid(0);
      setCurrentBidder(null);
      setAuctionStarted(false);
      setExcludedPlayers([]);
      setMessage('Auction has been reset!');
      
      // Reload page after a short delay to re-shuffle
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const togglePlayerExclusion = (playerId) => {
    setExcludedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  // Filter players for the modal based on search query
  const getFilteredPlayers = () => {
    return cricketPlayers.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.rating.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Check if player list can be modified (only before auction starts or any bidding)
  const canModifyPlayerList = currentCandidateIndex === 0 && !auctionStarted;

  const isAuctionComplete = currentCandidateIndex >= candidates.length;

  return (
    <div className="app">
      <header className="header">
        {message && (
          <div className="message-banner-inline">
            {message}
          </div>
        )}
        <div className="header-content">
          <div className="header-title">
            <h1>🏏 22 Yard Club Auction 2025</h1>
            <p>Bid wisely, build your dream cricket team!</p>
      </div>
          <div className="header-buttons">
            <button 
              className="btn-update-players" 
              onClick={() => setShowPlayerListModal(true)} 
              title="Update Players List"
              disabled={!canModifyPlayerList}
            >
              📝 Update Players
            </button>
            <button className="btn-reset" onClick={resetAuction} title="Reset Auction">
              🔄 Reset
        </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {!isAuctionComplete && (
          <div className="auction-section">
            <h2>Current Player</h2>
            <div className="candidate-card">
              <div className="candidate-info">
                <h3>{currentCandidate.name}</h3>
                <div className="player-type">
                  <span className="type-icon">
                    {currentCandidate.type === 'Batsman' ? '🏏' : 
                     currentCandidate.type === 'Bowler' ? '⚡' :
                     currentCandidate.type === 'Allrounder' ? '⭐' : '🧤'}
                  </span>
                  <span className="type-label">{currentCandidate.type}</span>
                </div>
                <div className="player-rating">
                  <span 
                    className="rating-badge" 
                    style={{
                      background: currentCandidate.rating === 'Advanced' 
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                        : currentCandidate.rating === 'Intermediate'
                        ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: currentCandidate.rating === 'Beginner' ? 'white' : '#333'
                    }}
                  >
                    {currentCandidate.rating}
                  </span>
                </div>
                <p className="base-price">Base: {currentCandidate.initialBid} pts</p>
              </div>
              
              {auctionStarted ? (
                <div className="bidding-area">
                  <div className="current-bid">
                    <h3>{currentBid} pts</h3>
                    {currentBidder && (
                      <p className="leading-team">
                        {currentBidder.name}
                      </p>
                    )}
                  </div>
                  
                <div className="bid-actions">
                  <button 
                    className="btn-sold" 
                    onClick={soldToCurrentBidder}
                    disabled={!currentBidder}
                  >
                    SOLD
                  </button>
                  {!currentBidder && (
                    <button className="btn-unsold" onClick={unsold}>
                      UNSOLD
                    </button>
                  )}
                </div>
                </div>
              ) : (
                <button className="btn-start" onClick={startAuction}>
                  Start Auction
                </button>
              )}
            </div>
          </div>
        )}

        <div className="teams-section">
          <div className="teams-grid">
            {teams.map(team => {
              const batsmen = team.players.filter(p => p.type === 'Batsman').length;
              const bowlers = team.players.filter(p => p.type === 'Bowler').length;
              const allrounders = team.players.filter(p => p.type === 'Allrounder').length;
              
              return (
                <div 
                  key={team.id} 
                  className={`team-card ${auctionStarted && !isAuctionComplete ? 'bidding-active' : ''}`}
                  style={{ borderColor: team.color }}
                  onClick={() => {
                    if (!auctionStarted || isAuctionComplete) {
                      setSelectedTeam(team);
                    }
                  }}
                >
                  <div className="team-header" style={{ backgroundColor: team.color }}>
                    <h3>{team.name}</h3>
                    <p className="points">{team.points} pts</p>
                  </div>
                  
                  <div className="team-players">
                    <h4>Squad ({team.players.length}/8)</h4>
                    
                    {auctionStarted && !isAuctionComplete ? (
                      <div className="bidding-container">
                        <button 
                          className="btn-bid-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            placeBid(team.id);
                          }}
                          disabled={
                            (currentBidder ? team.points < currentBid + 100 : team.points < currentBid) || 
                            (currentBidder && currentBidder.id === team.id) || 
                            team.players.length >= 8 ||
                            (team.players.length === 7 && !teams.every(t => t.players.length >= 7))
                          }
                        >
                          {currentBidder ? `Bid +100 (${currentBid + 100})` : `Bid (${currentBid})`}
                        </button>
                      </div>
                    ) : (
                      <>
                        {team.players.length === 0 ? (
                          <p className="no-players">No players yet</p>
                        ) : (
                          <div className="player-icons">
                            <div className="icon-group">
                              <span className="icon">🏏</span>
                              <span className="icon-count">{batsmen}</span>
                            </div>
                            <div className="icon-group">
                              <span className="icon">⚡</span>
                              <span className="icon-count">{bowlers}</span>
                            </div>
                            <div className="icon-group">
                              <span className="icon">⭐</span>
                              <span className="icon-count">{allrounders}</span>
                            </div>
                          </div>
                        )}
                        <p className="click-hint">Click to view details</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAuctionComplete && (
        <div className="completion-banner">
          <h2>🎉 Auction Complete!</h2>
          <p>All candidates have been processed.</p>
        </div>
      )}

      {selectedTeam && (
        <div className="modal-overlay" onClick={() => setSelectedTeam(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: selectedTeam.color }}>
              <h2>{selectedTeam.name}</h2>
              <button className="modal-close" onClick={() => setSelectedTeam(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-stats">
                <div className="stat-item">
                  <span className="stat-label">Budget Remaining</span>
                  <span className="stat-value">{selectedTeam.points} pts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Players</span>
                  <span className="stat-value">{selectedTeam.players.length}/8</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Spent</span>
                  <span className="stat-value">
                    {selectedTeam.players.reduce((sum, p) => sum + p.soldFor, 0)} pts
                  </span>
                </div>
              </div>
              
              <div className="modal-players">
                <h3>Squad Details</h3>
                {selectedTeam.players.length === 0 ? (
                  <p className="no-players-modal">No players purchased yet</p>
                ) : (
                  <div className="players-list">
                    {selectedTeam.players.map(player => (
                      <div key={player.id} className="player-card-modal">
                        <div className="player-info-modal">
                          <div className="player-icon-large">
                            {player.type === 'Batsman' ? '🏏' : 
                             player.type === 'Bowler' ? '⚡' :
                             player.type === 'Allrounder' ? '⭐' : '🧤'}
                          </div>
                          <div className="player-details-modal">
                            <h4>{player.name}</h4>
                            <div className="player-meta">
                              <span className="player-type-badge">{player.type}</span>
                              <span 
                                className="player-rating-badge"
                                style={{
                                  background: player.rating === 'Advanced' 
                                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                                    : player.rating === 'Intermediate'
                                    ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: player.rating === 'Beginner' ? 'white' : '#333'
                                }}
                              >
                                {player.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="player-price-modal">{player.soldFor} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPlayerListModal && (
        <div className="modal-overlay" onClick={() => {
          setShowPlayerListModal(false);
          setSearchQuery('');
        }}>
          <div className="modal-content players-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: '#2C3E50' }}>
              <h2>Manage Players List</h2>
              <button className="modal-close" onClick={() => {
                setShowPlayerListModal(false);
                setSearchQuery('');
              }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search by name, type, or rating..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="players-list-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Players</span>
                  <span className="stat-value">{cricketPlayers.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active in Auction</span>
                  <span className="stat-value">{cricketPlayers.length - excludedPlayers.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Excluded</span>
                  <span className="stat-value">{excludedPlayers.length}</span>
                </div>
              </div>
              
              <div className="modal-players">
                <h3>All Players</h3>
                <div className="players-list">
                  {getFilteredPlayers().map(player => {
                    const isExcluded = excludedPlayers.includes(player.id);
                    return (
                      <div 
                        key={player.id} 
                        className={`player-card-modal ${isExcluded ? 'excluded' : ''}`}
                      >
                        <div className="player-info-modal">
                          <div className="player-icon-large">
                            {player.type === 'Batsman' ? '🏏' : 
                             player.type === 'Bowler' ? '⚡' :
                             player.type === 'Allrounder' ? '⭐' : '🧤'}
                          </div>
                          <div className="player-details-modal">
                            <h4>{player.name}</h4>
                            <div className="player-meta">
                              <span className="player-type-badge">{player.type}</span>
                              <span 
                                className="player-rating-badge"
                                style={{
                                  background: player.rating === 'Advanced' 
                                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                                    : player.rating === 'Intermediate'
                                    ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: player.rating === 'Beginner' ? 'white' : '#333'
                                }}
                              >
                                {player.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="player-actions">
                          <span className="player-base-price">{player.initialBid} pts</span>
                          <button 
                            className={`btn-toggle-player ${isExcluded ? 'btn-add' : 'btn-remove'}`}
                            onClick={() => togglePlayerExclusion(player.id)}
                          >
                            {isExcluded ? '✓ Include' : '✕ Exclude'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
