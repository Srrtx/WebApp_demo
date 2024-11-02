const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const con = require("./config/db");
const bodyParser = require("body-parser");
const { run } = require("node:test");
const app = express();

// Middleware
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(
  session({
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({ checkPeriod: 86400000 }),
  })
);

// Routes
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/login.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/login.html"))
);
app.get("/HomepageUser.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/HomepageUser.html"))
);
app.get("/HomepageApprover.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/HomepageApprover.html"))
);
app.get("/HomepageStaff.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/HomepageStaff.html"))
);
app.get("/Register.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/Register.html"))
);
app.get("/request.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/request.html"))
);
app.get("/approverHistory.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/approverHistory.html"))
);
app.get("/dashboard.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/dashboard.html"))
);
app.get("/userHistory.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/userHistory.html"))
);
app.get("/staffHistory.html", (req, res) =>
  res.sendFile(path.join(__dirname, "/view/staffHistory.html"))
);

// API routes
app.get("/api/session", getSessionStatus);
app.get("/api/bookings", getAllBookings);
app.get("/api/completed-bookings", getCompletedBookings);
app.get("/api/room-details", getRoomDetails);
app.get("/api/approver-history", getApproverHistory);
app.get("/api/user-bookings", getUserBookings);
app.get("/api/room-statuses", getRoomStatuses);
app.get("/api/rooms", getAllRooms);
app.get("/api/pending-requests", getPendingRequests);
app.get("/api/resolved-requests", getResolvedRequests);

app.post("/api/book-room", bookRoom);
app.post("/api/approve-booking", approveBooking);
app.post("/api/reject-booking", rejectBooking);
app.post("/Register1", registerUser);
app.post("/login", loginUser);
app.get("/logout", logoutUser);

// Utility routes
app.get("/password/:password", hashPassword);
app.get("/room/:orderingID", getRoomByOrderingID);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Functions

function getSessionStatus(req, res) {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
}

function getAllBookings(req, res) {
  const sql = `
        SELECT b.*, r.room_name, u.firstname, u.lastname
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN users u ON b.user_id = u.user_id
        ORDER BY b.date DESC, b.time_slot;
    `;
  con.query(sql, handleQueryResponse(res));
}

function getCompletedBookings(req, res) {
  const sql = `
        SELECT bh.*, r.room_name, u.firstname, u.lastname
        FROM bookinghistory bh
        JOIN rooms r ON bh.room_id = r.room_id
        JOIN users u ON bh.user_id = u.user_id
        WHERE bh.status IN (0, 1)
        ORDER BY bh.date DESC, bh.time_slot;
    `;
  con.query(sql, handleQueryResponse(res));
}

function getRoomDetails(req, res) {
  const roomId = req.query.roomId;
  const sql = "SELECT * FROM rooms WHERE room_id = ?";
  con.query(sql, [roomId], handleQueryResponse(res));
}

function getApproverHistory(req, res) {
  const approverId = req.session.user.id;
  const sql = `
        SELECT bh.*, r.room_name, u.firstname, u.lastname, u.username
        FROM bookinghistory bh
        JOIN rooms r ON bh.room_id = r.room_id
        JOIN users u ON bh.user_id = u.user_id
        WHERE bh.approver_id = ?
        ORDER BY bh.date DESC, bh.time_slot;
    `;
  con.query(sql, [approverId], handleQueryResponse(res));
}

function getUserBookings(req, res) {
  if (!req.session.user) {
    console.error("User ID not found. Please log in.");
    return res.status(401).json({ error: "User not authenticated" });
  }
  const userId = req.session.user.id;
  console.log("User ID:", userId);
  const sql = `
        SELECT b.*, r.room_name, u.firstname, u.lastname
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN users u ON b.user_id = u.user_id
        WHERE b.user_id = ?
        ORDER BY b.date DESC, b.time_slot;
    `;
  con.query(sql, [userId], handleQueryResponse(res));
}

function getRoomStatuses(req, res) {
  const sql = `
        SELECT 
            SUM(CASE WHEN status_8_10 = 'Free' THEN 1 ELSE 0 END) AS free,
            SUM(CASE WHEN status_8_10 = 'Pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status_8_10 = 'Reserved' THEN 1 ELSE 0 END) AS reserved,
            SUM(CASE WHEN status_8_10 = 'Disabled' THEN 1 ELSE 0 END) AS disabled,
            COUNT(*) AS total
        FROM rooms;
    `;
  con.query(sql, handleQueryResponse(res));
}

function getAllRooms(req, res) {
  const sql = "SELECT * FROM rooms";
  con.query(sql, handleQueryResponse(res));
}

function getPendingRequests(req, res) {
  const sql = "SELECT * FROM bookings WHERE status = 'Pending'";
  con.query(sql, handleQueryResponse(res));
}

function getResolvedRequests(req, res) {
  const sql = `
        SELECT b.*, r.room_name, u.firstname, u.lastname
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN users u ON b.user_id = u.user_id
        WHERE b.status IN ('Approved', 'Rejected')
        ORDER BY b.date DESC, b.time_slot;
    `;
  con.query(sql, handleQueryResponse(res));
}

function bookRoom(req, res) {
  const { userId, roomId, date, timeSlot } = req.body;
  const checkAvailabilitySql = `SELECT * FROM bookings WHERE room_id = ? AND date = ? AND time_slot = ? AND status = 'Pending'`;

  con.query(
    checkAvailabilitySql,
    [roomId, date, timeSlot],
    (err, availability) => {
      if (err) {
        console.error("Error checking room availability:", err);
        return res
          .status(500)
          .json({ error: "Database server error: " + err.message });
      }

      if (availability.length > 0) {
        return res
          .status(400)
          .json({ message: "Room not available at the selected time" });
      }

      const bookingSql = `INSERT INTO bookings (user_id, room_id, date, time_slot, status) VALUES (?, ?, ?, ?, 'Pending')`;
      con.query(
        bookingSql,
        [userId, roomId, date, timeSlot],
        (err, booking) => {
          if (err) {
            console.error("Error booking room:", err);
            return res
              .status(500)
              .json({ error: "Database server error: " + err.message });
          }
          res.json({
            message: "Booking successful",
            bookingId: booking.insertId,
          });
        }
      );
    }
  );
}

function approveBooking(req, res) {
  const { bookingId } = req.body;
  const connection = con.promise().getConnection();

  connection
    .then((conn) => {
      conn.beginTransaction(async (err) => {
        if (err) {
          console.error("Error beginning transaction:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        try {
          const updateSql =
            'UPDATE bookings SET status = "Approved" WHERE booking_id = ?';
          await conn.query(updateSql, [bookingId]);

          const insertHistorySql =
            "INSERT INTO bookinghistory (booking_id, status) SELECT booking_id, status FROM bookings WHERE booking_id = ?";
          await conn.query(insertHistorySql, [bookingId]);

          const deleteSql = "DELETE FROM bookings WHERE booking_id = ?";
          await conn.query(deleteSql, [bookingId]);

          await conn.commit();
          res.send("Booking approved successfully");
        } catch (err) {
          await conn.rollback();
          console.error("Failed to approve booking:", err);
          res.status(500).send("Failed to process booking approval");
        } finally {
          conn.release();
        }
      });
    })
    .catch((err) => {
      console.error("Error getting database connection:", err);
      res.status(500).send("Internal Server Error");
    });
}

function rejectBooking(req, res) {
  const { bookingId } = req.body;
  const connection = con.promise().getConnection();

  connection
    .then((conn) => {
      conn.beginTransaction(async (err) => {
        if (err) {
          console.error("Error beginning transaction:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        try {
          const updateSql =
            'UPDATE bookings SET status = "Rejected" WHERE booking_id = ?';
          await conn.query(updateSql, [bookingId]);

          const insertHistorySql =
            "INSERT INTO bookinghistory (booking_id, status) SELECT booking_id, status FROM bookings WHERE booking_id = ?";
          await conn.query(insertHistorySql, [bookingId]);

          const deleteSql = "DELETE FROM bookings WHERE booking_id = ?";
          await conn.query(deleteSql, [bookingId]);

          await conn.commit();
          res.send("Booking rejected successfully");
        } catch (err) {
          await conn.rollback();
          console.error("Failed to reject booking:", err);
          res.status(500).send("Failed to process booking rejection");
        } finally {
          conn.release();
        }
      });
    })
    .catch((err) => {
      console.error("Error getting database connection:", err);
      res.status(500).send("Internal Server Error");
    });
}

function registerUser(req, res) {
  const { username, password, firstname, lastname } = req.body;

  const checkUsernameQuery = "SELECT username FROM users WHERE username = ?";
  con.query(checkUsernameQuery, [username], async (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Error checking username");
    }
    if (result.length > 0) {
      return res.status(400).send("Username already exists");
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUserQuery =
        "INSERT INTO users (firstname, lastname, username, password, role) VALUES (?, ?, ?, ?, 1)";
      con.query(
        insertUserQuery,
        [firstname, lastname, username, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error registering user:", err);
            return res.status(500).send("Error registering user");
          }
          console.log("User registered successfully:", result.insertId);
          res.json({ redirect: "/HomepageUser.html" });
        }
      );
    } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).send("Error hashing password");
    }
  });
}

function loginUser(req, res) {
  const { username, password } = req.body;
  const userQuery =
    "SELECT user_id, role, password FROM users WHERE username = ?";
  con.query(userQuery, [username], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
    if (results.length === 0) {
      return res
        .status(401)
        .send("Login failed: username or password is incorrect");
    }
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .send("Login failed: incorrect username or password");
    }
    req.session.user = { id: user.user_id, username, role: user.role };
    res.json({
      redirect: `/Homepage${
        user.role === 1 ? "User" : user.role === 2 ? "Approver" : "Staff"
      }.html`,
      isLoggedIn: true,
    });
  });
}

function logoutUser(req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
      res.status(500).send("Cannot clear session");
    } else {
      res.redirect("/");
    }
  });
}

function hashPassword(req, res) {
  const plainPassword = req.params.password;
  bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", error);
      res.status(500).send("Server error hashing password");
    } else {
      res.send(hashedPassword);
    }
  });
}

function getRoomByOrderingID(req, res) {
  const orderingID = req.params.orderingID;
  const sql =
    "SELECT room.room_id, room.room_name, room.status FROM room INNER JOIN booking ON room.room_id = booking.room_id WHERE booking.ordering_id = ?";
  con.query(sql, [orderingID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database server error");
    }
    res.json(results);
  });
}

function handleQueryResponse(res) {
  return (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database server error: " + err.message });
    }
    res.json(results);
  };
}


// ADMIN Route

//Add Room
// API endpoint to insert a new room
app.post("/api/add-room", (req, res) => {
  const { room_name, details, time_slots } = req.body;

  const enable = 1;

  // Determine status based on time_slots
  const status_8_10 = time_slots.includes("8-10") ? "Free" : "Disabled";
  const status_10_12 = time_slots.includes("10-12") ? "Free" : "Disabled";
  const status_13_15 = time_slots.includes("13-15") ? "Free" : "Disabled";
  const status_15_17 = time_slots.includes("15-17") ? "Free" : "Disabled";

  // Example SQL query to insert a new room into the database
  const insertRoomQuery = `INSERT INTO rooms (room_name, details, status_8_10, status_10_12, status_13_15, status_15_17)
         VALUES (?, ?, ?, ?, ?, ?)`;

  // Execute the SQL query with input parameters
  con.query(
    insertRoomQuery,
    [room_name, details, status_8_10, status_10_12, status_13_15, status_15_17],
    (err, result) => {
      if (err) {
        console.error("Error inserting room:", err);
        return res.status(500).json({ error: "Failed to add room" });
      }
      console.log("New room added:", result);
      return res.status(200).json({ message: "Room added successfully" });
    }
  );
});

//Enable/Disabled Rooms
// // PUT route to update room status, enable/disable state, and time slot statuses
// app.put(`/api/rooms/:roomName/:roomId/:statusKey`, (req, res) => {
//   const roomName = req.params.roomName;
//   const roomId = req.params.roomId; 
//   const { statuses } = req.body; 

//   // Prepare SQL query to update room details
//   const sql = `
//   UPDATE rooms 
//   SET  
//       status_8_10 = ?, 
//       status_10_12 = ?, 
//       status_13_15 = ?, 
//       status_15_17 = ? 
//   WHERE 
//       room_name = ? AND
//       room_id = ?
// `;
//   // Prepare values array for the SQL query
//   const values = [
//     statuses.status_8_10 === "Free" ? "Free" : "Disabled",
//     statuses.status_10_12 === "Free" ? "Free" : "Disabled",
//     statuses.status_13_15 === "Free" ? "Free" : "Disabled",
//     statuses.status_15_17 === "Free" ? "Free" : "Disabled",
//     roomName  ,
//     roomId ,
//   ];
//   // Execute the SQL query with prepared values
//   con.query(sql, values, (err, result) => {
//     if (err) {
//       console.error("Error updating room:", err);
//       res.status(500).json({ error: "Failed to update room" });
//       return;
//     }
//     console.log("Room updated successfully");
//     console.log(result);
//     res.status(200).json({ message: "Room updated successfully" });
//   });
// });

// 

// Update room details
app.put('/api/update-room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const { roomName, details } = req.body;

  const updateRoomQuery = `
    UPDATE rooms 
    SET room_name = ?, details = ?
    WHERE room_id = ?
  `;

  con.query(updateRoomQuery, [roomName, details, roomId], (err, result) => {
    if (err) {
      console.error("Error updating room details:", err);
      return res.status(500).json({ error: "Failed to update room details" });
    }
    console.log("Room details updated successfully");
    return res.status(200).json({ message: "Room details updated successfully" });
  });
});
