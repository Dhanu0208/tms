import { dbConnection } from "../utils/index.js";

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { title, priority, stage, assets, team } = req.body;
    const connection = await dbConnection();

    const query = `
      INSERT INTO tickets (title, priority, stage, assets, team)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      title,
      priority,
      stage,
      JSON.stringify(assets || []),
      JSON.stringify(team || []),
    ];

    const [result] = await connection.execute(query, values);

    res.status(200).json({
      status: true,
      ticketId: result.insertId,
      message: "Ticket created successfully.",
    });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    res.status(500).json({ status: false, message: "Failed to create ticket" });
  }
};
// export const createTicket = async (req, res) => {
//   const connection = await dbConnection();
//   await connection.beginTransaction(); // Start transaction

//   try {
//     const { title, priority, stage, assets, team } = req.body;

//     // 1️⃣ Insert the ticket into `tickets` table
//     const ticketQuery = `
//       INSERT INTO tickets (title, priority, stage, assets)
//       VALUES (?, ?, ?, ?)
//     `;
//     const [ticketResult] = await connection.execute(ticketQuery, [
//       title,
//       priority,
//       stage,
//       JSON.stringify(Array.isArray(assets) ? assets : [assets]),
//     ]);
//     const ticketId = ticketResult.insertId;
//     if (team && team.length > 0) {
//       const teamQuery = `
//         INSERT INTO ticket_team (ticket_id, user_id) VALUES ?
//       `;
//       const teamValues = team.map((userId) => [ticketId, userId]);
//       await connection.query(teamQuery, [teamValues]);
//     }

//     await connection.commit();
//     res.status(200).json({
//       status: true,
//       ticketId,
//       message: "Ticket created successfully.",
//     });
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error creating ticket:", error.message);
//     res.status(500).json({ status: false, message: "Failed to create ticket" });
//   }
// };

// Create a new subTicket
export const createSubTicket = async (req, res) => {
  try {
    const { id } = req.params; // Ticket ID
    const { title, tag } = req.body;

    const connection = await dbConnection();

    const query = `
        INSERT INTO sub_tickets (ticket_id, title, tag)
        VALUES (?, ?, ?)
      `;

    await connection.execute(query, [id, title, tag]);

    res
      .status(200)
      .json({ status: true, message: "SubTicket added successfully." });
  } catch (error) {
    console.error("Error adding subTicket:", error.message);
    res
      .status(500)
      .json({ status: false, message: "Failed to add subTicket." });
  }
};

// Duplicate a ticket
export const duplicateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await dbConnection();

    const [ticket] = await connection.execute(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );

    if (ticket.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Ticket not found." });
    }

    const { title, priority, stage, assets, team } = ticket[0];

    const query = `
      INSERT INTO tickets (title, priority, stage, assets, team)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [`${title} - Duplicate`, priority, stage, assets, team];

    await connection.execute(query, values);

    res
      .status(200)
      .json({ status: true, message: "Ticket duplicated successfully." });
  } catch (error) {
    console.error("Error duplicating ticket:", error.message);
    res
      .status(500)
      .json({ status: false, message: "Failed to duplicate ticket" });
  }
};

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const connection = await dbConnection();
    const [tickets] = await connection.execute(
      "SELECT * FROM tickets WHERE isTrashed = FALSE"
    );
    res.status(200).json({ status: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    res.status(500).json({ status: false, message: "Failed to fetch tickets" });
  }
};

// Get a ticket by ID
export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await dbConnection();

    const [ticket] = await connection.execute(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );

    if (ticket.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Ticket not found." });
    }

    res.status(200).json({ status: true, ticket: ticket[0] });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    res.status(500).json({ status: false, message: "Failed to fetch ticket" });
  }
};

// Update a ticket
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, stage, assets, team } = req.body;
    const connection = await dbConnection();

    const query = `
      UPDATE tickets
      SET title = ?, priority = ?, stage = ?, assets = ?, team = ?
      WHERE id = ?
    `;
    const values = [
      title,
      priority,
      stage,
      JSON.stringify(assets || []),
      JSON.stringify(team || []),
      id,
    ];

    await connection.execute(query, values);

    res
      .status(200)
      .json({ status: true, message: "Ticket updated successfully." });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
    res.status(500).json({ status: false, message: "Failed to update ticket" });
  }
};

// Move a ticket to trash
export const trashTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await dbConnection();

    await connection.execute(
      "UPDATE tickets SET isTrashed = TRUE WHERE id = ?",
      [id]
    );

    res.status(200).json({ status: true, message: "Ticket moved to trash." });
  } catch (error) {
    console.error("Error trashing ticket:", error.message);
    res.status(500).json({ status: false, message: "Failed to trash ticket" });
  }
};

// Delete or restore tickets
export const deleteRestoreTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;
    const connection = await dbConnection();

    if (actionType === "delete") {
      await connection.execute("DELETE FROM tickets WHERE id = ?", [id]);
    } else if (actionType === "deleteAll") {
      await connection.execute("DELETE FROM tickets WHERE isTrashed = TRUE");
    } else if (actionType === "restore") {
      await connection.execute(
        "UPDATE tickets SET isTrashed = FALSE WHERE id = ?",
        [id]
      );
    } else if (actionType === "restoreAll") {
      await connection.execute(
        "UPDATE tickets SET isTrashed = FALSE WHERE isTrashed = TRUE"
      );
    }

    res
      .status(200)
      .json({ status: true, message: "Operation performed successfully." });
  } catch (error) {
    console.error("Error deleting/restoring ticket:", error.message);
    res
      .status(500)
      .json({ status: false, message: "Failed to process ticket operation" });
  }
};

// Get dashboard statistics
export const dashboardStatistics = async (req, res) => {
  try {
    const connection = await dbConnection();

    const [allTickets] = await connection.execute(
      "SELECT * FROM tickets WHERE isTrashed = FALSE"
    );

    const [groupedTickets] = await connection.execute(
      "SELECT stage, COUNT(*) AS count FROM tickets WHERE isTrashed = FALSE GROUP BY stage"
    );

    const [groupedPriority] = await connection.execute(
      "SELECT priority, COUNT(*) AS count FROM tickets WHERE isTrashed = FALSE GROUP BY priority"
    );

    const [recentTickets] = await connection.execute(
      "SELECT * FROM tickets WHERE isTrashed = FALSE ORDER BY id DESC LIMIT 10"
    );

    const summary = {
      totalTickets: allTickets.length,
      groupedByStage: groupedTickets,
      groupedByPriority: groupedPriority,
      recentTickets,
    };

    res
      .status(200)
      .json({ status: true, message: "Dashboard data retrieved", ...summary });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error.message);
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch dashboard data" });
  }
};

// Add activity to a ticket
// export const postTicketActivity = async (req, res) => {
//   try {
//     const { ticketId, type, activity, byUserId } = req.body;
//     const connection = await dbConnection();

//     const query = `
//         INSERT INTO activities (ticket_id, type, activity, by_user_id)
//         VALUES (?, ?, ?, ?)
//       `;

//     await connection.execute(query, [ticketId, type, activity, byUserId]);

//     res
//       .status(200)
//       .json({ status: true, message: "Activity posted successfully." });
//   } catch (error) {
//     console.error("Error posting activity:", error.message);
//     res.status(500).json({ status: false, message: "Failed to post activity" });
//   }
// };
