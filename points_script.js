  // Firebase Configuration (Replace with your actual keys if they are different)
  const firebaseConfig = {
    apiKey: "AIzaSyAgRNYcERmBBYfQcXF0PQA5P-Ifqo6O3to",
    authDomain: "vpl2025-71c32.firebaseapp.com",
    databaseURL: "https://vpl2025-71c32-default-rtdb.firebaseio.com/",
    projectId: "vpl2025-71c32",
    storageBucket: "vpl2025-71c32.firebasestorage.app",
    messagingSenderId: "239331513898",
    appId: "1:239331513898:web:1b0179c03591f6de7a1553"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const matchRef = db.ref("vpl2025/match1"); // Targetting the 'match1' node

// CRITICAL FIX: Helper function to convert player data from Firebase object/array to a simple array
function convertPlayersToArray(playerObject) {
    if (Array.isArray(playerObject)) {
        return playerObject;
    }
    if (typeof playerObject === 'object' && playerObject !== null) {
        // Returns an array of player objects, handling both numerical keys and Firebase push IDs
        return Object.values(playerObject).filter(p => p && p.name);
    }
    return [];
}

// Function to create a row for a Batsman (unchanged)
function addBatsmanRow(player, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    // Data cleaning and type conversion
    const runs = parseInt(player.runs) || 0;
    const balls = parseInt(player.balls) || 0;
    const fours = parseInt(player.fours) || 0;
    const sixes = parseInt(player.sixes) || 0;

    // Calculate Strike Rate (SR = (Runs / Balls) * 100)
    let sr = (balls > 0) ? ((runs / balls) * 100).toFixed(2) : '0.00';

    const row = tableBody.insertRow();

    // 1. Batter (Name)
    row.insertCell(0).innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: #2c3e50; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; justify-content: center; align-items: center; font-size: 12px;">${player.name.charAt(0)}</span>
            <span>${player.name}</span>
        </div>
        <small class="dismissal-info">${player.dismissal || ''}</small>
    `;

    // 2. R, 3. B, 4. 4s, 5. 6s, 6. SR
    row.insertCell(1).textContent = runs;
    row.insertCell(2).textContent = balls;
    row.insertCell(3).textContent = fours;
    row.insertCell(4).textContent = sixes;
    row.insertCell(5).textContent = sr;
}

// Function to create a row for a Bowler (Minor cleanup for robustness)
function addBowlerRow(bowler, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    // Data cleaning and type conversion
    // Use 'overs' from the bowler object (e.g., "5.2" or 5.2)
    const oversStr = String(bowler.overs || '0.0'); 
    const maidens = parseInt(bowler.maidens) || 0;
    const runs = parseInt(bowler.runsConceded || bowler.runs) || 0; // Use runsConceded or runs
    const wickets = parseInt(bowler.wickets) || 0;

    // Economy Calculation: Convert Overs (X.Y) to Total Balls
    const oversParts = oversStr.split('.');
    const completeOvers = parseInt(oversParts[0] || 0);
    const ballsInOver = parseInt(oversParts[1]?.charAt(0) || 0); 
    const totalBalls = (completeOvers * 6) + ballsInOver;

    // Economy = (Runs / Total Balls) * 6
    const economy = (totalBalls > 0) ? ((runs / totalBalls) * 6).toFixed(2) : '0.00';
    
    const row = tableBody.insertRow();
    
    // 1. Bowler (Name)
    row.insertCell(0).textContent = bowler.name;
    // 2. O, 3. M, 4. R, 5. W, 6. Eco
    row.insertCell(1).textContent = oversStr;
    row.insertCell(2).textContent = maidens;
    row.insertCell(3).textContent = runs;
    row.insertCell(4).textContent = wickets;
    row.insertCell(5).textContent = economy;
    
    if (wickets >= 2) {
        row.style.fontWeight = 'bold';
    }
}

// Function to create the HTML row for a player (for Batting, unchanged)
function createPlayerRow(player, teamColor) {
    const playerInitial = player.name ? player.name.split(' ').map(n => n[0]).join('') : '??';
    const runs = parseInt(player.runs) || 0;
    const balls = parseInt(player.balls) || 0;
    let sr = (balls > 0) ? ((runs / balls) * 100).toFixed(2) : '0.00';

    const dismissalText = player.dismissal ? `<div class="dismissal">${player.dismissal}</div>` : '<div class="dismissal-info">Not Out</div>';

    return `
        <tr>
            <td>
                <div class="player-info">
                    <div class="player-avatar" style="background: ${teamColor};">${playerInitial}</div>
                    <div>
                        <div class="player-name">${player.name || "Unknown Player"}</div>
                        ${dismissalText}
                    </div>
                </div>
            </td>
            <td class="stat">${runs}</td>
            <td>${balls}</td>
            <td>${player.fours || 0}</td>
            <td>${player.sixes || 0}</td>
            <td class="strike-rate">${sr}</td>
        </tr>
    `;
}

// Main listener function for Firebase data
matchRef.on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;
    
    // --- 1. Update Hero Section Scores ---
    // (Unchanged logic for score headers)
    document.getElementById("rcbScore").innerText = data.rcbScore || "0/0";
    document.getElementById("rcbOvers").innerText = (data.rcbOvers ? data.rcbOvers : "0.0") + " Overs";
    document.getElementById("pbksScore").innerText = data.pbksScore || "0/0";
    document.getElementById("pbksOvers").innerText = (data.pbksOvers ? data.pbksOvers : "0.0") + " Overs";
    document.getElementById("matchStatus").innerText = data.status || "LIVE";
    document.getElementById("resultBar").innerText = data.result || "Match in progress...";

    // --- 2. Update Detailed Innings Scores & Totals ---
    // (Unchanged logic for inning totals)
    document.getElementById("rcbInningsScore").innerText = `Overs (${data.rcbOvers || '0.0'}) ${data.rcbScore || '0/0'}`;
    document.getElementById("rcbExtras").innerHTML = data.rcbExtras || '0 (b 0, lb 0, w 0, nb 0, p 0)';
    document.getElementById("rcbTotal").innerHTML = `${data.rcbScore || '0/0'} (${data.rcbOvers || '0.0'} Overs, RR: ${data.rcbRr || '0.00'})`;
    
    document.getElementById("pbksInningsScore").innerText = `Overs (${data.pbksOvers || '0.0'}) ${data.pbksScore || '0/0'}`;
    document.getElementById("pbksExtras").innerHTML = data.pbksExtras || '0 (b 0, lb 0, w 0, nb 0, w 0)';
    document.getElementById("pbksTotal").innerHTML = `${data.pbksScore || '0/0'} (${data.pbksOvers || '0.0'} Overs, RR: ${data.pbksRr || '0.00'})`;


    // --- 3. Update RCB Players (Batting) Table ---
    const rcbTableBody = document.getElementById("rcbPlayersTableBody");
    rcbTableBody.innerHTML = "";
    const rcbPlayers = convertPlayersToArray(data.rcbPlayers);
    rcbPlayers.forEach(p => {
        rcbTableBody.innerHTML += createPlayerRow(p, '#000');
    });

    // --- 4. Update PBKS Players (Batting) Table ---
    const pbksTableBody = document.getElementById("pbksPlayersTableBody");
    pbksTableBody.innerHTML = "";
    const pbksPlayers = convertPlayersToArray(data.pbksPlayers);
    pbksPlayers.forEach(p => {
        pbksTableBody.innerHTML += createPlayerRow(p, '#dc143c');
    });

    // ------------------------------------------------------------------
    // ✅ FIX APPLIED: Corrected key names from 'rcbBowlers' to 'rcb_bowlers'
    
    // --- 5. Update RCB Bowlers Table (Bowled against PBKS) ---
    const rcbBowlerBody = document.getElementById("rcbBowlersTableBody"); 
    rcbBowlerBody.innerHTML = "";
    const rcbBowlers = convertPlayersToArray(data.rcb_bowlers); // ⬅️ FIXED KEY
    rcbBowlers.forEach(b => {
        addBowlerRow(b, "rcbBowlersTableBody");
    });
    
    // --- 6. Update PBKS Bowlers Table (Bowled against RCB) ---
    const pbksBowlerBody = document.getElementById("pbksBowlersTableBody"); 
    pbksBowlerBody.innerHTML = "";
    const pbksBowlers = convertPlayersToArray(data.pbks_bowlers); // ⬅️ FIXED KEY
    pbksBowlers.forEach(b => {
        addBowlerRow(b, "pbksBowlersTableBody");
    });
    // ------------------------------------------------------------------
    
    // --- 7. Implement Tab Switching Logic ---
    // (Unchanged logic for tab switching)
    const rcbCard = document.getElementById('rcbScorecard');
    const pbksCard = document.getElementById('pbksScorecard');
    const rcbTab = document.getElementById('rcbInningsTab');
    const pbksTab = document.getElementById('pbksInningsTab');

    rcbTab.onclick = () => {
        rcbCard.style.display = 'block';
        pbksCard.style.display = 'none';
        rcbTab.classList.add('active');
        pbksTab.classList.remove('active');
    };

    pbksTab.onclick = () => {
        pbksCard.style.display = 'block';
        rcbCard.style.display = 'none';
        pbksTab.classList.add('active');
        rcbTab.classList.remove('active');
    };

    // Set default active tab based on which team is currently batting
    if (data.currentBattingTeam === 'PBKS') {
        pbksTab.click();
    } else {
        rcbTab.click();
    }
});