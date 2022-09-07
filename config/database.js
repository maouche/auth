const sqlite3 = require("sqlite3")

let client = new sqlite3.Database(process.env.DB_NAME, (error) => {
	if (error)
		throw error

	console.log("Database started on " + process.env.DB_NAME)
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