const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express(); // Runs the server
const port = 3000;
const mysql = require('mysql2'); // Connects to the database
const { filter } = require('rxjs');
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'chad',
    password: '12345678',
    database: 'mydB',
});

db.connect((err) => { // Function that connects to the database
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Create
app.post('/create', (req, res) => {
    let details = {
        t_id: req.body.t_id,
        name: req.body.name,
        email: req.body.email,
        type: req.body.type,
        category: req.body.category,
        desc: req.body.desc,
        status: req.body.status,
        priority: req.body.priority,
        employeeAssigned: req.body.employeeAssigned,
        date: req.body.date,
        dateDue: req.body.dateDue,
        dateLastEdit: req.body.dateLastEdit,
        img: req.body.img
    }
    let sql = "INSERT INTO tickets SET ?";
    db.query(sql, details, (error) => {
        if (error) {
            res.send({ status: 'failed', message: '"Successfully failed adding record"' });
        } else {
            res.send({ status: 'success', message: '"Successfully added record"' });
        }
    })

});

// Read
app.get('/read', (req, res) => {
    var sql = "SELECT * from tickets";
    db.query(sql, function (error, result) {
        if (error) {
            console.log("Error");
        } else {
            result.forEach((ticket) => {
                // Convert "desc" BLOB to string
                ticket.desc = keepLineBreaks(ticket.desc);
                if (ticket.img !== null) {
                    // Convert "img" BLOB to string if not null
                    ticket.img = ticket.img = keepLineBreaks(ticket.img);
                } else {
                    ticket.img = ""; // Set img to empty string if it is null
                }
            });
            res.send(result);
        }
    })
});

// Filtered Read
app.get('/filter', (req, res) => {
    const filterStatus = req.query.status || "All";
    const filterType = req.query.type || "All";
    const filterCategory = req.query.category || "All";
    const filterPriority = req.query.priority || "All";

    var sql = "SELECT * from tickets WHERE 1=1";

    // If the values are not All, the filters are added
    if (filterStatus != "All") {
        sql += ` AND status = '${filterStatus}'`;
    }
    if (filterType != "All") {
        sql += ` AND type = '${filterType}'`;
    }
    if (filterCategory != "All") {
        sql += ` AND category = '${filterCategory}'`;
    }
    if (filterPriority != "All") {
        sql += ` AND priority = '${filterPriority}'`;
    }
    db.query(sql, function (error, result) {
        if (error) {
            console.log("Error");
        } else {
            result.forEach((ticket) => {
                // Convert "desc" BLOB to string
                ticket.desc = keepLineBreaks(ticket.desc);
                if (ticket.img !== null) {
                    // Convert "img" BLOB to string if not null
                    ticket.img = ticket.img = keepLineBreaks(ticket.img);
                } else {
                    ticket.img = ""; // Set img to empty string if it is null
                }
            });
            res.send(result);
        }
    })
});

// Sorted Read
app.get('/sort', (req, res) => {
    const sortMethod = req.query.sortMethod;

    var sql = `SELECT * from tickets ORDER BY ${sortMethod} ASC;`;
    db.query(sql, function (error, result) {
        if (error) {
            console.log("Error");
        } else {
            result.forEach((ticket) => {
                // Convert "desc" BLOB to string
                ticket.desc = keepLineBreaks(ticket.desc);
                if (ticket.img !== null) {
                    // Convert "img" BLOB to string if not null
                    ticket.img = ticket.img = keepLineBreaks(ticket.img);
                } else {
                    ticket.img = ""; // Set img to empty string if it is null
                }
            });
            res.send(result);
        }
    })
});

function keepLineBreaks(buffer) {
    if (!buffer || buffer.length === 0) {
        return "";
    }
    return buffer.toString('utf8').replace(/\n/g, '\n');
}

// Update
app.put('/update/:t_id', (req, res) => {
    let sql =
        "UPDATE tickets SET type='" +
        req.body.type +
        "', status='" +
        req.body.status +
        "', priority='" +
        req.body.priority +
        "', employeeAssigned='" +
        req.body.employeeAssigned +
        "', dateDue='" +
        req.body.dateDue +
        "', dateLastEdit='" +
        req.body.dateLastEdit +
        "' WHERE t_id=" +
        req.params.t_id;

    let query = db.query(sql, (error, result) => {
        if (error) {
            res.send({ status: 'failed', message: '"Successfully failed updating record"' });
        } else {
            res.send({ status: 'success', message: '"Successfully updated record"' });
        }
    })
})

// Delete
app.delete('/delete/:id', (req, res) => {
    let sql = "DELETE FROM tickets WHERE t_id=" + req.params.id + "";
    let query = db.query(sql, (error) => {
        if (error) {
            res.send({ status: 'failed', message: '"Successfully failed deleting record"' });
        } else {
            res.send({ status: 'success', message: '"Successfully deleted record"' });
        }
    })
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});