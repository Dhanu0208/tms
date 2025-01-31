import React from "react";
import TicketCard from "./TicketCard";

const BoardView = ({ tickets }) => {
  return (
    <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
      {tickets.map((ticket, index) => (
        <TicketCard ticket={ticket} key={index} />
      ))}
    </div>
  );
};

export default BoardView;
