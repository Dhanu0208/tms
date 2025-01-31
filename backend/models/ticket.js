import { dbConnection } from "../utils/db.js";

// Create a new ticket
export const createTicket = async ({
  title,
  priority,
  stage,
  assets,
  team,
}) => {
  try {
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
    return result.insertId;
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    throw error;
  }
};

// Get all tickets
export const getAllTickets = async () => {
  try {
    const connection = await dbConnection();
    const [tickets] = await connection.execute(
      "SELECT * FROM tickets WHERE isTrashed = FALSE"
    );
    const [activities] = await connection.execute("SELECT * FROM activities");
    const [subTickets] = await connection.execute("SELECT * FROM sub_tickets");

    const ticketMap = {};
    tickets.forEach((ticket) => {
      ticketMap[ticket.id] = {
        ...ticket,
        activities: [],
        subTickets: [],
        assets: JSON.parse(ticket.assets || "[]"),
        team: JSON.parse(ticket.team || "[]"),
      };
    });

    activities.forEach((activity) => {
      if (ticketMap[activity.ticket_id]) {
        ticketMap[activity.ticket_id].activities.push(activity);
      }
    });

    subTickets.forEach((subTicket) => {
      if (ticketMap[subTicket.ticket_id]) {
        ticketMap[subTicket.ticket_id].subTickets.push(subTicket);
      }
    });

    return Object.values(ticketMap);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    throw error;
  }
};

// Add activity to a ticket
export const addActivity = async (ticketId, type, activity, byUserId) => {
  try {
    const connection = await dbConnection();
    const query = `
      INSERT INTO activities (ticket_id, type, activity, by_user_id)
      VALUES (?, ?, ?, ?)
    `;
    await connection.execute(query, [ticketId, type, activity, byUserId]);
  } catch (error) {
    console.error("Error adding activity:", error.message);
    throw error;
  }
};

// Add subTicket to a ticket
export const addSubTicket = async (ticketId, title, tag) => {
  try {
    const connection = await dbConnection();
    const query = `
      INSERT INTO sub_tickets (ticket_id, title, tag)
      VALUES (?, ?, ?)
    `;
    await connection.execute(query, [ticketId, title, tag]);
  } catch (error) {
    console.error("Error adding subTicket:", error.message);
    throw error;
  }
};
