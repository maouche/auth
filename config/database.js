const sqlite3 = require("sqlite3")
const dbname = "main.db"

let client = new sqlite3.Database(dbname, (error) => {
	if (error)
		throw error

	console.log("Database started on " + dbname)
})

client.run(`CREATE TABLE IF NOT EXISTS users (
  id varchar(50) NOT NULL,
  email varchar(250) NOT NULL,
  password varchar(250) NOT NULL,
  role varchar(250) NOT NULL,
  created_at DATETIME,
  confirmation_token varchar(255) NULL,
  confirmed boolean NULL,
  PRIMARY KEY (id)
)`);

let closeDB = () => {
	client.close((error) => {
		if (error)
			throw error

		console.log("Database closed.")
	})
}

module.exports = { client, closeDB }