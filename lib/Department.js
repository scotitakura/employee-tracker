const cTable = require('console.table')
const mysql = require('mysql2')
const inquirer = require('inquirer')

class Department {
  constructor(name, id = null) {
      this.id = id
      this.name = name
  }

  static createTable(con) {
      return con.promise().query(
          'CREATE TABLE department ( \
              id INT NOT NULL AUTO_INCREMENT, \
              `name` VARCHAR(30) NOT NULL, \
              PRIMARY KEY (id) \
          );'
      ).then(() => {
          console.log('Table `department` created.')
      }).catch((err) => {
          console.error('Could not create table `department`: ' + err.sqlMessage)
      });
  }

  static seedTable(con) {
      return con.promise().query(
          'INSERT INTO department(name) VALUES \
              ("Sales"), \
              ("Engineering"), \
              ("Finance"), \
              ("Legal") \
          ;'
      ).then(() => {
          console.log('Table `department` seeded.')
      }).catch((err) => {
          console.error('Could not seed table `department`: ' + err.sqlMessage)
      })
  }

  static getAll(con) {
      return con.promise().query('SELECT * FROM department;')
  }

  static printTable(con) {
      Department.getAll(con)
          .then(([rows, fields]) => console.table('department', rows))
  }

  static add(con) {
      return inquirer.prompt([{
          type: 'input',
          name: 'name',
          message: "What is the department's name?",
          validate: (input) => (input ? true : "This field is required!")
      }]).then(response => {
          con.promise().execute(
              'INSERT INTO department(name) VALUES (?)',
              [response.name]
          ).then(() => {
              console.log("Department '" + response.name + "' added.")
          }).catch((err) => {
              console.error('Could not add department: ' + err.sqlMessage)
          })
      })
  }
}

module.exports = Department
