const cTable = require('console.table')
const mysql = require('mysql2')
const inquirer = require('inquirer')
const Department = require('./Department')

class Role {
    constructor(title, salary, department_id, id = null) {
        this.id = id
        this.title = title
        this.salary = salary
        this.department_id = department_id
    }

    static createTable(con) {
        return con.promise().query(
            'CREATE TABLE role ( \
                id              INT         AUTO_INCREMENT, \
                title           VARCHAR(30) NOT NULL, \
                salary          DECIMAL     NOT NULL, \
                department_id   INT         NOT NULL, \
                PRIMARY KEY (id), \
                FOREIGN KEY (department_id) REFERENCES `department`(id) \
            );'
        ).then(() => {
            console.log('Table `role` created.')
        }).catch((err) => {
            console.error('Could not create table `role`: ' + err.sqlMessage)
        });
    }

    static seedTable(con) {
        return con.promise().query(
            'INSERT INTO role (title, salary, department_id) VALUES \
                ("Sales Lead", 100000, 1), \
                ("Salesperson", 80000, 1), \
                ("Lead Engineer", 150000, 2), \
                ("Software Engineer", 120000, 2), \
                ("Accountant", 125000, 3), \
                ("Legal Team Lead", 250000, 4), \
                ("Lawyer", 190000, 4) \
            ;'
        ).then(() => {
            console.log('Table `role` seeded.')
        }).catch((err) => {
            console.error('Could not seed table `role`: ' + err.sqlMessage)
        })
    }

    static getAll(con) {
        return con.promise().query('SELECT * FROM role;')
    }

    static printTable(con) {
        Role.getAll(con)
            .then(([rows, fields]) => console.table('role', rows))
    }

    static add(con) {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: "What is the role's title?",
                validate: (input) => (input ? true : "This field is required!")
            },
            {
                type: 'number',
                name: 'salary',
                message: "What is the role's salary?",
                validate: (input) => (input ? true : "This field is required!")
            },
            {
                type: 'list',
                name: 'department_id',
                message: "What is the role's department?",
                choices: () => {
                    return Department.getAll(con).then(([rows, fields]) => {
                        let arr = []
                        let dept;
                        for (dept of rows) {
                            arr.push({
                                name: dept.name,
                                value: dept.id
                            })
                        }
                        return arr
                    })
                }
            }
        ]).then(response => {
            con.promise().execute(
                'INSERT INTO role(title, salary, department_id) VALUES  (?, ?, ?)',
                [response.title, response.salary, response.department_id]
            ).then(() => {
                console.log("Role '" + response.title + "' added.")
            }).catch((err) => {
                console.error('Could not add role: ' + err.sqlMessage)
            })
        })
    }
}

module.exports = Role
