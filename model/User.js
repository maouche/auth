const { v4 } = require("uuid");
const bcrypt = require("bcrypt");
const { client } = require('../config/database');

class User {

	static create (data, callback) {
		bcrypt.hash(data.password, 10, function(err, hash) {
			client.run(
				"INSERT INTO users(id, email, password, role, created_at, confirmation_token) VALUES(?, ?, ?, ?, ?, ?)", 
				[v4(), data.email, hash, data.role, new Date(), data.confirmation_token], (error) => {
				if(error) throw error
				callback();
			})
		})
	}
	
	static changePassword (data, callback) {
		bcrypt.hash(data.password, 10, function(err, hash) {
			client.run(
				"update users set password=? WHERE id=?", 
				[data.password, data.id], (error) => {
				if(error) throw error
				callback();
			})
		})
	}

	static updateConfirmationToken (data, callback) {
			client.run(
				"update users set confirmation_token=?, confirmed=? WHERE id=?", 
				[data.confirmationToken, data.confirmed, data.id], function (error) {
				if(error) throw error
				callback();
			})
	}

}

module.exports = { User };