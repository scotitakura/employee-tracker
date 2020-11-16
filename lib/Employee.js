const cTable = require('console.table')
const mysql = require('mysql2')
const inquirer = require('inquirer')
const Role = require('./Role')

class Employee {
    constructor(first_name, last_name, role_id, manager_id, id = null) {
        this.id = id
        this.first_name = first_name
        this.last_name = last_name
        this.role_id = role_id
        this.manager_id = manager_id
    }

    static createTable(con) {
        return con.promise().query(
            'CREATE TABLE employee ( \
                id          INT         AUTO_INCREMENT, \
                first_name  VARCHAR(30) NOT NULL, \
                last_name   VARCHAR(30) NOT NULL, \
                role_id     INT         NOT NULL, \
                manager_id  INT, \
                PRIMARY KEY (id), \
                FOREIGN KEY (role_id) REFERENCES role(id), \
                FOREIGN KEY (manager_id) REFERENCES employee(id) \
            );'
        ).then(() => {
            console.log('Table `employee` created.')
        }).catch((err) => {
            console.error('Could not create table `employee`: ' + err.sqlMessage)
        });
    }

    static seedTable(con) {
        return con.promise().query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES \
                ("Ashley", "Rodriguez", 3, NULL), \
                ("Malia", "Brown", 5, NULL), \
                ("Sarah", "Lourd", 6, NULL), \
                ("John", "Doe", 1, 1), \
                ("Mike", "Chan", 2, 4), \
                ("Kevin", "Tupik", 4, 1), \
                ("Tom", "Allen", 7, 3) \
            ;'
        ).then(() => {
            console.log('Table `employee` seeded.')
        }).catch((err) => {
            console.error('Could not seed table `employee`: ' + err.sqlMessage)
        })
    }

    static getAll(con) {
        return con.promise().query('SELECT * FROM employee;')
    }

    static printTable(con) {
        Employee.getAll(con)
            .then(([rows, fields]) => console.table('employee', rows))
    }

    static add(con) {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "What is the employee's first name?",
                validate: (input) => (input ? true : "This field is required!")
            },
            {
                type: 'input',
                name: 'last_name',
                message: "What is the employee's last name?",
                validate: (input) => (input ? true : "This field is required!")
            },
            {
                type: 'list',
                name: 'role_id',
                message: "What is the employee's role?",
                choices: () => {
                    return Role.getAll(con).then(([rows, fields]) => {
                        let arr = []
                        let roll;
                        for (roll of rows) {
                            arr.push({
                                name: roll.title,
                                value: roll.id
                            })
                        }
                        return arr
                    })
                }
            },
            {
                type: 'list',
                name: 'manager_id',
                message: "Who is the employee's manager?",
                choices: () => {
                    return Employee.getAll(con).then(([rows, fields]) => {
                        let arr = [
                            {
                                name: "No manager",
                                value: null
                            }
                        ]
                        let emp;
                        for (emp of rows) {
                            arr.push({
                                name: emp.first_name + ' ' + emp.last_name,
                                value: emp.id
                            })
                        }
                        return arr
                    })
                }
            }
        ]).then(response => {
            con.promise().execute(
                'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES  (?, ?, ?, ?)',
                [response.first_name, response.last_name, response.role_id, response.manager_id]
            ).then(() => {
                console.log("Employee '" + response.first_name + ' ' + response.last_name + "' added.")
            }).catch((err) => {
                console.error('Could not add employee: ' + err.sqlMessage)
            })
        })
    }
}

module.exports = Employee
