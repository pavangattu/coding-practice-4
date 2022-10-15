const express = require("express");
const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
let db = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const booksArray = await db.all(getBooksQuery);
  const convertDbObjectToResponseObject = booksArray.map((each) => {
    return {
      playerId: each.player_id,
      playerName: each.player_name,
      jerseyNumber: each.jersey_number,
      role: each.role,
    };
  });
  response.send(convertDbObjectToResponseObject);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;

  const postQuery = `
  INSERT INTO
    cricket_team (player_id,player_name,jersey_number,role)
  VALUES
    (
      '${player_id}',
      '${player_name}',
      '${jersey_number}',
      '${role}'
    );`;

  const postResponse = await db.run(postQuery);
  const playerId = postResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getUniqueQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const uniqueResponse = await db.get(getUniqueQuery);

  function resp(uniqueResponse) {
    return {
      playerId: uniqueResponse.player_id,
      playerName: uniqueResponse.player_name,
      jerseyNumber: uniqueResponse.jersey_number,
      role: uniqueResponse.role,
    };
  }

  response.send(resp(uniqueResponse));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDet = request.body;
  const { player_id, player_name, jersey_number, role } = playerDet;

  const putQuery = `UPDATE cricket_team SET player_id='${playerId}',player_name='${player_name}',jersey_number='${jersey_number}',role='${role}' WHERE player_id=${playerId};`;
  await db.run(putQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
